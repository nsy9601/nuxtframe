<script setup lang="ts">

// Props 定义
defineProps<{
  modelValue: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive' | 'secondary';
}>();

// Emits 声明
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm' | 'cancel'): void;
}>();

// 关闭弹窗
const closeDialog = (confirm = false) => {
  emit('update:modelValue', false);
  if (confirm) {
    emit('confirm');
  } else {
    emit('cancel');
  }
};

// 点击空白处关闭
const handleOverlayClick = (e: Event) => {
  if ((e.target as HTMLElement).classList.contains('dialog-overlay')) {
    closeDialog(false);
  }
};

// 监听ESC键关闭
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDialog(false);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div
    v-if="modelValue"
    class="dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleOverlayClick"
  >
    <UCard class="w-full max-w-md">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-text-primary mb-2">{{ title || '确认操作' }}</h3>
        <p class="text-text-secondary mb-6">{{ description || '确定要执行此操作吗？' }}</p>
        <div class="flex justify-end gap-3">
          <UButton
            variant="ghost"
            @click="closeDialog(false)"
          >
            {{ cancelText || '取消' }}
          </UButton>
          <UButton
            :variant="variant || 'primary'"
            @click="closeDialog(true)"
          >
            {{ confirmText || '确认' }}
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>