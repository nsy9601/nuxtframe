<script setup lang="ts">
const route = useRoute();
const modelName = 'sysuser';
const id = route.params.id;
</script>

<template>
  <ModelDetail :id="id" :model-name="modelName" />
</template>