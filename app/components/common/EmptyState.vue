<script setup lang="ts">
const props = defineProps<{
  type?: 'data' | 'search' | 'error' | 'loading';
  icon?: string;
  text?: string;
  description?: string;
  btnText?: string;
  onBtnClick?: () => void;
}>();

// 默认配置
const defaultConfig = computed(() => {
  switch (props.type) {
    case 'data':
      return {
        icon: 'ic:outline:dataset',
        text: '暂无数据',
        description: '当前没有符合条件的数据'
      };
    case 'search':
      return {
        icon: 'ic:outline:search_off',
        text: '搜索无结果',
        description: '未找到匹配的内容，请尝试其他关键词'
      };
    case 'error':
      return {
        icon: 'ic:outline:error',
        text: '操作失败',
        description: '服务器请求失败，请稍后重试'
      };
    case 'loading':
      return {
        icon: 'ic:outline:loading',
        text: '加载中',
        description: '正在努力加载数据...'
      };
    default:
      return {
        icon: 'ic:outline:info',
        text: '暂无内容',
        description: ''
      };
  }
});

// 最终配置
const config = computed(() => ({
  icon: props.icon || defaultConfig.value.icon,
  text: props.text || defaultConfig.value.text,
  description: props.description || defaultConfig.value.description
}));
</script>

<template>
  <div class="empty-state flex flex-col items-center justify-center py-12">
    <Icon
      :name="config.icon"
      class="empty-icon text-5xl text-text-placeholder"
    />
    <h3 class="empty-text font-medium">{{ config.text }}</h3>
    <p class="empty-desc text-text-secondary">{{ config.description }}</p>
    <UButton
      v-if="props.btnText"
      variant="primary"
      size="sm"
      class="mt-4"
      @click="props.onBtnClick?.()"
    >
      {{ props.btnText }}
    </UButton>
  </div>
</template>