<script setup lang="ts">
const error = useError();
const router = useRouter();

// 重试操作（刷新当前页面）
const handleRetry = () => {
  error.value.clear();
  router.reload();
};

// 返回首页
const handleGoHome = () => {
  error.value.clear();
  router.push('/');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen p-4 bg-background">
    <Icon name="ic:outline:error" class="text-6xl text-danger mb-4" />
    <h1 class="text-3xl font-bold text-text-primary mb-2">
      {{ error.statusCode || '500' }} - {{ error.statusMessage || '服务器错误' }}
    </h1>
    <p class="text-text-secondary mb-6 max-w-md text-center">
      {{ error.message || '发生未知错误，请稍后重试或联系管理员' }}
    </p>
    <div class="flex gap-3">
      <UButton
        type="primary"
        @click="handleRetry"
      >
        重试
      </UButton>
      <UButton
        variant="ghost"
        @click="handleGoHome"
      >
        返回首页
      </UButton>
    </div>
  </div>
</template>