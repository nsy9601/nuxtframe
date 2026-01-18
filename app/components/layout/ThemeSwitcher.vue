<script setup lang="ts">
import { ref } from 'vue';
// import { useColorMode } from '@nuxtjs/color-mode';

// Props
const props = defineProps<{
  currentTheme: string;
}>();

const emit = defineEmits<{
  (e: 'theme-change', theme: string): void;
}>();

// // 颜色模式
// const { colorMode } = useColorMode();

// 主题列表（6套预设主题）
const themes = ref([
  { value: 'blue', label: '蓝色专业', color: '#165DFF' },
  { value: 'purple', label: '紫色科技', color: '#7B61FF' },
  { value: 'green', label: '绿色生态', color: '#00B42A' },
  { value: 'orange', label: '橙色活力', color: '#FF7D00' },
  { value: 'red', label: '红色警示', color: '#F53F3F' },
  { value: 'dark', label: '暗色模式', color: '#1D2129' }
]);

// 主题选择下拉菜单
const themeMenuOpen = ref(false);

// 切换主题
const changeTheme = (theme: string) => {
  emit('theme-change', theme);
  themeMenuOpen.value = false;
};

// 获取当前主题的显示标签
const currentThemeLabel = computed(() => {
  const theme = themes.value.find(t => t.value === props.currentTheme);
  return theme?.label || '蓝色专业';
});

// 获取当前主题的颜色
const currentThemeColor = computed(() => {
  const theme = themes.value.find(t => t.value === props.currentTheme);
  return theme?.color || '#165DFF';
});
</script>

<template>
  <div class="relative">
    <!-- 主题切换按钮 -->
    <button
      class="flex items-center gap-2 p-2 rounded-full hover:bg-background-secondary"
      :aria-label="`当前主题：${currentThemeLabel}`"
      @click="themeMenuOpen = !themeMenuOpen"
    >
      <div
        class="w-4 h-4 rounded-full"
        :style="{ backgroundColor: currentThemeColor }"
      />
      <span class="hidden md:block text-text-primary text-sm">
        {{ currentThemeLabel }}
      </span>
      <Icon name="ic:outline:arrow-drop-down" class="text-text-secondary text-xs" />
    </button>

    <!-- 主题下拉菜单 -->
    <div
      v-if="themeMenuOpen"
      v-click-outside="() => themeMenuOpen = false"
      class="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <div class="px-4 py-2 text-sm text-text-placeholder border-b border-border">
        选择主题
      </div>
      <div class="max-h-60 overflow-y-auto">
        <button
          v-for="theme in themes"
          :key="theme.value"
          class="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-background-secondary transition-colors"
          :class="{ 'bg-primary-light text-primary': props.currentTheme === theme.value }"
          @click="changeTheme(theme.value)"
        >
          <div
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: theme.color }"
          />
          <span class="text-text-primary text-sm">{{ theme.label }}</span>
          <Icon
            v-if="props.currentTheme === theme.value"
            name="ic:outline:check"
            class="ml-auto text-primary"
          />
        </button>
      </div>
    </div>
  </div>
</template>