import type { ParsedUIConfig, FieldConfig, ButtonType } from './config';
import type { GetListParams } from './api';

/** 搜索栏组件Props */
export interface SearchBarProps {
  uiConfig: ParsedUIConfig; // 解析后的UI配置
  modelValue: Record<string, any>; // 搜索表单值
}

/** 表格组件Props */
export interface DataTableProps {
  uiConfig: ParsedUIConfig; // 解析后的UI配置
  dataList: Record<string, any>[]; // 表格数据列表
  total: number; // 总条数
  loading: boolean; // 加载状态
  pageParams: Pick<GetListParams, 'page' | 'page_size' | 'sort'>; // 分页排序参数
}

/** 动态表单组件Props */
export interface DynamicFormProps {
  uiConfig: ParsedUIConfig; // 解析后的UI配置
  modelValue: Record<string, any>; // 表单值
  formType: 'add' | 'edit' | 'detail'; // 表单类型
  loading?: boolean; // 加载状态
}

/** 操作按钮组件Props */
export interface ActionButtonsProps {
  uiConfig: ParsedUIConfig; // 解析后的UI配置
  row?: Record<string, any>; // 单条数据（行操作）
  selectedRows?: Record<string, any>[]; // 选中数据（批量操作）
  isBatch?: boolean; // 是否批量操作
  onRefresh: () => void; // 操作成功后刷新回调
}

/** 列筛选组件Props */
export interface ColumnFilterProps {
  fields: Record<string, FieldConfig>; // 所有字段配置
  visibleColumns: string[]; // 当前显示的列名
  onColumnChange: (visibleColumns: string[]) => void; // 列显示状态变更回调
}

/** 主题切换组件Props */
export interface ThemeSwitcherProps {
  currentTheme: string; // 当前主题
  onThemeChange: (theme: string) => void; // 主题变更回调
}

/** 通用模型页面Props */
export interface ModelPageProps {
  modelName: string; // 模型标识（如'sysuser'）
}