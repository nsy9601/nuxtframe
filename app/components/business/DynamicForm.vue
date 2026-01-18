<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { z } from 'zod';
import type { ParsedUIConfig, FieldConfig } from '@/types/config';
import { parseOptions } from '@/utils/tagParser';
import { useDynamicOptions } from '@/composables/useApi';
import { evaluateExpression } from '@/composables/useFormatter';

// Props 定义
const props = defineProps<{
  uiConfig: ParsedUIConfig;
  modelValue: Record<string, any>;
  formType: 'add' | 'edit' | 'detail';
  loading?: boolean;
}>();

// Emits 声明
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void;
  (e: 'submit' | 'cancel'): void;
  (e: 'validate', isValid: boolean): void;
}>();

// 表单数据（代理 props，避免直接修改）
const formData = ref<Record<string, any>>({ ...props.modelValue });

// 监听 props 变化，同步表单数据（编辑/详情页回显）
watch(() => props.modelValue, (val) => {
  formData.value = { ...val };
}, { deep: true });

// 监听表单数据变化，同步到父组件
watch(formData, (val) => {
  emit('update:modelValue', val);
}, { deep: true });

// 表单字段配置（过滤 form:false 且按状态显示）
const formFields = computed(() => {
  return Object.entries(props.uiConfig.fields)
    .filter(([_, config]) => {
      // 过滤 form:false 的字段
      if (config.form === false) return false;
      // 按表单状态过滤显隐
      if (props.formType === 'add' && config.addHidden) return false;
      if (props.formType === 'edit' && config.editHidden) return false;
      if (props.formType === 'detail' && config.detailHidden) return false;
      return true;
    })
    .sort((a, b) => (a[1].sort || 99) - (b[1].sort || 99))
    .map(([fieldName, config]) => ({ fieldName, ...config }));
});

// 动态选项缓存（避免重复请求）
const dynamicOptions = ref<Record<string, any[]>>({});
// 动态选项加载状态
const optionsLoading = ref<Record<string, boolean>>({});

// 解析静态选项（遵循协议规范）
const getStaticOptions = (optionsStr?: string) => {
  if (!optionsStr) return [];
  // 混合模式（静态+动态）处理
  if (optionsStr.includes('api:')) {
    const [staticPart, _] = optionsStr.split(',');
    const staticOpts = parseOptions(staticPart);
    return staticOpts;
  }
  return parseOptions(optionsStr);
};

// 获取动态选项（支持依赖字段联动）
const fetchDynamicOptions = async (field: { fieldName: string; config: FieldConfig }) => {
  const { api, depend, apiParams, labelKey = 'label', valueKey = 'value', apiMethod = 'GET' } = field.config;
  if (!api) return;

  // 依赖字段变化时重新请求
  const dependFields = Array.isArray(depend) ? depend : depend ? [depend] : [];
  const dependValues = dependFields.map(key => formData.value[key]);

  // 生成缓存键（包含依赖字段值）
  const cacheKey = `${field.fieldName}_${dependValues.join('_')}`;
  if (dynamicOptions.value[cacheKey]) {
    dynamicOptions.value[field.fieldName] = dynamicOptions.value[cacheKey];
    return;
  }

  optionsLoading.value[field.fieldName] = true;
  try {
    // 解析动态参数（支持表达式）
    const parsedParams = Object.entries(apiParams || {}).reduce((obj, [key, val]) => {
      if (typeof val === 'string' && val.startsWith('{{') && val.endsWith('}}')) {
        obj[key] = evaluateExpression(val, { formData: formData.value });
      } else {
        obj[key] = val;
      }
      return obj;
    }, {} as Record<string, any>);

    // 请求动态选项
    const res = await useDynamicOptions(api, parsedParams, apiMethod);
    if (res.code === 0) {
      // 映射 labelKey 和 valueKey
      const mappedOptions = res.data.map(item => ({
        label: item[labelKey],
        value: item[valueKey],
        disabled: item.disabled,
        color: item.color
      }));
      dynamicOptions.value[cacheKey] = mappedOptions;
      dynamicOptions.value[field.fieldName] = mappedOptions;

      // 混合模式：合并静态选项
      if (field.config.options?.includes('api:')) {
        const staticOpts = getStaticOptions(field.config.options.split(',')[0]);
        dynamicOptions.value[field.fieldName] = [...staticOpts, ...mappedOptions];
      }
    }
  } catch (err) {
    console.error(`获取 ${field.config.label} 选项失败：`, err);
    dynamicOptions.value[field.fieldName] = [];
  } finally {
    optionsLoading.value[field.fieldName] = false;
  }
};

// 依赖字段监听（触发动态选项刷新）
formFields.value.forEach(field => {
  const { depend } = field.config;
  if (depend) {
    const dependFields = Array.isArray(depend) ? depend : [depend];
    dependFields.forEach(key => {
      watch(() => formData.value[key], () => {
        fetchDynamicOptions(field);
      });
    });
  }
});

// 初始化动态选项
onMounted(() => {
  formFields.value.forEach(field => {
    if (field.config.api) {
      fetchDynamicOptions(field);
    }
  });

  // 初始化默认值（仅新增表单）
  if (props.formType === 'add') {
    formFields.value.forEach(({ fieldName, config }) => {
      if (config.default !== undefined) {
        let defaultValue = config.default;
        // 解析动态默认值表达式
        if (typeof defaultValue === 'string' && defaultValue.startsWith('{{') && defaultValue.endsWith('}}')) {
          defaultValue = evaluateExpression(defaultValue, { formData: formData.value });
        }
        // 特殊处理 now（当前时间戳）
        if (defaultValue === 'now') {
          defaultValue = Math.floor(Date.now() / 1000);
        }
        formData.value[fieldName] = defaultValue;
      }
    });
  }
});

// 解析校验规则（转换为 Zod 规则）
const parseValidationRules = (rulesStr?: string) => {
  if (!rulesStr) return z.any();

  const rules = rulesStr.split(';').filter(Boolean);
  let zodSchema = z.any();

  rules.forEach(rule => {
    // 处理自定义提示语（规则=提示语）
    const [rulePart, message] = rule.split('=');
    const [ruleName, ruleParams] = rulePart.split(':');

    switch (ruleName) {
      case 'required':
        zodSchema = zodSchema.refine(val => val !== undefined && val !== null && val !== '', {
          message: message || '此字段为必填项'
        });
        break;
      case 'email':
        zodSchema = zodSchema.email({ message: message || '请输入有效的邮箱地址' });
        break;
      case 'phone':
        zodSchema = zodSchema.refine(val => /^1[3-9]\d{9}$/.test(val), {
          message: message || '请输入有效的手机号'
        });
        break;
      case 'number':
        zodSchema = zodSchema.number({ message: message || '请输入数字' });
        break;
      case 'integer':
        zodSchema = zodSchema.int({ message: message || '请输入整数' });
        break;
      case 'len':{
        const [lenMin, lenMax] = (ruleParams || '').split(',');
        if (lenMax) {
          zodSchema = zodSchema.refine(val => val.length >= Number(lenMin) && val.length <= Number(lenMax), {
            message: message || `长度必须在 ${lenMin}-${lenMax} 之间`
          });
        } else {
          zodSchema = zodSchema.refine(val => val.length === Number(lenMin), {
            message: message || `长度必须为 ${lenMin} 个字符`
          });
        }}
        break;
      case 'min':
        zodSchema = zodSchema.refine(val => {
          if (typeof val === 'number') return val >= Number(ruleParams);
          return val.length >= Number(ruleParams);
        }, {
          message: message || `最小值为 ${ruleParams}`
        });
        break;
      case 'max':
        zodSchema = zodSchema.refine(val => {
          if (typeof val === 'number') return val <= Number(ruleParams);
          return val.length <= Number(ruleParams);
        }, {
          message: message || `最大值为 ${ruleParams}`
        });
        break;
      case 'regex':{
        const regex = new RegExp(ruleParams || '');
        zodSchema = zodSchema.refine(val => regex.test(val), {
          message: message || '格式不正确'
        });}
        break;
      case 'enum':{
        const enumValues = (ruleParams || '').split(',');
        zodSchema = zodSchema.refine(val => enumValues.includes(String(val)), {
          message: message || `必须是 ${enumValues.join('、')} 中的一项`
        });}
        break;
    }
  });

  return zodSchema;
};

// 表单校验
const validateForm = async () => {
  const errors: Record<string, string> = {};

  // 逐字段校验
  for (const { fieldName, config } of formFields.value) {
    if (config.rules) {
      const schema = parseValidationRules(config.rules);
      const result = await schema.safeParseAsync(formData.value[fieldName]);
      if (!result.success) {
        errors[fieldName] = result.error.issues[0].message;
      }
    }
  }

  // 触发校验结果回调
  const isValid = Object.keys(errors).length === 0;
  emit('validate', isValid);
  return { isValid, errors };
};

// 提交表单
const handleSubmit = async () => {
  const { isValid } = await validateForm();
  if (isValid) {
    emit('submit');
  }
};

// 判断字段是否禁用
const isFieldDisabled = (config: FieldConfig) => {
  if (props.formType === 'detail') return true;

  // 全局禁用
  if (config.disabled !== undefined) {
    if (typeof config.disabled === 'string' && config.disabled.startsWith('{{') && config.disabled.endsWith('}}')) {
      return evaluateExpression(config.disabled, { formData: formData.value }) || false;
    }
    return config.disabled;
  }

  // 按状态禁用
  if (props.formType === 'add' && config.addDisabled) {
    if (typeof config.addDisabled === 'string' && config.addDisabled.startsWith('{{') && config.addDisabled.endsWith('}}')) {
      return evaluateExpression(config.addDisabled, { formData: formData.value }) || false;
    }
    return config.addDisabled;
  }

  if (props.formType === 'edit' && config.editDisabled) {
    if (typeof config.editDisabled === 'string' && config.editDisabled.startsWith('{{') && config.editDisabled.endsWith('}}')) {
      return evaluateExpression(config.editDisabled, { formData: formData.value, row: props.modelValue }) || false;
    }
    return config.editDisabled;
  }

  return false;
};

// 获取表单占位符
const getPlaceholder = (config: FieldConfig) => {
  if (config.placeholder !== undefined) return config.placeholder;
  return `请输入${config.label || '内容'}`;
};
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <template v-for="field in formFields" :key="field.fieldName">
      <div
        :class="[
          'form-item',
          field.config.span ? `grid-cols-${field.config.span}` : 'grid-cols-24',
          field.config.formClass
        ]"
      >
        <UFormGroup
          :label="field.config.label || field.fieldName"
          :required="field.config.required"
          :class="field.config.uiClass"
          :style="{ 'width': field.config.formLabelWidth ? `${field.config.formLabelWidth}` : 'auto' }"
        >
          <!-- 动态渲染组件 -->
          <Component
            :is="field.config.type || 'UInput'"
            v-model="formData[field.fieldName]"
            :placeholder="getPlaceholder(field.config)"
            :disabled="isFieldDisabled(field.config)"
            :readonly="field.config.readonly || props.formType === 'detail'"
            :options="field.config.options 
              ? field.config.api 
                ? dynamicOptions[field.fieldName] || [] 
                : getStaticOptions(field.config.options)
              : undefined"
            :loading="optionsLoading[field.fieldName]"
            :rows="field.config.type === 'UTextarea' ? field.config.rows || 3 : undefined"
            :class="field.config.uiClass"
            @update:model-value="(val) => formData[field.fieldName] = val"
          />
          <p v-if="field.config.tooltip" class="form-hint">
            <UTooltip :content="field.config.tooltip" placement="top">
              <Icon name="ic:outline:info" class="inline mr-1" />
              {{ field.config.tooltip }}
            </UTooltip>
          </p>
        </UFormGroup>
      </div>
    </template>

    <!-- 表单操作按钮 -->
    <div class="flex justify-end gap-3 mt-6">
      <UButton
        variant="ghost"
        :disabled="props.loading"
        @click="emit('cancel')"
      >
        取消
      </UButton>
      <UButton
        type="primary"
        :disabled="props.loading"
        @click="handleSubmit"
      >
        <Icon name="ic:outline:save" class="mr-1" />
        {{ props.formType === 'add' ? '新增' : props.formType === 'edit' ? '保存' : '确认' }}
      </UButton>
    </div>
  </form>
</template>