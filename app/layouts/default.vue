<script setup lang="ts">
// import { useColorMode } from '@nuxtjs/color-mode';
import Sidebar from '~/components/layout/Sidebar.vue';
import Navbar from '~/components/layout/Navbar.vue';

// 侧边栏折叠状态（本地存储缓存）
// const isSidebarCollapsed = ref(
//   localStorage.getItem('sidebarCollapsed') === 'true'
// );
// useCookie 在服务端和客户端都可用
const isSidebarCollapsed = useCookie('sidebarCollapsed', {
  default: () => false,
  watch: true
});

// 监听折叠状态变化，同步到本地存储
watch(isSidebarCollapsed, (val) => {
// 只有在浏览器环境下才操作 localStorage
  if (import.meta.client) {
    localStorage.setItem('sidebarCollapsed', String(val));
  }
});

// 颜色模式（关联主题）
const { colorMode } = useColorMode();

// 当前主题（结合 colorMode 和自定义主题）
// const currentTheme = computed(() => {
//   const storedTheme = localStorage.getItem('appTheme') || 'blue';
//   return colorMode.value === 'dark' ? 'dark' : storedTheme;
// });
// 1. 定义一个响应式的 ref
const currentTheme = ref('blue');

// 2. 挂载后初始化
onMounted(() => {
  if (import.meta.client) {
    const storedTheme = localStorage.getItem('appTheme') || 'blue';
    currentTheme.value = colorMode.value === 'dark' ? 'dark' : storedTheme;
  }
});

// 3. 监听 colorMode 的变化来同步主题
watch(() => colorMode.value, (newMode) => {
  if (newMode === 'dark') {
    currentTheme.value = 'dark';
  } else {
    if (import.meta.client) {
      currentTheme.value = localStorage.getItem('appTheme') || 'blue';
    }
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