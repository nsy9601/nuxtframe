<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ParsedUIConfig } from '@/types/config';
import { useUIConfig, clearUIConfigCache } from '@/composables/useUIConfig';
import { useGetList } from '@/composables/useApi';
import SearchBar from '@/components/business/SearchBar.vue';
import DataTable from '@/components/business/DataTable.vue';

// Props 定义
const props = defineProps<{
  modelName: string; // 模型标识（如 'sysuser'）
}>();

// 状态管理
const uiConfig = ref<ParsedUIConfig | null>(null);
const loading = ref(true);
const dataList = ref<Record<string, any>[]>([]);
const total = ref(0);
const searchForm = ref<Record<string, any>>({});
const selectedRows = ref<Record<string, any>[]>([]);

// 分页排序参数
const pageParams = ref({
  page: 1,
  page_size: 10,
  sort: ''
});

// 页面标题（从 UI 配置提取）
const pageTitle = computed(() => {
  return uiConfig.value?.global.model || props.modelName;
});

// 初始化页面
const initPage = async () => {
  loading.value = true;
  try {
    // 获取 UI 配置（优先缓存）
    const config = await useUIConfig(props.modelName);
    uiConfig.value = config;

    // 初始化搜索表单（设置默认值）
    const searchFields = Object.entries(config.fields)
      .filter(([_, field]) => field.search)
      .map(([fieldName, field]) => ({ fieldName, ...field }));
    
    searchFields.forEach(({ fieldName, searchDefault }) => {
      if (searchDefault !== undefined) {
        searchForm.value[fieldName] = searchDefault;
      }
    });

    // 获取数据列表
    await fetchData();
  } catch (err) {
    console.error(`${props.modelName} 列表初始化失败：`, err);
  } finally {
    loading.value = false;
  }
};

// 获取数据列表
const fetchData = async () => {
  if (!uiConfig.value) return;

  loading.value = true;
  try {
    const res = await useGetList({
      model_name: props.modelName,
      page: pageParams.value.page,
      page_size: pageParams.value.page_size,
      sort: pageParams.value.sort,
      filters: searchForm.value
    });

    if (res.code === 0) {
      dataList.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (err) {
    console.error(`${props.modelName} 数据获取失败：`, err);
  } finally {
    loading.value = false;
  }
};

// 搜索触发
const handleSearch = () => {
  pageParams.value.page = 1;
  fetchData();
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {};
  pageParams.value.page = 1;
  fetchData();
};

// 分页变化
const handlePageChange = (params: { page: number; page_size: number }) => {
  pageParams.value.page = params.page;
  pageParams.value.page_size = params.page_size;
  fetchData();
};

// 排序变化
const handleSortChange = (sort: string) => {
  pageParams.value.sort = sort;
  fetchData();
};

// 刷新数据
const handleRefresh = () => {
  fetchData();
};

// 清除缓存并刷新
const handleClearCache = async () => {
  clearUIConfigCache(props.modelName);
  await initPage();
};

// 新增按钮跳转
const handleAdd = () => {
  navigateTo(`/${props.modelName}/create`);
};

// 初始化
onMounted(() => {
  initPage();
});
</script>

<template>
  <PageContainer :title="pageTitle">
    <!-- 顶部操作区 -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-text-primary">{{ pageTitle }} 管理</h1>
      <div class="flex gap-2">
        <UButton
          variant="ghost"
          size="sm"
          @click="handleClearCache"
        >
          <Icon name="ic:outline:refresh" class="mr-1" />
          刷新配置
        </UButton>
        <UButton
          type="primary"
          @click="handleAdd"
        >
          <Icon name="ic:outline:add" class="mr-1" />
          新增
        </UButton>
      </div>
    </div>

    <!-- 搜索栏 -->
    <SearchBar
      v-if="uiConfig"
      v-model="searchForm"
      :ui-config="uiConfig"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      v-if="uiConfig"
      :ui-config="uiConfig"
      :data-list="dataList"
      :total="total"
      :loading="loading"
      :page-params="pageParams"
      :selected-rows="selectedRows"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
      @refresh="handleRefresh"
      @update:selected-rows="(val) => selectedRows = val"
    />
  </PageContainer>
</template>