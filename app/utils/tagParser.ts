import type { ModelGlobalConfig, FieldConfig } from '@/types/config';

/**
 * 解析UI标签字符串为键值对对象（完全遵循协议语法规则）
 * @param tagStr - UI标签原始字符串
 * @returns 解析后的配置对象
 */
export const parseTagString = (tagStr: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (!tagStr) return result;

  // 1. 处理转义：将 ;; 替换为临时占位符，后续恢复为 ;
  const tempTagStr = tagStr.replace(/;;/g, '__SEMICOLON__');

  // 2. 按分号分割配置项，过滤空项和纯空格项
  const items = tempTagStr.split(';').filter(item => item.trim());

  items.forEach(item => {
    // 恢复转义的分号
    const processedItem = item.replace(/__SEMICOLON__/g, ';');
    
    // 分割键值对（只分割第一个冒号，支持值中包含冒号）
    const colonIndex = processedItem.indexOf(':');
    if (colonIndex === -1) {
      // 仅key无value，解析为true（协议约定）
      const key = processedItem.trim().toLowerCase();
      result[key] = true;
      return;
    }

    const key = processedItem.slice(0, colonIndex).trim().toLowerCase();
    const value = processedItem.slice(colonIndex + 1).trim();

    // 空值处理（协议约定：key: 表示空值）
    if (value === '') {
      result[key] = '';
      return;
    }

    // 类型转换（协议约定：布尔值、数字、字符串自动识别）
    if (value.toLowerCase() === 'true') {
      result[key] = true;
    } else if (value.toLowerCase() === 'false') {
      result[key] = false;
    } else if (!isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      // 字符串值（无需加引号，支持含空格和特殊字符）
      result[key] = value;
    }
  });

  return result;
};

/**
 * 解析模型级全局配置（来自UIConfig字段的tag）
 * @param tagStr - UIConfig字段的标签字符串
 * @returns 解析后的模型级全局配置
 */
export const parseGlobalConfig = (tagStr: string): ModelGlobalConfig => {
  const rawConfig = parseTagString(tagStr);
  const globalConfig: ModelGlobalConfig = {
    model: rawConfig.model as string || '',
  };

  // 1. 解析actions（按钮列表，逗号分隔）
  if (rawConfig.actions) {
    globalConfig.actions = (rawConfig.actions as string).split(',').map((btn:any) => btn.trim()) as any[];
  }

  // 2. 解析操作按钮相关配置（action-width、action-label等）
  const actionConfigKeys = [
    'actionWidth', 'actionItemCondition', 'actionLabel',
    'actionIcon', 'actionClass', 'actionPermission',
    'actionApi', 'actionMethod', 'actionCallback', 'searchDefaultCount'
  ];

  actionConfigKeys.forEach(key => {
    const rawKey = key.split(/(?=[A-Z])/).join('-').toLowerCase(); // 转为连字符格式（如 actionWidth → action-width）
    if (rawConfig[rawKey] !== undefined) {
      // 解析键值对格式的配置（如 action-label:view:查看详情;edit:编辑用户）
      if (['actionItemCondition', 'actionLabel', 'actionIcon', 'actionClass', 'actionPermission', 'actionApi', 'actionMethod', 'actionCallback'].includes(key)) {
        const value = rawConfig[rawKey];
        if (typeof value === 'string') {
          const map: Record<string, string> = {};
          value.split(';').forEach(item => {
            const [btn, val] = item.split('=').map(part => part.trim());
            if (btn && val) map[btn] = val;
          });
          (globalConfig as any)[key] = map;
        }
      } else {
        (globalConfig as any)[key] = rawConfig[rawKey];
      }
    }
  });

  return globalConfig;
};

/**
 * 解析字段级配置（来自业务字段的tag）
 * @param tagStr - 业务字段的标签字符串
 * @returns 解析后的字段级配置
 */
export const parseFieldConfig = (tagStr: string): FieldConfig => {
  const rawConfig = parseTagString(tagStr);
  const fieldConfig: FieldConfig = {};

  // 基础配置映射（直接对应协议中的字段级配置项）
  const configMap: Record<string, keyof FieldConfig> = {
    'label': 'label',
    'sort': 'sort',
    'hidden': 'hidden',
    'table': 'table',
    'form': 'form',
    'detail': 'detail',
    'empty-text': 'emptyText',
    'tooltip': 'tooltip',
    'default': 'default',
    'placeholder': 'placeholder',
    'disabled': 'disabled',
    'readonly': 'readonly',
    'add-hidden': 'addHidden',
    'edit-hidden': 'editHidden',
    'detail-hidden': 'detailHidden',
    'add-disabled': 'addDisabled',
    'edit-disabled': 'editDisabled',
    'required': 'required',
    'type': 'type',
    'span': 'span',
    'search-span': 'searchSpan',
    'ui-class': 'uiClass',
    'table-class': 'tableClass',
    'form-class': 'formClass',
    'align': 'align',
    'width': 'width',
    'min-width': 'minWidth',
    'ellipsis': 'ellipsis',
    'form-label-width': 'formLabelWidth',
    'options': 'options',
    'api': 'api',
    'api-params': 'apiParams',
    'depend': 'depend',
    'label-key': 'labelKey',
    'value-key': 'valueKey',
    'api-method': 'apiMethod',
    'loading-text': 'loadingText',
    'empty-options-text': 'emptyOptionsText',
    'search': 'search',
    'op': 'op',
    'search-default': 'searchDefault',
    'search-placeholder': 'searchPlaceholder',
    'multiple': 'multiple',
    'rules': 'rules',
    'path': 'path',
    'path-item': 'pathItem',
    'mode': 'mode',
    'formatter': 'formatter',
  };

  // 映射基础配置
  Object.entries(configMap).forEach(([rawKey, targetKey]) => {
    if (rawConfig[rawKey] !== undefined) {
      // 特殊处理depend（逗号分隔转为数组）
      if (targetKey === 'depend' && typeof rawConfig[rawKey] === 'string') {
        fieldConfig[targetKey] = rawConfig[rawKey].split(',').map(item => item.trim());
      }
      // 特殊处理apiParams（分号分隔转为键值对）
      else if (targetKey === 'apiParams' && typeof rawConfig[rawKey] === 'string') {
        const paramsMap: Record<string, unknown> = {};
        rawConfig[rawKey].split(';').forEach(item => {
          const [paramKey, paramValue] = item.split('=').map(part => part.trim());
          if (paramKey) paramsMap[paramKey] = paramValue;
        });
        fieldConfig[targetKey] = paramsMap;
      }
      else {
        fieldConfig[targetKey] = rawConfig[rawKey];
      }
    }
  });

  return fieldConfig;
};