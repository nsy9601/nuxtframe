/**
 * 主题工具函数（抽离主题相关逻辑）
 * 支持6套预设主题+暗色模式，状态持久化
 */
export const useTheme = () => {
  // const { colorMode, toggleColorMode } = useColorMode();
  const colorMode = useColorMode()

  const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
  // 预设主题列表
  const themes = ref([
    { value: 'blue', label: '蓝色专业', color: '#165DFF' },
    { value: 'purple', label: '紫色科技', color: '#7B61FF' },
    { value: 'green', label: '绿色生态', color: '#00B42A' },
    { value: 'orange', label: '橙色活力', color: '#FF7D00' },
    { value: 'red', label: '红色警示', color: '#F53F3F' },
    { value: 'dark', label: '暗色模式', color: '#1D2129' },
    {
      value: 'cyan', // 主题标识（唯一）
      label: '青色清新', // 主题名称
      color: '#00C48C' // 主题主色
    }
  ]);

  // 当前主题（本地存储持久化）
  const currentTheme = ref<string>(
    localStorage.getItem('appTheme') || 'blue'
  );

  // 监听主题变化，同步颜色模式
  watch(currentTheme, (val) => {
    localStorage.setItem('appTheme', val);
    if (val === 'dark') {
      colorMode.preference = 'dark';
    } else if (colorMode.value === 'dark') {
      colorMode.preference = 'light';
    }
  }, { immediate: true });

  // 监听颜色模式变化（用户手动切换系统暗色模式）
  watch(() => colorMode.value, (val) => {
    if (val === 'dark') {
      currentTheme.value = 'dark';
    } else if (currentTheme.value === 'dark') {
      // 只有当从 dark 切换回 light 时，才恢复之前的主题
      currentTheme.value = localStorage.getItem('appTheme') || 'blue';
    }
  });

  // 切换主题
  const switchTheme = (theme: string) => {
    currentTheme.value = theme;
  };

  // 重置主题为默认（蓝色专业）
  const resetTheme = () => {
    switchTheme('blue');
  };

  // 获取当前主题的CSS变量
  const getThemeVariables = computed(() => {
    const themeMap: Record<string, Record<string, string>> = {
      blue: {
        '--color-primary': '#165DFF',
        '--color-primary-light': '#E8F3FF',
        '--color-primary-dark': '#0E42D2'
      },
      purple: {
        '--color-primary': '#7B61FF',
        '--color-primary-light': '#F3F0FF',
        '--color-primary-dark': '#6247CC'
      },
      green: {
        '--color-primary': '#00B42A',
        '--color-primary-light': '#E6FFFA',
        '--color-primary-dark': '#009120'
      },
      orange: {
        '--color-primary': '#FF7D00',
        '--color-primary-light': '#FFF7E6',
        '--color-primary-dark': '#E06A00'
      },
      red: {
        '--color-primary': '#F53F3F',
        '--color-primary-light': '#FFEEEE',
        '--color-primary-dark': '#D93030'
      },
      dark: {
        '--color-primary': '#1D2129',
        '--color-primary-light': '#2E3440',
        '--color-primary-dark': '#0F1117'
      }
    };
    return themeMap[currentTheme.value] || themeMap.blue;
  });

  return {
    themes,
    currentTheme,
    switchTheme,
    resetTheme,
    getThemeVariables,
    toggleColorMode
  };
};