<script setup lang="ts">
import Sidebar from '~/components/layout/Sidebar.vue';
import Navbar from '~/components/layout/Navbar.vue';

// 侧边栏折叠状态（使用useCookie持久化）
const isSidebarCollapsed = useCookie('sidebarCollapsed', {
  default: () => false,
  watch: true
});

// 颜色模式（关联主题）
const { colorMode } = useColorMode();

// 主题设置（使用useCookie持久化）
const appTheme = useCookie('appTheme', { 
  default: () => 'blue',
  watch: true
});

// 当前主题状态
const currentTheme = ref('blue');

// 在客户端挂载时设置主题
onMounted(() => {
  currentTheme.value = colorMode.value === 'dark' ? 'dark' : appTheme.value;
});

// 监听colorMode变化
watch(() => colorMode.value, (newMode) => {
  if (newMode === 'dark') {
    currentTheme.value = 'dark';
  } else {
    currentTheme.value = appTheme.value;
  }
});

// 监听appTheme变化
watch(appTheme, (newTheme) => {
  if (colorMode.value !== 'dark') {
    currentTheme.value = newTheme;
  }
});

// 页面加载状态
const isPageLoading = ref(false);

// 监听路由变化，设置加载状态
watch(useRoute(), () => {
  isPageLoading.value = true;
  setTimeout(() => {
    isPageLoading.value = false;
  }, 300);
}, { immediate: true });
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background theme-transition" :class="currentTheme">
    <!-- 侧边栏 -->
    <Sidebar
      :collapsed="isSidebarCollapsed"
      @toggle="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <!-- 主内容区 -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- 顶部导航 -->
      <Navbar :collapsed="isSidebarCollapsed" />

      <!-- 页面内容 -->
      <main class="flex-1 overflow-y-auto content-padding">
        <transition name="fade" mode="out-in">
          <div v-if="!isPageLoading" class="w-full">
            <NuxtPage />
          </div>
          <div v-else class="flex items-center justify-center h-64">
            <div class="loading-spinner" />
            <span class="ml-2 text-text-placeholder">加载中...</span>
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<style lang="less" scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>