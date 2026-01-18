import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@nuxt/ui/dist/components/**/*.{js,vue}',
  ],
  theme: {
    extend: {
      colors: {
        // 扩展 6 套主题色（与 themes.less 保持一致）
        primary: {
          blue: '#165DFF', // 蓝色专业
          purple: '#7B61FF', // 紫色科技
          green: '#00B42A', // 绿色生态
          orange: '#FF7D00', // 橙色活力
          red: '#F53F3F', // 红色警示
          dark: '#1D2129', // 暗色模式主色
        },
        secondary: {
          blue: '#E8F3FF',
          purple: '#F3F0FF',
          green: '#E6FFFA',
          orange: '#FFF7E6',
          red: '#FFEEEE',
          dark: '#2E3440',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '360px', // 移动端最小尺寸
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [], // @nuxt/ui v4 无需手动注册 uiPlugin
  darkMode: 'class', // 配合 @nuxtjs/color-mode 使用类名控制暗色模式
};