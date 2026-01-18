<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedUIConfig } from '@/types/config';
import { parseOptions } from '@/utils/tagParser';

// Props 定义（显式类型约束）
const props = defineProps<{
  uiConfig: ParsedUIConfig;
  modelValue: Record<string, any>;
}>();

// Emits 声明（显式事件定义）
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void;
  // 将 search 和 reset 合并为一个联合类型
  (e: 'search' | 'reset'): void;
}>();

// 创建一个代理对象
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleInput = (fieldName: string, value: any) => {
  // 构造新对象，保持单向数据流
  const newValue = { ...props.modelValue, [fieldName]: value }
  emit('update:modelValue', newValue)
}

// 筛选搜索字段（search:true 且排序）
const searchFields = computed(() => {
  return Object.entries(props.uiConfig.fields)
    .filter(([_, config]) => config.search)
    .sort((a, b) => (a[1].sort || 99) - (b[1].sort || 99))
    .map(([fieldName, config]) => ({ fieldName, ...config }));
});

// 默认显示字段数（协议约定默认3）
const defaultShowCount = computed(() => props.uiConfig.global.searchDefaultCount || 3);

// 使用useCookie管理搜索展开状态，替代localStorage
const searchExpandedCookie = useCookie(`search_expanded_${props.uiConfig.model}`, {
  default: () => false
});

// 展开状态（从cookie获取）
const isExpanded = ref(searchExpandedCookie.value);

// 监听展开状态变化，同步到cookie
watch(isExpanded, (val) => {
  searchExpandedCookie.value = val;
});

// 可见的搜索字段
const visibleFields = computed(() => {
  if (isExpanded.value || searchFields.value.length <= defaultShowCount.value) {
    return searchFields.value;
  }
  return searchFields.value.slice(0, defaultShowCount.value);
});

// 输入变化同步到父组件
const handleInput = (fieldName: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [fieldName]: value });
};

// 重置搜索
const handleReset = () => {
  const emptyForm = Object.fromEntries(
    searchFields.value.map(({ fieldName }) => [fieldName, ''])
  );
  emit('update:modelValue', emptyForm);
  emit('reset');
};

// 获取默认提示语（按协议操作符规则）
const getDefaultPlaceholder = (op: string, label: string) => {
  const placeholderMap: Record<string, string> = {
    eq: `等于${label}...`,
    ne: `不等于${label}...`,
    like: `包含${label}关键词...`,
    notlike: `不包含${label}关键词...`,
    gt: `大于${label}...`,
    gte: `大于等于${label}...`,
    lt: `小于${label}...`,
    lte: `小于等于${label}...`,
    range: `${label}区间...`,
    in: `输入多个${label}（逗号分隔）...`,
    isnull: `${label}为空`,
    isnotnull: `${label}不为空`
  };
  return placeholderMap[op] || `请输入${label}`;
};

// 解析静态选项（遵循协议数据源规范）
const parseStaticOptions = (optionsStr?: string) => {
  if (!optionsStr) return [];
  return parseOptions(optionsStr);
};
</script>

<template>
  <UCard class="p-4 mb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 搜索字段（v-for 与 v-if 分离） -->
      <template v-for="field in visibleFields" :key="field.fieldName">
        <div class="col-span-1">
          <UFormGroup
            class="w-full"
            :label="field.label || field.fieldName"
            :required="field.required"
          >
            <!-- 动态渲染组件（遵循协议组件映射规则） -->
            <Component
              :is="field.type || 'UInput'"
              v-model="internalValue[field.fieldName]" 
              class="w-full"
              :class="field.uiClass"
              :placeholder="field.searchPlaceholder || getDefaultPlaceholder(field.op || 'eq', field.label || field.fieldName)"
              :multiple="field.multiple"
              :options="field.options ? parseStaticOptions(field.options) : undefined"
              @update:model-value="handleInput(field.fieldName, $event)"
            />
          </UFormGroup>
        </div>
      </template>

      <!-- 展开/收起按钮 -->
      <template v-if="searchFields.length > defaultShowCount">
        <div class="flex items-end">
          <UButton
            class="h-10"
            variant="ghost"
            size="sm"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? '收起' : `展开更多（${searchFields.length - defaultShowCount}个）` }}
          </UButton>
        </div>
      </template>

      <!-- 操作按钮 -->
      <div class="flex items-end gap-2">
        <UButton
          class="h-10"
          type="primary"
          size="sm"
          @click="emit('search')"
        >
          <Icon name="ic:outline:search" class="mr-1" />
          搜索
        </UButton>
        <UButton
          class="h-10"
          variant="ghost"
          size="sm"
          @click="handleReset"
        >
          <Icon name="ic:outline:refresh" class="mr-1" />
          重置
        </UButton>
      </div>
    </div>
  </UCard>
</template>