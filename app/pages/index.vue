<script setup lang="ts">
const modelList = [
  {
    name: '系统用户',
    model: 'sysuser',
    icon: 'ic:outline:people',
    desc: '管理系统用户账号、权限、角色'
  },
  {
    name: '产品管理',
    model: 'product',
    icon: 'ic:outline:inventory',
    desc: '管理产品信息、库存、分类'
  }
];

// 导航到模型列表页
const navigateToModel = (model: string) => {
  navigateTo(`/${model}`);
};
</script>

<template>
  <PageContainer title="系统首页">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div
        v-for="item in modelList"
        :key="item.model"
        class="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
        @click="navigateToModel(item.model)"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
            <Icon :name="item.icon" class="text-primary text-xl" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-text-primary">{{ item.name }}</h3>
            <p class="text-text-secondary mt-1">{{ item.desc }}</p>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <UButton variant="ghost" size="sm">
            进入管理
            <Icon name="ic:outline:arrow-right" class="ml-1" />
          </UButton>
        </div>
      </div>
    </div>
  </PageContainer>
</template>