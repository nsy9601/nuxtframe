<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Props
defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

// 菜单列表（可从接口动态获取，此处为示例）
const menuItems = ref([
  {
    icon: 'ic:outline:dashboard',
    label: '首页',
    path: '/',
    active: true
  },
  {
    icon: 'ic:outline:people',
    label: '系统用户',
    path: '/sysuser',
    permission: 'sysuser:view'
  },
  {
    icon: 'ic:outline:inventory',
    label: '产品管理',
    path: '/product',
    permission: 'product:view'
  },
  {
    icon: 'ic:outline:settings',
    label: '系统设置',
    path: '/settings',
    permission: 'system:setting'
  }
]);

// 监听路由变化，更新菜单激活状态
watch(useRoute(), (route) => {
  menuItems.value.forEach(item => {
    item.active = route.path === item.path;
  });
}, { immediate: true });

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path);
  // 移动端自动折叠侧边栏
  if (window.innerWidth < 768) {
    emit('toggle');
  }
};

// 检查菜单权限（简化版，实际需结合 usePermissions）
const hasMenuPermission = (permission?: string) => {
  if (!permission) return true;
  // 此处可替换为真实权限校验逻辑
  const mockPermissions = ['sysuser:view', 'product:view', 'system:setting'];
  return mockPermissions.includes(permission);
};

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => hasMenuPermission(item.permission))
})
</script>

<template>
  <aside
    :class="[
      'fixed h-full transition-all duration-300 z-20 bg-background-secondary border-r border-border',
      collapsed ? 'sidebar-collapsed-width' : 'sidebar-width',
      { 'md:relative': !collapsed }
    ]"
  >
    <!-- 侧边栏头部 -->
    <div class="flex items-center justify-between h-header-height px-4 border-b border-border">
      <div class="flex items-center">
        <Icon
          name="ic:outline:admin-panel-settings"
          class="text-primary text-2xl mr-2"
        />
        <h1 v-if="!collapsed" class="text-lg font-bold text-text-primary">
          后台管理系统
        </h1>
      </div>
      <button
        class="p-2 rounded-full hover:bg-background transition-colors"
        @click="emit('toggle')"
      >
        <Icon
          name="ic:outline:chevron-left"
          class="text-text-secondary"
          :class="{ 'rotate-180': collapsed }"
        />
      </button>
    </div>

    <!-- 菜单列表 -->
    <nav class="py-4">
      <ul>
        <template v-for="item in filteredMenuItems" :key="item.path">
          <li>
            <button
              class="flex items-center w-full px-4 py-3 text-left transition-colors"
              :class="[
                item.active ? 'bg-primary-light text-primary' : 'hover:bg-background',
                collapsed ? 'justify-center' : 'justify-start'
              ]"
              @click="navigateTo(item.path)"
            >
              <Icon 
                :name="item.icon" 
                class="text-text-secondary" 
                :class="{ 'mr-3': !collapsed }" 
              />
              <span v-if="!collapsed" class="text-text-primary">{{ item.label }}</span>
            </button>
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>