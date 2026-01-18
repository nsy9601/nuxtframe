<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue';

// Props
defineProps<{
  collapsed: boolean;
}>();

defineEmits(['toggle'])

// 颜色模式
const { colorMode } = useColorMode();

// 使用useCookie管理主题设置，替代localStorage
const appTheme = useCookie('appTheme', { default: () => 'blue' });

// 当前主题（从cookie获取）
const currentTheme = ref(appTheme.value);

// 主题变更回调
const handleThemeChange = (theme: string) => {
  currentTheme.value = theme;
  appTheme.value = theme;  // 使用useCookie替代localStorage
  
  // 切换主题时同步颜色模式（暗色模式单独处理）
  if (theme === 'dark') {
    colorMode.value = 'dark';
  } else if (colorMode.value === 'dark') {
    colorMode.value = 'light';
  }
};

// 用户信息下拉菜单
const userMenuOpen = ref(false);

// 全屏功能
const isFullScreen = ref(false);

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error('全屏失败：', err);
    });
    isFullScreen.value = true;
  } else {
    document.exitFullscreen();
    isFullScreen.value = false;
  }
};

// 监听全屏状态变化
if (import.meta.client) {
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !!document.fullscreenElement;
  });
}

// 退出登录
const handleLogout = () => {
  // 此处可添加退出登录逻辑（清除缓存、跳转登录页等）
  userMenuOpen.value = false;
  useToast().add({ title: '成功', description: '已退出登录', color: 'success' });
};
</script>

<template>
  <header class="h-header-height bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-10">
    <!-- 左侧：侧边栏切换按钮 + 面包屑 -->
    <div class="flex items-center">
      <button
        class="p-2 rounded-full hover:bg-background-secondary mr-4"
        :aria-label="collapsed ? '展开侧边栏' : '折叠侧边栏'"
        @click="$emit('toggle')"
      >
        <Icon name="ic:outline:menu" class="text-text-secondary" />
      </button>

      <!-- 面包屑 -->
      <NuxtBreadcrumb class="hidden md:block" />
    </div>

    <!-- 右侧：功能按钮区 -->
    <div class="flex items-center gap-2">
      <!-- 主题切换 -->
      <ThemeSwitcher
        :current-theme="currentTheme"
        @theme-change="handleThemeChange"
      />

      <!-- 全屏按钮 -->
      <button
        class="p-2 rounded-full hover:bg-background-secondary"
        :aria-label="isFullScreen ? '退出全屏' : '全屏显示'"
        @click="toggleFullScreen"
      >
        <Icon :name="isFullScreen ? 'ic:outline:fullscreen-exit' : 'ic:outline:fullscreen'" class="text-text-secondary" />
      </button>

      <!-- 通知中心 -->
      <button class="p-2 rounded-full hover:bg-background-secondary relative">
        <Icon name="ic:outline:notifications" class="text-text-secondary" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
      </button>

      <!-- 用户信息 -->
      <div class="relative ml-2">
        <button
          class="flex items-center gap-2 p-1 rounded-full hover:bg-background-secondary"
          @click="userMenuOpen = !userMenuOpen"
        >
          <img
            src="https://picsum.photos/id/1005/40/40"
            alt="用户头像"
            class="w-8 h-8 rounded-full object-cover border border-border"
          >
          <span class="hidden md:block text-text-primary text-sm font-medium">管理员</span>
          <Icon name="ic:outline:arrow-drop-down" class="text-text-secondary text-xs" />
        </button>

        <!-- 用户下拉菜单 -->
        <div
          v-if="userMenuOpen"
          v-click-outside="() => userMenuOpen = false"
          class="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <button class="w-full text-left px-4 py-2 hover:bg-background-secondary text-text-primary text-sm">
            <Icon name="ic:outline:person" class="inline mr-2 text-text-secondary" />
            个人中心
          </button>
          <button class="w-full text-left px-4 py-2 hover:bg-background-secondary text-text-primary text-sm">
            <Icon name="ic:outline:settings" class="inline mr-2 text-text-secondary" />
            账号设置
          </button>
          <div class="border-t border-border my-1" />
          <button
            class="w-full text-left px-4 py-2 hover:bg-background-secondary text-danger text-sm"
            @click="handleLogout"
          >
            <Icon name="ic:outline:logout" class="inline mr-2" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  </header>
</template>