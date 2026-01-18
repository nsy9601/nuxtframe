<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ParsedUIConfig } from '@/types/config';
import { useUIConfig } from '@/composables/useUIConfig';
import { useAddData } from '@/composables/useApi';
import DynamicForm from '@/components/business/DynamicForm.vue';

// Props 定义
const props = defineProps<{
  modelName: string; // 模型标识
}>();

// 状态管理
const uiConfig = ref<ParsedUIConfig | null>(null);
const loading = ref(true);
const formData = ref<Record<string, any>>({});

// 页面标题
const pageTitle = computed(() => {
  return `新增${uiConfig.value?.global.model || props.modelName}`;
});

// 初始化页面
const initPage = async () => {
  loading.value = true;
  try {
    const config = await useUIConfig(props.modelName);
    uiConfig.value = config;
    formData.value = {};
  } catch (err) {
    console.error(`${props.modelName} 新增页初始化失败：`, err);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!uiConfig.value) return;

  loading.value = true;
  try {
    await useAddData(props.modelName, formData.value);
    // 提交成功后返回列表页
    navigateTo(`/${props.modelName}`, { replace: true });
  } catch (err) {
    console.error(`${props.modelName} 新增失败：`, err);
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
        form-type="add"
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