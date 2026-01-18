import { useToast } from '@nuxt/ui/composables';
import type { ButtonType, ModelGlobalConfig } from '@/types/config';
import type { PermissionsResponse } from '@/types/api';
import { getUseMockData } from '@/utils/apiSwitch';
import { mockGetPermissions } from '@/utils/mockData';

// 缓存用户权限列表（页面刷新前有效）
let userPermissions: string[] = [];
const toast = useToast();

/**
 * 清除权限缓存（退出登录或权限变更时使用）
 */
export const clearPermissionCache = () => {
  userPermissions = [];
};

/**
 * 从接口获取用户权限列表
 * @returns 权限标识数组
 */
const fetchUserPermissions = async (): Promise<string[]> => {
  const useMock = getUseMockData();
  
  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockGetPermissions();
    if (mockRes.code === 0) {
      return mockRes.data;
    }
    throw new Error(mockRes.msg || '获取虚拟权限列表失败');
  }

  // 使用真实接口（按协议约定的接口路径）
  try {
    const res = await $fetch<PermissionsResponse>('/getpermissions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '获取权限列表失败');
    }
    return res.data;
  } catch (err) {
    console.error('获取权限列表接口请求失败：', err);
    throw err;
  }
};

/**
 * 获取用户权限列表（优先从缓存获取）
 * @param forceRefresh - 是否强制刷新（默认false）
 * @returns 权限标识数组
 */
export const getUserPermissions = async (forceRefresh = false): Promise<string[]> => {
  if (!forceRefresh && userPermissions.length > 0) {
    return userPermissions;
  }

  try {
    const permissions = await fetchUserPermissions();
    userPermissions = permissions;
    return permissions;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '获取权限列表失败';
    toast.add({ title: '权限获取失败', description: errorMsg, color: 'error' });
    return [];
  }
};

/**
 * 校验按钮权限（完全遵循协议权限控制约定）
 * @param buttonName - 按钮名称（内置按钮名或自定义按钮名）
 * @param modelName - 模型名称
 * @param actionPermission - 模型级权限配置（action-permission）
 * @returns 是否有权限（true=有权限，false=无权限）
 */
export const checkButtonPermission = async (
  buttonName: ButtonType,
  modelName: string,
  actionPermission?: Record<string, string>
): Promise<boolean> => {
  const permissions = await getUserPermissions();
  
  // 1. 解析按钮名（处理自定义按钮格式：custom:Audit → Audit）
  const pureBtnName = buttonName.startsWith('custom:') ? buttonName.slice(7) : buttonName;

  // 2. 有模型级权限配置时，优先使用配置的权限标识
  if (actionPermission && Object.prototype.hasOwnProperty.call(actionPermission, pureBtnName)) {
    const targetPerm = actionPermission[pureBtnName] || '';
    return permissions.includes(targetPerm);
  }

  // 3. 无配置时，使用内置按钮默认权限标识（协议约定：模型名:按钮名）
  // 自定义按钮无配置时，默认无权限（协议约定）
  if (buttonName.startsWith('custom:')) {
    return false;
  }

  // 内置按钮默认权限标识
  const defaultPerm = `${modelName.toLowerCase()}:${buttonName}`;
  return permissions.includes(defaultPerm);
};

/**
 * 过滤有权限的按钮（返回当前用户可显示的按钮列表）
 * @param buttons - 配置的按钮列表
 * @param modelName - 模型名称
 * @param actionPermission - 模型级权限配置
 * @returns 有权限的按钮列表
 */
export const filterAuthorizedButtons = async (
  buttons: ButtonType[] = [],
  modelName: string,
  actionPermission?: Record<string, string>
): Promise<ButtonType[]> => {
  const authorizedButtons: ButtonType[] = [];

  for (const btn of buttons) {
    const hasPerm = await checkButtonPermission(btn, modelName, actionPermission);
    if (hasPerm) {
      authorizedButtons.push(btn);
    }
  }

  return authorizedButtons;
};

/**
 * 校验按钮动态显示条件（协议约定的 action-item-condition）
 * @param buttonName - 按钮名称
 * @param row - 表格行数据（单条操作时）
 * @param actionItemCondition - 模型级动态显示条件配置
 * @returns 是否满足显示条件（true=显示，false=隐藏）
 */
export const checkButtonShowCondition = (
  buttonName: ButtonType,
  row?: Record<string, any>,
  actionItemCondition?: Record<string, string>
): boolean => {
  // 无配置时，默认显示
  if (!actionItemCondition) return true;

  // 解析按钮名（处理自定义按钮格式）
  const pureBtnName = buttonName.startsWith('custom:') ? buttonName.slice(7) : buttonName;
  
  // 无该按钮的显示条件时，默认显示
  if (!Object.prototype.hasOwnProperty.call(actionItemCondition, pureBtnName)) {
    return true;
  }

  const condition = actionItemCondition[pureBtnName];
  if (!condition) return true;

  try {
    // 动态表达式求值（仅支持JavaScript语法子集，按协议约定）
    // 上下文仅包含 row 数据（单条操作时）
    const context = { row: row || {} };
    // 使用函数构造器执行表达式（安全限制：仅允许访问 context 中的属性）
    const func = new Function('context', `return ${condition}`);
    return func(context) as boolean;
  } catch (err) {
    console.error(`按钮 ${buttonName} 显示条件解析失败：`, err);
    return true; // 解析失败时默认显示按钮
  }
};