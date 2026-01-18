<script setup lang="ts">
const route = useRoute();
const modelName = 'product';
const id = route.params.id;
</script>

<template>
  <ModelDetail :id="id" :model-name="modelName" />
</template>