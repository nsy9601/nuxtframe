/** 搜索操作符类型（协议约定的12种操作符） */
export type SearchOperator = 'eq' | 'ne' | 'like' | 'notlike' | 'gt' | 'gte' | 'lt' | 'lte' | 'range' | 'in' | 'isnull' | 'isnotnull';

/** 关联渲染模式类型（协议约定） */
export type RelationMode = 'flat' | 'tags' | 'avatar-group' | 'count' | 'link';

/** 格式化类型（协议约定） */
export type FormatterType = 'date' | 'datetime' | 'currency' | 'percent' | 'img' | 'custom';

/** 内置按钮类型（协议约定） */
export type BuiltInButton = 'view' | 'edit' | 'delete' | 'add';

/** 自定义按钮类型（协议约定格式：custom:xxx） */
export type CustomButton = `custom:${string}`;

/** 按钮类型（内置+自定义） */
export type ButtonType = BuiltInButton | CustomButton;

/** 模型级全局配置（解析后的类型，完全对齐协议） */
export interface ModelGlobalConfig {
  model: string; // 模型唯一标识（必配）
  actions?: ButtonType[]; // 操作按钮列表
  actionWidth?: number; // 操作列固定宽度（默认150）
  actionItemCondition?: Record<string, string>; // 按钮动态显示条件（按钮名:表达式）
  actionLabel?: Record<string, string>; // 按钮文本自定义
  actionIcon?: Record<string, string>; // 按钮图标配置（符合 Nuxt Icon 规范）
  actionClass?: Record<string, string>; // 按钮样式自定义（Tailwind 类名）
  actionPermission?: Record<string, string>; // 按钮权限绑定（按钮名=权限标识）
  actionApi?: Record<string, string>; // 自定义按钮关联接口
  actionMethod?: Record<string, 'GET' | 'POST'>; // 自定义按钮请求方法（默认POST）
  actionCallback?: Record<string, string>; // 自定义按钮回调函数
  searchDefaultCount?: number; // 搜索区默认显示字段数（默认3）
}

/** 字段级基础配置（解析后的类型，完全对齐协议） */
export interface FieldConfig {
  // 基础配置
  label?: string; // 字段显示名称（默认字段名）
  sort?: number; // 全局显示权重（默认99）
  hidden?: boolean; // 全局物理隐藏（默认false）
  table?: boolean; // 表格列显隐（默认true）
  form?: boolean; // 表单项显隐（默认true）
  detail?: boolean; // 详情页显隐（默认true）
  emptyText?: string; // 空值占位符
  tooltip?: string; // 字段说明提示

  // 表单状态与初始化
  default?: any; // 新增时默认值（支持动态表达式）
  placeholder?: string; // 输入提示语
  disabled?: boolean | string; // 全局禁用（支持动态表达式）
  readonly?: boolean; // 全局只读（默认false）
  addHidden?: boolean; // 新增时隐藏（默认false）
  editHidden?: boolean; // 编辑时隐藏（默认false）
  detailHidden?: boolean; // 详情页隐藏（默认false）
  addDisabled?: boolean | string; // 新增时禁用（支持动态表达式）
  editDisabled?: boolean | string; // 编辑时禁用（支持动态表达式）
  required?: boolean; // 表单必填标识（仅显示，默认false）

  // 布局与样式配置
  type?: string; // 前端渲染组件类型（默认UInput）
  span?: string | number; // 表单栅格宽度（默认24）
  searchSpan?: string | number; // 搜索栏栅格宽度（默认6）
  uiClass?: string; // 组件根节点样式
  tableClass?: string; // 表格单元格样式
  formClass?: string; // 表单容器样式
  align?: 'left' | 'center' | 'right'; // 表格列对齐方式（默认left）
  width?: string | number; // 表格列固定宽度
  minWidth?: number; // 表格列最小宽度
  ellipsis?: boolean; // 表格列溢出省略（默认false）
  formLabelWidth?: string | number; // 表单标签宽度

  // 数据源配置（静态/动态）
  options?: string; // 静态枚举数据源
  api?: string; // 动态API数据源路径
  apiParams?: Record<string, any>; // 接口请求参数（支持动态表达式）
  depend?: string[]; // 依赖字段（触发API刷新）
  labelKey?: string; // 接口返回标签字段名（默认label）
  valueKey?: string; // 接口返回值字段名（默认value）
  apiMethod?: 'GET' | 'POST'; // 请求方法（默认GET）
  loadingText?: string; // 加载提示语（默认"加载中..."）
  emptyOptionsText?: string; // 无数据提示语（默认"暂无数据"）

  // 搜索与过滤配置
  search?: boolean; // 启用搜索功能（默认false）
  op?: SearchOperator; // 搜索操作符（默认eq）
  searchDefault?: any; // 搜索默认值（支持动态表达式）
  searchPlaceholder?: string; // 搜索提示语
  multiple?: boolean; // 多值搜索（仅in操作符支持，默认false）

  // 表单校验配置
  rules?: string; // 校验规则（多规则用分号分隔）

  // 模型关系与格式化配置
  path?: string; // 嵌套取值路径
  pathItem?: string; // 数组项取值字段（仅数组关联）
  mode?: RelationMode; // 关联渲染模式（默认flat）
  formatter?: string; // 格式化配置（类型:参数）
}

/** 解析后的完整UI配置（模型级+字段级） */
export interface ParsedUIConfig {
  model: string; // 模型标识
  global: ModelGlobalConfig; // 模型级全局配置
  fields: Record<string, FieldConfig>; // 字段级配置（key=字段名）
}

/** 动态表达式上下文类型 */
export interface ExpressionContext {
  row?: Record<string, any>; // 表格行数据
  formData?: Record<string, any>; // 表单数据
}

// 在 config.ts 末尾添加导出（与 api.ts 中的 UITagField 保持一致）
export interface UITagField {
  field: string;
  tag: string;
}