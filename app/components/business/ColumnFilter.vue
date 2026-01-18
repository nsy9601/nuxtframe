<script setup lang="ts">
import type { FieldConfig } from '@/types/config';

// Props 定义
const props = defineProps<{
  fields: Array<{ fieldName: string; config: FieldConfig }>;
  visibleColumns: string[];
}>();

// 本地选中状态
const localVisibleColumns = ref([...props.visibleColumns]);

// 全选/取消全选
const selectAll = ref(localVisibleColumns.value.length === props.fields.length);

watch(selectAll, (val) => {
  localVisibleColumns.value = val 
    ? props.fields.map(field => field.fieldName) 
    : [];
});

// 单个列选中状态变化
const handleColumnChange = (fieldName: string, checked: boolean) => {
  if (checked) {
    localVisibleColumns.value.push(fieldName);
  } else {
    localVisibleColumns.value = localVisibleColumns.value.filter(name => name !== fieldName);
  }
  // 更新全选状态
  selectAll.value = localVisibleColumns.value.length === props.fields.length;
};

// 重置为默认状态（显示所有列）
const handleReset = () => {
  localVisibleColumns.value = props.fields.map(field => field.fieldName);
  selectAll.value = true;
};

</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <UCheckbox
        v-model="selectAll"
        label="全选"
      />
      <UButton
        variant="ghost"
        size="sm"
        @click="handleReset"
      >
        重置默认
      </UButton>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
      <template v-for="field in fields" :key="field.fieldName">
        <div class="flex items-center">
          <UCheckbox
            :model-value="localVisibleColumns.includes(field.fieldName)"
            @change="(val) => handleColumnChange(field.fieldName, val)"
          />
          <span class="ml-2 text-text-primary">
            {{ field.config.label || field.fieldName }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>