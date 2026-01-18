<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedUIConfig, FieldConfig } from '@/types/config';
import { formatValue, renderRelationData } from '@/composables/useFormatter';

// Props 定义
const props = defineProps<{
  uiConfig: ParsedUIConfig;
  modelValue: Record<string, any>;
  loading?: boolean;
}>();

// 详情页字段配置（过滤 detail:false 的字段）
const detailFields = computed(() => {
  return Object.entries(props.uiConfig.fields)
    .filter(([_, config]) => config.detail !== false && !config.hidden)
    .sort((a, b) => (a[1].sort || 99) - (b[1].sort || 99))
    .map(([fieldName, config]) => ({ fieldName, ...config }));
});

// 字段分组（按 span 或默认 2 列布局）
const fieldGroups = computed(() => {
  const groups = [];
  let currentGroup = [];
  let currentSpan = 0;

  detailFields.value.forEach(field => {
    const span = Number(field.config.span) || 12; // 默认 12 列（2 列布局）
    if (currentSpan + span <= 24) {
      currentGroup.push(field);
      currentSpan += span;
    } else {
      groups.push(currentGroup);
      currentGroup = [field];
      currentSpan = span;
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
});

// 渲染字段值（遵循协议格式化与关联关系规则）
const renderFieldValue = (fieldName: string, config: FieldConfig) => {
  const value = props.modelValue[fieldName];

  // 空值处理
  if (value === null || value === undefined || value === '') {
    return config.emptyText || '--';
  }

  // 关联数据处理
  if (config.path || config.mode) {
    return renderRelationData(value, config.path, config.pathItem, config.mode);
  }

  // 格式化处理
  if (config.formatter) {
    return formatValue(value, config.formatter);
  }

  return value;
};
</script>

<template>
  <div class="card p-6">
    <div v-if="props.loading" class="loading-state">
      <div class="loading-spinner"/>
      <span class="loading-text">加载中...</span>
    </div>
    <div v-else class="space-y-6">
      <!-- 字段分组渲染 -->
      <div v-for="(group, groupIndex) in fieldGroups" :key="groupIndex" class="grid gap-6">
        <div
          v-for="field in group"
          :key="field.fieldName"
          :class="[
            'grid gap-2',
            `grid-cols-${field.config.span || 12}`,
            field.config.formClass
          ]"
        >
          <label class="text-sm font-medium text-text-secondary">
            {{ field.config.label || field.fieldName }}
            <span v-if="field.config.required" class="text-danger">*</span>
          </label>
          <div class="text-text-primary" :class="field.config.uiClass">
            <component
              :is="typeof renderFieldValue(field.fieldName, field.config) === 'object' ? 'div' : 'span'"
            >
              {{ renderFieldValue(field.fieldName, field.config) }}
            </component>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-3 mt-8">
        <UButton
          variant="ghost"
          @click="$router.go(-1)"
        >
          <Icon name="ic:outline:arrow-back" class="mr-1" />
          返回
        </UButton>
        <UButton
          type="primary"
          @click="$router.push(`/${props.uiConfig.model}/edit/${props.modelValue.id}`)"
        >
          <Icon name="ic:outline:edit" class="mr-1" />
          编辑
        </UButton>
      </div>
    </div>
  </div>
</template>