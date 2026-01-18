import type {
  BaseResponse,
  GetUITagResponse,
  GetListResponse,
  PermissionsResponse,
  DynamicOptionsResponse
} from '@/types/api';

// 模拟系统时间（用于日期格式化）
// const getMockTime = () => {
//   const now = new Date();
//   return {
//     timestamp: Math.floor(now.getTime() / 1000),
//     date: now.toISOString().split('T')[0],
//     datetime: now.toISOString().replace('T', ' ').slice(0, 19),
//   };
// };

/**
 * 模拟获取UI标签配置接口（GET /getuitag）
 * @param modelName - 模型名称
 * @returns 协议约定的响应格式
 */
export const mockGetUITag = (modelName: string): GetUITagResponse => {
  // const time = getMockTime();

  // 系统用户模型（sysuser）的标签配置（完全对齐协议综合示例）
  if (modelName === 'sysuser') {
    return {
      code: 0,
      msg: 'success',
      data: [
        {
          field: 'ID',
          tag: 'label:ID;hidden:true;search:false'
        },
        {
          field: 'Username',
          tag: 'label:用户名;table:true;form:true;search:true;op:like;sort:1;rules:required;len:4,20;regex:/^[A-Za-z0-9_]{4,20}$/;tooltip:4-20位字母、数字或下划线'
        },
        {
          field: 'Password',
          tag: 'label:密码;table:false;form:true;add-hidden:false;edit-hidden:true;rules:required;len:6,20;type:UPassword'
        },
        {
          field: 'Email',
          tag: 'label:邮箱;table:true;form:true;search:true;op:notlike;rules:email;placeholder:请输入有效的邮箱地址'
        },
        {
          field: 'Mobile',
          tag: 'label:手机号;table:true;form:true;search:true;op:eq;rules:required;phone;tooltip:请输入11位中国大陆手机号'
        },
        {
          field: 'Nickname',
          tag: 'label:昵称;table:true;form:true;search:true;op:like;sort:2;ui-class:text-blue-500'
        },
        {
          field: 'Sex',
          tag: 'label:性别;table:true;form:true;type:URadioGroup;options:1=男,2=女,0=未知;sort:3'
        },
        {
          field: 'Avatar',
          tag: 'label:头像;table:false;form:true;type:UFileUpload;formatter:img:80x80;search:false'
        },
        {
          field: 'Status',
          tag: 'label:状态;table:true;form:true;search:true;type:USelect;options:1=启用:emerald,0=禁用:rose;op:eq;sort:4;rules:required;enum:0,1'
        },
        {
          field: 'Description',
          tag: 'label:备注;type:UTextarea;table:false;form:true;span:24;rows:3;rules:max:200;search:false'
        },
        {
          field: 'Depts',
          tag: 'label:所属部门;table:true;form:true;type:USelect;mode:tags;path:depts;path-item:name;api:/api/v1/depts;search:false'
        },
        {
          field: 'Roles',
          tag: 'label:角色;table:true;form:true;type:USelect;mode:tags;path:roles;path-item:name;api:/api/v1/roles;search:false'
        },
        {
          field: 'CreatedAt',
          tag: 'label:创建时间;type:UDatePicker;formatter:datetime;add-hidden:true;edit-disabled:true;search:true;op:range'
        },
        {
          field: 'UpdatedAt',
          tag: 'label:更新时间;type:UDatePicker;formatter:datetime;add-hidden:true;edit-hidden:true;search:false'
        },
        {
          field: 'UIConfig',
          tag: 'model:SysUser;actions:view,edit,delete,custom:Audit,custom:Export;action-width:250;search-default-count:3;action-permission:view=sysuser:view;edit=sysuser:edit;delete=sysuser:delete;Audit=sysuser:audit;Export=sysuser:export;action-api:Audit=/api/v1/user/audit;Export=/api/v1/user/export;action-method:Audit=POST;Export=GET;action-callback:Audit=handleAudit;action-label:view:查看详情;edit:编辑用户;delete:删除用户;Audit:审核用户;Export:导出数据;action-icon:Audit:ic:outline:check_circle;Export:ic:outline:download'
        }
      ]
    };
  }

  // 产品模型（product）的标签配置（示例）
  if (modelName === 'product') {
    return {
      code: 0,
      msg: 'success',
      data: [
        {
          field: 'ID',
          tag: 'label:产品ID;hidden:true;search:false'
        },
        {
          field: 'Name',
          tag: 'label:产品名称;table:true;form:true;search:true;op:like;sort:1;rules:required;len:2,50;tooltip:2-50位字符'
        },
        {
          field: 'Price',
          tag: 'label:价格;table:true;form:true;search:true;op:range;type:UNumberInput;formatter:currency;rules:required;min:0;tooltip:请输入正数'
        },
        {
          field: 'Stock',
          tag: 'label:库存;table:true;form:true;search:true;op:range;type:UNumberInput;rules:required;min:0;integer'
        },
        {
          field: 'CategoryId',
          tag: 'label:分类;table:true;form:true;search:true;type:USelect;options:all=全部,api:/api/v1/categories;depend:;label-key:categoryName;value-key:categoryId'
        },
        {
          field: 'Status',
          tag: 'label:状态;table:true;form:true;search:true;type:USelect;options:1=上架:emerald,2=下架:rose,3=预售:amber;op:eq;sort:2;rules:required;enum:1,2,3'
        },
        {
          field: 'CreatedAt',
          tag: 'label:创建时间;type:UDatePicker;formatter:datetime;add-hidden:true;edit-disabled:true;search:true;op:range'
        },
        {
          field: 'UIConfig',
          tag: 'model:Product;actions:view,edit,delete,custom:Export;action-width:200;search-default-count:2;action-permission:view=product:view;edit=product:edit;delete=product:delete;Export=product:export;action-api:Export=/api/v1/product/export;action-method:Export=GET;action-label:view:查看;edit:编辑;delete:删除;Export:导出;action-icon:Export:ic:outline:download'
        }
      ]
    };
  }

  // 默认返回空配置（模型不存在）
  return {
    code: 0,
    msg: 'success',
    data: []
  };
};

/**
 * 模拟获取数据列表接口（POST /getlist）
 * @param modelName - 模型名称
 * @param page - 页码
 * @param pageSize - 每页条数
 * @returns 协议约定的响应格式
 */
export const mockGetList = <T = unknown>(modelName: string, page: number = 1, pageSize: number = 10): GetListResponse<T> => {
  // const time = getMockTime();
  const total = 58; // 模拟总条数

  // 系统用户列表数据
  if (modelName === 'sysuser') {
    const list = Array.from({ length: pageSize }, (_, index) => {
      const id = (page - 1) * pageSize + index + 1;
      return {
        id,
        username: `admin_${id}`,
        nickname: `管理员${id}`,
        email: `admin${id}@example.com`,
        mobile: `13900139${String(id).padStart(4, '0')}`,
        sex: id % 3, // 0=未知，1=男，2=女
        status: id % 2, // 0=禁用，1=启用
        depts: [
          { id: 1, name: '技术部' },
          ...(id % 2 === 0 ? [{ id: 2, name: '产品部' }] : [])
        ],
        roles: [
          { id: 1, name: '超级管理员' }
        ],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      };
    });

    return {
      code: 0,
      msg: 'success',
      data: {
        list: list as unknown as T[],
        total
      }
    };
  }

  // 产品列表数据
  if (modelName === 'product') {
    const list = Array.from({ length: pageSize }, (_, index) => {
      const id = (page - 1) * pageSize + index + 1;
      const price = (Math.random() * 1000 + 100).toFixed(2);
      const stock = Math.floor(Math.random() * 1000);
      return {
        id,
        name: `产品${id} - ${['手机', '电脑', '平板', '耳机'][id % 4]}`,
        price: Number(price),
        stock,
        categoryId: id % 4 + 1,
        categoryName: ['电子产品', '数码配件', '智能家居', '户外设备'][id % 4],
        status: id % 3 + 1, // 1=上架，2=下架，3=预售
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      };
    });

    return {
      code: 0,
      msg: 'success',
      data: {
        list: list as unknown as T[],
        total
      }
    };
  }

  // 默认返回空列表
  return {
    code: 0,
    msg: 'success',
    data: {
      list: [] as T[],
      total: 0
    }
  };
};

/**
 * 模拟获取权限列表接口（GET /getpermissions）
 * @returns 协议约定的响应格式
 */
export const mockGetPermissions = (): PermissionsResponse => {
  // 模拟管理员权限列表
  return {
    code: 0,
    msg: 'success',
    data: [
      'sysuser:view', 'sysuser:edit', 'sysuser:delete', 'sysuser:audit', 'sysuser:export',
      'product:view', 'product:edit', 'product:delete', 'product:export'
    ]
  };
};

/**
 * 模拟动态数据源接口（如部门、角色列表）
 * @param apiPath - 接口路径
 * @returns 协议约定的响应格式
 */
export const mockDynamicOptions = (apiPath: string): DynamicOptionsResponse => {
  // 部门列表
  if (apiPath === '/api/v1/depts') {
    return {
      code: 0,
      msg: 'success',
      data: [
        { value: 1, label: '技术部', color: 'blue' },
        { value: 2, label: '产品部', color: 'purple' },
        { value: 3, label: '运营部', color: 'green' },
        { value: 4, label: '财务部', color: 'orange' },
        { value: 5, label: '人力资源部', color: 'red', disabled: false }
      ]
    };
  }

  // 角色列表
  if (apiPath === '/api/v1/roles') {
    return {
      code: 0,
      msg: 'success',
      data: [
        { value: 1, label: '超级管理员', color: 'emerald' },
        { value: 2, label: '普通管理员', color: 'blue' },
        { value: 3, label: '操作员', color: 'purple' },
        { value: 4, label: '查看者', color: 'gray' }
      ]
    };
  }

  // 产品分类列表
  if (apiPath === '/api/v1/categories') {
    return {
      code: 0,
      msg: 'success',
      data: [
        { value: 1, label: '电子产品', color: 'blue' },
        { value: 2, label: '数码配件', color: 'purple' },
        { value: 3, label: '智能家居', color: 'green' },
        { value: 4, label: '户外设备', color: 'orange' }
      ]
    };
  }

  // 默认返回空选项
  return {
    code: 0,
    msg: 'success',
    data: []
  };
};

/**
 * 模拟新增数据接口（POST /add）
 * @param modelName - 模型名称
 * @param data - 新增数据
 * @returns 协议约定的响应格式
 */
export const mockAddData = (modelName: string, data: Record<string, unknown>): BaseResponse => {
  // 模拟用户名已存在（sysuser模型）
  if (modelName === 'sysuser' && data.username === 'admin_1') {
    return {
      code: 1001,
      msg: '用户名已存在',
      data: null
    };
  }

  // 模拟新增成功
  return {
    code: 0,
    msg: '新增成功',
    data: null
  };
};

/**
 * 模拟编辑数据接口（POST /edit）
 * @param modelName - 模型名称
 * @param id - 主键ID
 * @param data - 编辑数据
 * @returns 协议约定的响应格式
 */
export const mockEditData = (modelName: string, id: number | string, data: Record<string, unknown>): BaseResponse => {
  // 模拟禁用状态下无法编辑（sysuser模型）
  if (modelName === 'sysuser' && data.status === 0 && id === 1) {
    return {
      code: 1002,
      msg: '超级管理员不可禁用',
      data: null
    };
  }

  // 模拟编辑成功
  return {
    code: 0,
    msg: '编辑成功',
    data: null
  };
};

/**
 * 模拟删除数据接口（POST /del）
 * @param modelName - 模型名称
 * @param ids - 主键ID数组
 * @returns 协议约定的响应格式
 */
export const mockDeleteData = (modelName: string, ids: (number | string)[]): BaseResponse => {
  // 模拟超级管理员不可删除（sysuser模型）
  if (modelName === 'sysuser' && ids.includes(1)) {
    return {
      code: 1003,
      msg: '超级管理员不可删除',
      data: null
    };
  }

  // 模拟删除成功
  return {
    code: 0,
    msg: '删除成功',
    data: null
  };
};

/**
 * 模拟自定义按钮接口（如审核、导出）
 * @param apiPath - 接口路径
 * @param data - 请求数据
 * @returns 协议约定的响应格式
 */
export const mockCustomAction = (apiPath: string, _: Record<string, unknown>): BaseResponse => {
  // 模拟审核接口
  if (apiPath === '/api/v1/user/audit') {
    return {
      code: 0,
      msg: '审核成功',
      data: null
    };
  }

  // 模拟导出接口
  if (apiPath.includes('/export')) {
    return {
      code: 0,
      msg: '导出成功',
      data: null
    };
  }

  // 模拟自定义接口失败
  return {
    code: 500,
    msg: '操作失败',
    data: null
  };
};