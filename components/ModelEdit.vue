<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ParsedUIConfig } from '@/types/config';
import { useUIConfig } from '@/composables/useUIConfig';
import { useGetList, useEditData } from '@/composables/useApi';

// Props 定义
const props = defineProps<{
  modelName: string; // 模型标识
  id: string | number; // 主键ID
}>();

// 状态管理
const uiConfig = ref<ParsedUIConfig | null>(null);
const loading = ref(true);
const formData = ref<Record<string, any>>({});

// 页面标题
const pageTitle = computed(() => {
  return `编辑${uiConfig.value?.global.model || props.modelName}`;
});

// 初始化页面（获取配置+数据回显）
const initPage = async () => {
  loading.value = true;
  try {
    // 1. 获取 UI 配置
    const config = await useUIConfig(props.modelName);
    uiConfig.value = config;

    // 2. 获取单条数据（通过 getlist 接口过滤 ID）
    const res = await useGetList({
      model_name: props.modelName,
      page: 1,
      page_size: 1,
      filters: { id: props.id }
    });

    if (res.code === 0 && res.data.list.length > 0) {
      formData.value = { ...res.data.list[0] };
    } else {
      throw new Error(`未找到 ID 为 ${props.id} 的数据`);
    }
  } catch (err) {
    console.error(`${props.modelName} 编辑页初始化失败：`, err);
    // 数据不存在时返回列表页
    navigateTo(`/${props.modelName}`, { replace: true });
  } finally {
    loading.value = false;
  }
};

// 提交编辑
const handleSubmit = async () => {
  if (!uiConfig.value) return;

  loading.value = true;
  try {
    await useEditData(props.modelName, props.id, formData.value);
    // 编辑成功后返回列表页
    navigateTo(`/${props.modelName}`, { replace: true });
  } catch (err) {
    console.error(`${props.modelName} 编辑失败：`, err);
  } finally {
    loading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  navigateTo(`/${props.modelName}`, { replace: true });
};

// 初始化
onMounted(() => {
  initPage();
});
</script>

<template>
  <PageContainer :title="pageTitle">
    <div class="card p-6">
      <DynamicForm
        v-if="uiConfig && !loading"
        v-model="formData"
        :ui-config="uiConfig"
        form-type="edit"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      <div v-else class="loading-state">
        <div class="loading-spinner"/>
        <span class="loading-text">加载中...</span>
      </div>
    </div>
  </PageContainer>
</template>