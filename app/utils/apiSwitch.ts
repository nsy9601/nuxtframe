/**
 * 接口切换配置（全局控制是否使用虚拟数据）
 * 可通过 runtimeConfig.public.useMockData 动态切换
 */
let useMockData = true;

/**
 * 设置接口切换状态
 * @param status - true=使用虚拟数据，false=使用真实接口
 */
export const setUseMockData = (status: boolean) => {
  useMockData = status;
  // 存储到本地存储，页面刷新后保持状态
  localStorage.setItem('useMockData', String(status));
};

/**
 * 获取当前接口切换状态
 * @returns 当前是否使用虚拟数据
 */
export const getUseMockData = (): boolean => {
  // 优先从本地存储获取（页面刷新后恢复状态）
  const storedStatus = localStorage.getItem('useMockData');
  if (storedStatus !== null) {
    useMockData = storedStatus === 'true';
  }
  return useMockData;
};

/**
 * 初始化接口切换状态（从runtimeConfig读取默认值）
 */
export const initApiSwitch = (defaultStatus: boolean) => {
  const storedStatus = localStorage.getItem('useMockData');
  if (storedStatus === null) {
    useMockData = defaultStatus;
    localStorage.setItem('useMockData', String(defaultStatus));
  } else {
    useMockData = storedStatus === 'true';
  }
};