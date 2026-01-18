/** 基础响应类型（所有接口统一返回格式） */
export interface BaseResponse<T = any> {
  code: number; // 0=成功，非0=失败
  data: T;
  msg: string; // 错误提示信息
}

/** 权限列表接口响应类型 */
export interface PermissionsResponse extends BaseResponse<string[]> {}

/** UI标签配置接口请求参数 */
export interface GetUITagParams {
  model_name: string;
}

/** UI标签配置项（单字段） */
export interface UITagField {
  field: string; // 字段名（如 Username、UIConfig）
  tag: string; // UI标签原始字符串
}

/** UI标签配置接口响应类型 */
export interface GetUITagResponse extends BaseResponse<UITagField[]> {}

/** 数据列表请求参数 */
export interface GetListParams {
  model_name: string;
  page: number; // 页码（默认1）
  page_size: number; // 每页条数（默认10）
  sort?: string; // 排序规则（字段名_asc/字段名_desc）
  filters?: Record<string, any>; // 搜索过滤条件
}

/** 数据列表响应类型 */
export interface GetListResponse<T = any> extends BaseResponse<{
  list: T[]; // 业务数据数组
  total: number; // 符合条件的总条数
}> {}

/** 新增数据请求参数 */
export interface AddDataParams {
  model_name: string;
  data: Record<string, any>; // 新增字段数据
}

/** 编辑数据请求参数（id 独立于 data） */
export interface EditDataParams {
  model_name: string;
  id: number | string; // 主键ID
  data: Record<string, any>; // 修改后字段数据
}

/** 删除数据请求参数（支持单条/批量） */
export interface DeleteDataParams {
  model_name: string;
  ids: (number | string)[]; // 主键ID数组
}

/** 动态数据源接口响应类型 */
export interface DynamicOptionsResponse extends BaseResponse<{
  value: number | string;
  label: string;
  disabled?: boolean;
  color?: string;
}[]> {}