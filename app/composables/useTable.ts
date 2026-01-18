import { useToast } from '@nuxt/ui/composables';
import * as XLSX from 'xlsx';
import type { ParsedUIConfig } from '@/types/config';
// 导入依赖的格式化函数（避免循环导入）
import { formatValue, renderRelationData } from './useFormatter';
import { isVNode } from 'vue';

const toast = useToast();

/**
 * 缓存表格列显示状态（本地存储）
 * @param modelName - 模型名
 * @param visibleColumns - 显示的列名数组
 */
export const saveVisibleColumns = (modelName: string, visibleColumns: string[]) => {
  localStorage.setItem(`table_visible_${modelName}`, JSON.stringify(visibleColumns));
};

/**
 * 获取缓存的表格列显示状态
 * @param modelName - 模型名
 * @param allColumns - 所有列名数组
 * @returns 缓存的显示列名数组（无缓存则返回所有列）
 */
export const getVisibleColumns = (modelName: string, allColumns: string[]): string[] => {
  const cached = localStorage.getItem(`table_visible_${modelName}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as string[];
      // 过滤掉已不存在的列
      return parsed.filter(col => allColumns.includes(col));
    } catch (err) {
      console.error('解析列显示状态失败', err);
    }
  }
  return [...allColumns];
};

/**
 * 缓存表格每页条数
 * @param modelName - 模型名
 * @param pageSize - 每页条数
 */
export const savePageSize = (modelName: string, pageSize: number) => {
  localStorage.setItem(`table_pagesize_${modelName}`, String(pageSize));
};

/**
 * 获取缓存的表格每页条数
 * @param modelName - 模型名
 * @returns 缓存的每页条数（无缓存则返回10）
 */
export const getPageSize = (modelName: string): number => {
  const cached = localStorage.getItem(`table_pagesize_${modelName}`);
  return cached ? Number(cached) : 10;
};

/**
 * 导出表格数据到Excel（仅导出当前显示数据）
 * @param modelName - 模型名
 * @param uiConfig - UI配置
 * @param dataList - 当前显示的数据列表
 * @param visibleColumns - 当前显示的列名
 */
export const exportTableToExcel = (
  modelName: string,
  uiConfig: ParsedUIConfig,
  dataList: Record<string, unknown>[],
  visibleColumns: string[]
) => {
  if (dataList.length === 0) {
    toast.add({ title: '提示', description: '暂无数据可导出', color: 'info' });
    return;
  }

  // 1. 构建表头（列名→显示标签）
  const headers: Record<string, string> = {};
  visibleColumns.forEach(colName => {
    const fieldConfig = uiConfig.fields[colName];
    headers[colName] = fieldConfig?.label || colName;
  });

  // 2. 处理导出数据（仅保留显示列，格式化值）
  const exportData = dataList.map(row => {
    const item: Record<string, unknown> = {};
    visibleColumns.forEach(colName => {
      const fieldConfig = uiConfig.fields[colName];
      const value = row[colName];

      // 格式化值（日期、金额等）
      if (fieldConfig?.formatter) {
        const formatted = formatValue(value, fieldConfig.formatter);
        // 处理 JSX 元素（如图片，取 src）
        if (typeof formatted !== 'string' && isVNode(formatted)) {
          // Vue 的属性存放在 props 中
          const props = formatted.props;
          // 这里的 headerKey 建议先提取出来，避免多次类型断言
          const headerKey = headers[colName] as string;
          
          if (props && props.src) {
            item[headerKey] = props.src;
          } else {
            item[headerKey] = ''; 
          }
        } else {
          item[headers[colName] as string] = formatted || value;
        }
      } else {
        // 处理关联数据
        if (fieldConfig?.path || fieldConfig?.mode) {
          const relationValue = renderRelationData(
            row,
            fieldConfig.path,
            fieldConfig.pathItem,
            fieldConfig.mode
          );
          item[headers[colName] as string] = typeof relationValue === 'string' ? relationValue : '';
        } else {
          item[headers[colName] as string] = value || '';
        }
      }
    });
    return item;
  });

  // 3. 生成Excel文件
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, modelName);

  // 4. 下载文件
  const fileName = `${modelName}_数据_${new Date().toLocaleDateString()}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  toast.add({ title: '成功', description: `Excel文件已导出（${fileName}）`, color: 'success' });
};

