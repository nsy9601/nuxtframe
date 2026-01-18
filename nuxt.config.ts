export default defineNuxtConfig({
  // 项目基础配置
  devtools: { enabled: true },
  compatibilityDate: '2026-01-18',
  modules: [
    '@nuxt/ui', // Nuxt UI 组件库（v4.3.0）
    '@nuxt/icon', // 图标库（v2.2.0）
    '@nuxtjs/color-mode', // 主题切换支持（v4.0.0）
    '@nuxt/eslint', // ESLint 支持（可选）
  ],

  // 组件自动导入配置（Nuxt4 默认支持，显式声明增强可读性）
  components: [
    '~~/components', // 根目录通用组件 // nuxt4使用双波浪线，强制从根目录开始找
    '~/components', // app 内 UI 组件 NUXT4别名逻辑：~ = D:/www/nuxtframe/app/
  ],

  // 样式配置
  css: [
    // 在main.less中已引入了其他的样式文件，再引入就重复了
    '~/assets/styles/main.less',  // 别名逻辑：~ 代表/app
  ],

  // TypeScript 配置
  typescript: {
    strict: true, // 严格模式
    typeCheck: false, // 构建时类型检查, 建议开发环境先设为 false，等项目跑通后再开启
    shim: false, // 禁用自动生成的类型垫片（Nuxt4 推荐）
  },

  // 运行时配置（可在客户端和服务端访问）
  runtimeConfig: {
    public: {
      apiBaseUrl: '/api', // API 基础路径
      useMockData: true, // 是否使用虚拟数据（true=虚拟，false=真实接口）
    },
  },

  ui: {
    // 禁用自动字体注入，或者确保不从远程获取
    fonts: false
  },
  future: {
    compatibilityVersion: 4,
  },
});