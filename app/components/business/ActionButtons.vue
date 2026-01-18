<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ParsedUIConfig, ButtonType } from '@/types/config';
import { checkButtonPermission, checkButtonShowCondition } from '@/composables/usePermissions';
import { useCustomAction, useDeleteData } from '@/composables/useApi';

const router = useRouter();
const toast = useToast();

// Props 定义
const props = defineProps<{
  uiConfig: ParsedUIConfig;
  row?: Record<string, any>; // 单条数据（行操作）
  selectedRows?: Record<string, any>[]; // 选中数据（批量操作）
  isBatch?: boolean; // 是否批量操作
}>();

// Emits 声明
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// 有权限的按钮列表（计算属性过滤）异步权限校验
const authorizedButtons = ref<ButtonType[]>([]);

// 使用 watchEffect 自动追踪依赖并执行异步操作,写法改进及性能优化
watchEffect(async () => {
  const { actions = [], actionPermission } = props.uiConfig.global;
  
  // 并行请求权限，优化性能
  const permPromises = actions.map(btn => 
    checkButtonPermission(btn, props.uiConfig.model, actionPermission)
  );
  const perms = await Promise.all(permPromises);

  // 过滤有权限且满足显示条件的按钮
  authorizedButtons.value = actions.filter((btn, index) => {
    const hasPerm = perms[index];
    const showCondition = checkButtonShowCondition(
      btn,
      props.row,
      props.uiConfig.global.actionItemCondition
    );
    return hasPerm && showCondition;
  });
});

// 内置按钮配置（协议约定的默认文本、图标）
const builtInButtonConfig = {
  view: {
    label: '查看详情',
    icon: 'ic:outline:visibility',
    variant: 'secondary'
  },
  edit: {
    label: '编辑',
    icon: 'ic:outline:edit',
    variant: 'primary'
  },
  delete: {
    label: '删除',
    icon: 'ic:outline:delete',
    variant: 'destructive'
  }
};

// 获取按钮配置（优先使用模型级自定义配置）
const getButtonConfig = (btn: ButtonType) => {
  const { actionLabel, actionIcon, actionClass } = props.uiConfig.global;
  const pureBtnName = btn.startsWith('custom:') ? btn.slice(7) : btn;

  // 文本（自定义 > 内置 > 按钮名）
  const label = actionLabel?.[pureBtnName] || builtInButtonConfig[btn as keyof typeof builtInButtonConfig]?.label || pureBtnName;

  // 图标（自定义 > 内置）
  const icon = actionIcon?.[pureBtnName] || builtInButtonConfig[btn as keyof typeof builtInButtonConfig]?.icon;

  // 样式（自定义 > 内置）
  const classStr = actionClass?.[pureBtnName] || '';

  // 变体（内置默认值）
  const variant = builtInButtonConfig[btn as keyof typeof builtInButtonConfig]?.variant || 'secondary';

  return { label, icon, classStr, variant };
};

// 处理内置按钮点击
const handleBuiltInButtonClick = (btn: ButtonType) => {
  const { model } = props.uiConfig;
  const id = props.row?.id;

  switch (btn) {
    case 'view':
      if (id) router.push(`/${model}/detail/${id}`);
      break;
    case 'edit':
      if (id) router.push(`/${model}/edit/${id}`);
      break;
    case 'delete':
      handleDelete();
      break;
  }
};

// 处理删除操作（支持单条/批量）
const handleDelete = async () => {
  const { model } = props.uiConfig;
  const ids = props.isBatch 
    ? props.selectedRows?.map(row => row.id) || []
    : [props.row?.id].filter(Boolean);

  if (ids.length === 0) {
    toast.add({ title: '提示', description: '请选择要删除的数据', color: 'info' });
    return;
  }

  // 确认弹窗（遵循协议交互约定）
  const confirm = await UDialogConfirm({
    title: '确认删除',
    description: `确定要删除选中的 ${ids.length} 条数据吗？此操作不可撤销。`,
    variant: 'destructive'
  });

  if (confirm) {
    await useDeleteData(model, ids);
    emit('refresh');
  }
};

// 修复：自定义回调类型约束
type GlobalCallback = (params: {
  data: Record<string, any> | Record<string, any>[];
  api?: string;
  method?: 'GET' | 'POST';
  modelName: string;
}) => void;

// 处理自定义按钮点击（修复回调类型）
const handleCustomButtonClick = async (btn: ButtonType) => {
  const pureBtnName = btn.slice(7);
  const { actionApi, actionMethod, actionCallback } = props.uiConfig.global;
  const api = actionApi?.[pureBtnName];
  const method = actionMethod?.[pureBtnName] || 'POST';
  const callbackName = actionCallback?.[pureBtnName];

  if (callbackName) {
    // 类型安全转换
    const callback = window[callbackName as keyof Window] as unknown as GlobalCallback;
    if (typeof callback === 'function') {
      callback({
        data: props.isBatch ? props.selectedRows || [] : props.row || {},
        api,
        method,
        modelName: props.uiConfig.model
      });
      emit('refresh');
    }
    return;
  }

  // 无回调但有接口，自动发送请求
  if (api) {
    const data = props.isBatch ? { ids: props.selectedRows?.map(row => row.id) } : { id: props.row?.id };
    await useCustomAction(api, data, method);
    emit('refresh');
  }
};

// 按钮点击统一处理
const handleButtonClick = (btn: ButtonType) => {
  if (btn.startsWith('custom:')) {
    handleCustomButtonClick(btn);
  } else {
    handleBuiltInButtonClick(btn);
  }
};


</script>

<template>
  <div class="flex gap-1">
    <template v-for="btn in authorizedButtons" :key="btn">
      <UButton
        class="h-8 px-2"
        size="sm"
        :variant="getButtonConfig(btn).variant"
        :class="getButtonConfig(btn).classStr"
        @click="handleButtonClick(btn)"
      >
        <Icon
          v-if="getButtonConfig(btn).icon"
          :name="getButtonConfig(btn).icon"
          class="mr-1 h-4 w-4"
        />
        <span>{{ getButtonConfig(btn).label }}</span>
      </UButton>
    </template>
  </div>
</template>