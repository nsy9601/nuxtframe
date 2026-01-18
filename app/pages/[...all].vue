<script setup lang="ts">
const handleGoBack = () => {
  navigateTo('/', { replace: true });
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-[80vh] gap-6">
    <Icon name="ic:outline:error" class="text-6xl text-warning" />
    <h1 class="text-3xl font-bold text-text-primary">404 - 页面不存在</h1>
    <p class="text-text-secondary">您访问的页面不存在或已被删除</p>
    <UButton
      type="primary"
      @click="handleGoBack"
      class="mt-4"
    >
      返回首页
    </UButton>
  </div>
</template>