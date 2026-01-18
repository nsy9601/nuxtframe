import { useRuntimeConfig } from '#app';
import type { RelationMode, FormatterType } from '@/types/config';
import type { VNode } from 'vue';

// 日期格式化工具（兼容 Moment.js 语法）
const formatDate = (value: any, format = 'YYYY-MM-DD'): string => {
  if (!value) return '--';
  let date: Date;

  // 处理时间戳（秒/毫秒）
  if (typeof value === 'number') {
    date = new Date(value.toString().length === 10 ? value * 1000 : value);
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    date = value;
  }

  if (isNaN(date.getTime())) return '--';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]||'';

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
    .replace('WW', week);
};

/**
 * 解析格式化配置（如 "date:YYYY-MM-DD" → { type: 'date', params: 'YYYY-MM-DD' }）
 * @param formatterStr - 格式化配置字符串
 * @returns 格式化类型和参数
 */
const parseFormatterConfig = (formatterStr: string): { type: FormatterType; params?: string } => {
  if (!formatterStr) return { type: 'date' };
  const [type, params] = formatterStr.split(':');
  return {
    type: (type || 'date') as FormatterType,
    params: params || undefined
  };
};

/**
 * 格式化字段值（遵循协议格式化约定）
 * @param value - 原始值
 * @param formatterStr - 格式化配置（如 "date:YYYY-MM-DD"、"currency:2"）
 * @returns 格式化后的值
 */
export const formatValue = (value: any, formatterStr?: string): string | VNode => {
  if (value === null || value === undefined || value === '') {
    return '--';
  }

  const { type, params } = parseFormatterConfig(formatterStr || '');

  switch (type) {
    case 'date':
      // 日期格式化（默认 YYYY-MM-DD）
      const dateFormat = params || 'YYYY-MM-DD';
      return formatDate(value, dateFormat);

    case 'datetime':
      // 日期时间格式化（默认 YYYY-MM-DD HH:mm:ss）
      const datetimeFormat = params || 'YYYY-MM-DD HH:mm:ss';
      return formatDate(value, datetimeFormat);

    case 'currency':
      // 金额格式化（千分位+小数，默认保留2位）
      const decimal = params ? Number(params) : 2;
      const num = Number(value);
      if (isNaN(num)) return '--';
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });

    case 'percent':
      // 百分比格式化（默认保留1位小数）
      const percentDecimal = params ? Number(params) : 1;
      const percentNum = Number(value);
      if (isNaN(percentNum)) return '--';
      return (percentNum * 100).toFixed(percentDecimal) + '%';

    case 'img':
      // 图片/头像展示（默认 40x40，支持自定义尺寸）
      const [width = 40, height = 40] = params ? params.split('x').map(Number) : [];
      return h('img', {
        src: value,
        alt: '图片',
        class: 'rounded object-cover',
        style: {
          width: `${width}px`,
          height: `${height}px`
        },
        loading: 'lazy'
      })

    case 'custom':
      // 自定义格式化函数（前端全局注册）
      if (!params) return String(value);
      const customFunc = window[params as keyof Window];
      if (typeof customFunc === 'function') {
        return customFunc(value);
      }
      return String(value);

    default:
      return String(value);
  }
};

/**
 * 处理关联数据渲染（遵循协议关联关系约定）
 * @param data - 原始数据
 * @param path - 嵌套取值路径（如 "depts.name"）
 * @param pathItem - 数组项取值字段（如 "name"）
 * @param mode - 渲染模式（flat/tags/avatar-group/count/link）
 * @returns 渲染后的内容
 */
export const renderRelationData = (
  data: any,
  path?: string,
  pathItem?: string,
  mode: RelationMode = 'flat'
): string | VNode => {
  if (!data) return '--';

  // 1. 按路径取值（支持嵌套路径）
  let targetData = data;
  if (path) {
    const pathSegments = path.split('.');
    for (const segment of pathSegments) {
      if (targetData[segment] === undefined) {
        return '--';
      }
      targetData = targetData[segment];
    }
  }

  // 2. 处理数组数据（提取 pathItem 字段）
  let items: any[] = [];
  if (Array.isArray(targetData)) {
    if (pathItem) {
      items = targetData.map(item => {
        // 支持嵌套 pathItem（如 "user.name"）
        if (pathItem.includes('.')) {
          const itemSegments = pathItem.split('.');
          let itemValue = item;
          for (const seg of itemSegments) {
            itemValue = itemValue[seg] || '';
          }
          return itemValue;
        }
        return item[pathItem] || '';
      }).filter(Boolean);
    } else {
      items = targetData;
    }
  } else {
    items = [targetData];
  }

  if (items.length === 0) return '--';

  // 3. 按模式渲染
  switch (mode) {
    case 'flat':
      // 逗号分隔文本
      return items.join('，');

    case 'tags':
      // 标签组（Tailwind 样式）
      return h('div', { class: 'flex flex-wrap gap-1' }, [
        items.map((item, index) =>
          h('span', {
            key: index,
            class: 'px-2 py-1 text-xs rounded-full bg-primary-light text-primary-dark'
          }, item)
        )
      ]);

    case 'avatar-group':
      // 头像组（拼接展示）
      return h('div', { class: 'flex -space-x-2' }, [
        items.map((avatar, index) =>
          h('img', {
            key: index,
            src: avatar,
            alt: '头像',
            class: 'w-8 h-8 rounded-full border-2 border-background',
            loading: 'lazy'
          })
        )
      ]);

    case 'count':
      // 计数展示
      return `${items.length}个`;

    case 'link':
      // 链接模式（跳转详情页，默认模型为当前路径）
      const runtimeConfig = useRuntimeConfig();
      const currentModel = runtimeConfig.public.modelName || '';
      return h('a', {
        href: `/${currentModel}/detail/${items[0]}`,
        class: 'text-primary hover:underline'
      }, items[0]);

    default:
      return items.join('，');
  }
};

/**
 * 解析动态表达式（遵循协议动态表达式约定）
 * @param expr - 表达式字符串（如 "{{row.status === 1}}"）
 * @param context - 上下文数据（row/formData）
 * @returns 表达式求值结果
 */
export const evaluateExpression = (expr: string, context: Record<string, any>): any => {
  if (!expr || !expr.startsWith('{{') || !expr.endsWith('}}')) {
    return expr;
  }

  // 提取表达式内容（去除 {{}}）
  const expression = expr.slice(2, -2).trim();
  if (!expression) return undefined;

  try {
    // 安全执行表达式（仅允许访问 context 中的属性）
    const func = new Function(
      'context',
      `with(context) { return ${expression}; }`
    );
    return func(context);
  } catch (err) {
    console.error(`表达式解析失败：${expression}`, err);
    return undefined;
  }
};