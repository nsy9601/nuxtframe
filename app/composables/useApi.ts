import { useToast } from '@nuxt/ui/composables';
import type {
  BaseResponse,
  GetListParams,
  GetListResponse,
  AddDataParams,
  EditDataParams,
  DeleteDataParams,
  DynamicOptionsResponse
} from '@/types/api';
import { getUseMockData } from '@/utils/apiSwitch';
import {
  mockGetList,
  mockAddData,
  mockEditData,
  mockDeleteData,
  mockDynamicOptions,
  mockCustomAction
} from '@/utils/mockData';

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const apiBaseUrl = runtimeConfig.public.apiBaseUrl;

/**
 * 获取数据列表（POST /getlist）
 * @param params - 请求参数（模型名+分页+排序+过滤）
 * @returns 协议约定的列表响应
 */
export const useGetList = async <T = unknown>(params: GetListParams): Promise<GetListResponse<T>> => {
  const useMock = getUseMockData();
  const { model_name, page = 1, page_size = 10, sort, filters } = params;

  // 使用虚拟数据
  if (useMock) {
    return mockGetList<T>(model_name, page, page_size);
  }

  // 使用真实接口（按协议约定的格式）
  try {
    const res = await $fetch<GetListResponse<T>>(`${apiBaseUrl}/getlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name,
        page,
        page_size,
        sort,
        filters
      }),
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '获取数据列表失败');
    }
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '获取数据列表失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 新增数据（POST /add）
 * @param modelName - 模型名
 * @param data - 新增字段数据
 * @returns 协议约定的响应
 */
export const useAddData = async (modelName: string, data: Record<string, unknown>): Promise<BaseResponse> => {
  const useMock = getUseMockData();
  const params: AddDataParams = { model_name: modelName, data };

  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockAddData(modelName, data);
    if (mockRes.code !== 0) {
      toast.add({ title: '新增失败', description: mockRes.msg, color: 'error' });
      throw new Error(mockRes.msg);
    }
    toast.add({ title: '成功', description: mockRes.msg, color: 'success' });
    return mockRes;
  }

  // 使用真实接口
  try {
    const res = await $fetch<BaseResponse>(`${apiBaseUrl}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '新增失败');
    }
    toast.add({ title: '成功', description: res.msg, color: 'success' });
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '新增失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 编辑数据（POST /edit）
 * @param modelName - 模型名
 * @param id - 主键ID（独立于data）
 * @param data - 修改后字段数据
 * @returns 协议约定的响应
 */
export const useEditData = async (
  modelName: string,
  id: number | string,
  data: Record<string, unknown>
): Promise<BaseResponse> => {
  const useMock = getUseMockData();
  const params: EditDataParams = { model_name: modelName, id, data };

  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockEditData(modelName, id, data);
    if (mockRes.code !== 0) {
      toast.add({ title: '编辑失败', description: mockRes.msg, color: 'error' });
      throw new Error(mockRes.msg);
    }
    toast.add({ title: '成功', description: mockRes.msg, color: 'success' });
    return mockRes;
  }

  // 使用真实接口
  try {
    const res = await $fetch<BaseResponse>(`${apiBaseUrl}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '编辑失败');
    }
    toast.add({ title: '成功', description: res.msg, color: 'success' });
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '编辑失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 删除数据（POST /del）
 * @param modelName - 模型名
 * @param ids - 主键ID数组（支持单条/批量）
 * @returns 协议约定的响应
 */
export const useDeleteData = async (
  modelName: string,
  ids: (number | string)[]
): Promise<BaseResponse> => {
  const useMock = getUseMockData();
  const params: DeleteDataParams = { model_name: modelName, ids };

  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockDeleteData(modelName, ids);
    if (mockRes.code !== 0) {
      toast.add({ title: '删除失败', description: mockRes.msg, color: 'error' });
      throw new Error(mockRes.msg);
    }
    toast.add({ title: '成功', description: mockRes.msg, color: 'success' });
    return mockRes;
  }

  // 使用真实接口
  try {
    const res = await $fetch<BaseResponse>(`${apiBaseUrl}/del`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '删除失败');
    }
    toast.add({ title: '成功', description: res.msg, color: 'success' });
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '删除失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 获取动态数据源（如下拉选项）
 * @param apiPath - 接口路径
 * @param params - 请求参数
 * @param method - 请求方法（默认GET）
 * @returns 协议约定的选项响应
 */
export const useDynamicOptions = async (
  apiPath: string,
  params?: Record<string, unknown>,
  method: 'GET' | 'POST' = 'GET'
): Promise<DynamicOptionsResponse> => {
  const useMock = getUseMockData();

  // 使用虚拟数据
  if (useMock) {
    return mockDynamicOptions(apiPath);
  }

  // 使用真实接口
  try {
    let res: DynamicOptionsResponse;
    if (method === 'GET') {
      // GET 方法拼接参数
      const queryParams = new URLSearchParams(params as Record<string, string>);
      res = await $fetch<DynamicOptionsResponse>(`${apiBaseUrl}${apiPath}?${queryParams}`, {
        method: 'GET',
      });
    } else {
      // POST 方法参数放入请求体
      res = await $fetch<DynamicOptionsResponse>(`${apiBaseUrl}${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
    }

    if (res.code !== 0) {
      throw new Error(res.msg || '获取选项失败');
    }
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '获取选项失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};

/**
 * 调用自定义按钮接口（如审核、导出）
 * @param apiPath - 接口路径
 * @param data - 请求数据
 * @param method - 请求方法（默认POST）
 * @returns 协议约定的响应
 */
export const useCustomAction = async (
  apiPath: string,
  data: Record<string, unknown>,
  method: 'GET' | 'POST' = 'POST'
): Promise<BaseResponse> => {
  const useMock = getUseMockData();

  // 使用虚拟数据
  if (useMock) {
    const mockRes = mockCustomAction(apiPath, data);
    if (mockRes.code !== 0) {
      toast.add({ title: '操作失败', description: mockRes.msg, color: 'error' });
      throw new Error(mockRes.msg);
    }
    toast.add({ title: '成功', description: mockRes.msg, color: 'success' });
    return mockRes;
  }

  // 使用真实接口
  try {
    const res = await $fetch<BaseResponse>(`${apiBaseUrl}${apiPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined,
      params: method === 'GET' ? data : undefined,
    });

    if (res.code !== 0) {
      throw new Error(res.msg || '操作失败');
    }
    toast.add({ title: '成功', description: res.msg, color: 'success' });
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '操作失败';
    toast.add({ title: '失败', description: errorMsg, color: 'error' });
    throw err;
  }
};