import { useToast } from '@nuxt/ui/composables';
import { parseGlobalConfig, parseFieldConfig } from '@/utils/tagParser';
import type { ParsedUIConfig, UITagField } from '@/types/config';
import type { GetUITagResponse } from '@/types/api';
import { getUseMockData } from '@/utils/apiSwitch';
import { mockGetUITag } from '@/utils/mockData';

// 全局缓存：key=模型名，value=解析后的配置（永久缓存）
const uiConfigCache = new Map<string, ParsedUIConfig>();
const toast = useToast();

/**
 * 清除指定模型的UI配置缓存（模型配置变更时使用）
 * @param modelName - 模型名称
 */
export const clearUIConfigCache = (modelName?: string) => {
  if (modelName) {
    uiConfigCache.delete(modelName);
  } else {
    uiConfigCache.clear();
  }
  toast.add({ title: '缓存已清除', description: modelName ? `模型 ${modelName} 配置缓存已清除` : '所有UI配置缓存已清除', color: 'info' });
};

/**
 * 从接口获取UI标签原始配置
 * @param modelName - 模型名称
 * @returns 原始标签配置
 */
const fetchUITagRaw = async (modelName: string): Promise<UITagField[]> => {
  const useMock = getUseMockData();
  
  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockGetUITag(modelName);
    if (mockRes.code === 0) {
      return mockRes.data;
    }
    throw new Error(mockRes.msg || '获取虚拟UI配置失败');
  }

  // 使用真实接口（按协议约定的接口路径和格式）
  try {
    const res = await $fetch<GetUITagResponse>(`/getuitag?model_name=${modelName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '获取UI配置失败');
    }
    return res.data;
  } catch (err) {
    console.error('获取UI配置接口请求失败：', err);
    throw err;
  }
};

/**
 * 解析原始标签配置为结构化配置
 * @param modelName - 模型名称
 * @param rawFields - 原始标签字段数组
 * @returns 解析后的完整UI配置
 */
const parseUITagConfig = (modelName: string, rawFields: UITagField[]): ParsedUIConfig => {
  const parsedConfig: ParsedUIConfig = {
    model: modelName,
    global: { model: modelName }, // 初始化模型级配置
    fields: {},
  };

  rawFields.forEach(({ field, tag }) => {
    if (field === 'UIConfig') {
      // 解析模型级全局配置
      parsedConfig.global = { ...parsedConfig.global, ...parseGlobalConfig(tag) };
    } else {
      // 解析字段级配置（跳过全局隐藏的字段）
      const fieldConfig = parseFieldConfig(tag);
      if (!fieldConfig.hidden) {
        parsedConfig.fields[field] = fieldConfig;
      }
    }
  });

  // 填充默认值（按协议约定）
  parsedConfig.global.actionWidth = parsedConfig.global.actionWidth || 150;
  parsedConfig.global.searchDefaultCount = parsedConfig.global.searchDefaultCount || 3;

  return parsedConfig;
};

/**
 * 获取并解析UI标签配置（优先从缓存获取）
 * @param modelName - 模型名称
 * @param forceRefresh - 是否强制刷新缓存（默认false）
 * @returns 解析后的完整UI配置
 */
export const useUIConfig = async (modelName: string, forceRefresh = false): Promise<ParsedUIConfig> => {
  // 优先从缓存获取（永久缓存，除非强制刷新或缓存不存在）
  if (!forceRefresh && uiConfigCache.has(modelName)) {
    const cachedConfig = uiConfigCache.get(modelName);
    if (cachedConfig) return cachedConfig;
  }

  try {
    toast.add({ title: '加载中', description: `正在获取 ${modelName} 配置...`, color: 'info' });
    
    // 1. 获取原始标签配置
    const rawFields = await fetchUITagRaw(modelName);
    
    // 2. 解析配置
    const parsedConfig = parseUITagConfig(modelName, rawFields);
    
    // 3. 缓存配置
    uiConfigCache.set(modelName, parsedConfig);
    
    toast.clear();
    return parsedConfig;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '获取UI配置失败';
    toast.add({ title: '错误', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 获取缓存中的UI配置（同步操作，可能返回undefined）
 * @param modelName - 模型名称
 * @returns 缓存的配置或undefined
 */
export const getCachedUIConfig = (modelName: string): ParsedUIConfig | undefined => {
  return uiConfigCache.get(modelName);
};