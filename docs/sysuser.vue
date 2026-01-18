<script setup lang="ts">
// 仅需配置模型标识，自动渲染列表页
const modelName = 'sysuser';
</script>

<template>
  <ModelList :model-name="modelName" />
</template>