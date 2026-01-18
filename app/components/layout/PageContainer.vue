<script setup lang="ts">
defineProps<{
  title: string; // 页面标题
  showBreadcrumb?: boolean; // 是否显示面包屑（默认true）
}>();

// 面包屑数据（从路由自动生成）
const route = useRoute();
const breadcrumbItems = computed(() => {
  return route.matched.map((route) => ({
    label: route.meta.title || route.name,
    path: route.path === '/' ? '/' : route.path
  }));
});
</script>

<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <div v-if="showBreadcrumb !== false" class="mb-4">
      <UBreadcrumb :items="breadcrumbItems" class="text-sm" />
    </div>

    <!-- 页面标题与操作区 -->
    <div class="flex flex-wrap items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-text-primary">{{ title }}</h1>
      <slot name="actions"/>
    </div>

    <!-- 页面内容 -->
    <slot/>
  </div>
</template>

<style lang="less" scoped>
.page-container {
  width: 100%;
  min-height: calc(100vh - @header-height - 40px);
}
</style>