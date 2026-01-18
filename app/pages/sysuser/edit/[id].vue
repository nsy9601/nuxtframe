<script setup lang="ts">
const route = useRoute();
const modelName = 'sysuser';
const id = route.params.id;
</script>

<template>
  <ModelEdit :id="id" :model-name="modelName" />
</template>