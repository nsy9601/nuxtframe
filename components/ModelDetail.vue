<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ParsedUIConfig } from '@/types/config';
import { useUIConfig } from '@/composables/useUIConfig';
import { useGetList } from '@/composables/useApi';
import DetailView from '@/components/business/DetailView.vue';

// Props 定义
const props = defineProps<{
  modelName: string; // 模型标识
  id: string | number; // 主键ID
}>();

// 状态管理
const uiConfig = ref<ParsedUIConfig | null>(null);
const loading = ref(true);
const detailData = ref<Record<string, any>>({});

// 页面标题
const pageTitle = computed(() => {
  return `查看${uiConfig.value?.global.model || props.modelName}`;
});

// 初始化页面
const initPage = async () => {
  loading.value = true;
  try {
    // 1. 获取 UI 配置
    const config = await useUIConfig(props.modelName);
    uiConfig.value = config;

    // 2. 获取单条数据
    const res = await useGetList({
      model_name: props.modelName,
      page: 1,
      page_size: 1,
      filters: { id: props.id }
    });

    if (res.code === 0 && res.data.list.length > 0) {
      detailData.value = { ...res.data.list[0] };
    } else {
      throw new Error(`未找到 ID 为 ${props.id} 的数据`);
    }
  } catch (err) {
    console.error(`${props.modelName} 详情页初始化失败：`, err);
    navigateTo(`/${props.modelName}`, { replace: true });
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  initPage();
});
</script>

<template>
  <PageContainer :title="pageTitle">
    <DetailView
      v-if="uiConfig && !loading"
      v-model="detailData"
      :ui-config="uiConfig"
      :loading="loading"
    />
    <div v-else class="loading-state">
      <div class="loading-spinner"/>
      <span class="loading-text">加载中...</span>
    </div>
  </PageContainer>
</template>