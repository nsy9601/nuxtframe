# Nuxt UI (v3) 协议规范文档（基于 UI_Tag 驱动·v2.4.0 最终版）
## 文档说明
本规范定义了后端 Gin+Gorm 模型通过 `ui` 标签驱动前端 Nuxt 4 + Nuxt UI (v3) 自动渲染的完整协议。核心特性包括：
1. 标准化「增删改查」接口，编辑接口 `id` 独立于 `data` 字段，适配后端处理习惯；
2. 操作按钮（内置/自定义）支持 RBAC 权限控制，无权角色自动隐藏按钮；
3. 自定义操作按钮支持绑定 API 与前端回调函数，调用时传入完整上下文数据；
4. 全流程使用 Nuxt UI 原生组件实现交互与反馈，贴合 Nuxt 4 生态；
5. 简化错误处理：仅 `code:0` 表示成功，非0为失败（失败信息通过 `msg` 字段返回）。

本版本为最终稳定版，结构清晰、配置详尽、场景覆盖全面，可直接用于前后端协作开发，适配各类需自动渲染与权限管理的业务系统。

## 目录
1. [协议核心约定](#一-协议核心约定)
2. [协议基础格式与通用规则](#二-协议基础格式与通用规则)
3. [模型与基础配置](#三-模型与基础配置)
4. [表单状态与初始化](#四-表单状态与初始化)
5. [布局与样式配置](#五-布局与样式配置)
6. [数据源协议（静态/动态）](#六-数据源协议静态动态)
7. [搜索与过滤协议](#七-搜索与过滤协议)
8. [表单校验协议](#八-表单校验协议)
9. [模型关系与格式化](#九-模型关系与格式化)
10. [行操作协议（按钮/权限）](#十-行操作协议按钮权限)
11. [后端接口规范](#十一-后端接口规范)
12. [综合示例（Gin+Gorm 模型）](#十二-综合示例ginn-gorm-模型)
13. [前端解析器开发指引](#十三-前端解析器开发指引)
14. [版本更新日志](#十四-版本更新日志)
15. [文档使用说明](#十五-文档使用说明)

## 一、协议核心约定
### 1. 接口参数约定（修订）
#### （1）编辑接口参数格式
- 接口路径：`POST /edit`
- 请求参数：`id` 与 `data` 为同级字段，`id` 作为主键标识，`data` 存储修改后字段
- 示例：
  ```json
  {
    "model_name": "sysuser",
    "id": 1, // 独立于data字段
    "data": {
      "Mobile": "13900139000",
      "Status": 0
    }
  }
  ```

#### （2）核心接口统一规则
- 新增：`POST /add`（`model_name` + `data`）
- 编辑：`POST /edit`（`model_name` + `id` + `data`）
- 删除：`POST /del`（`model_name` + `ids` 数组）
- 数据查询：`POST /getlist`（`model_name` + 分页/排序/过滤参数）
- 标签配置：`GET /getuitag`（`model_name` 作为查询参数）
- 权限查询：`GET /getpermissions`（无参数，返回当前用户权限列表）

### 2. 权限控制约定
- 权限配置：通过模型级 `action-permission` 绑定按钮与权限标识（如 `edit=sysuser:edit`）
- 鉴权逻辑：前端获取用户权限列表后，匹配按钮权限标识，无权限则隐藏按钮
- 内置按钮默认权限：`view=模型名:view`、`edit=模型名:edit`、`delete=模型名:delete`、`add=模型名:add`

### 3. 前端交互约定
- 组件使用：所有交互组件均基于 Nuxt UI 实现（如提示用 `useToast`、确认用 `UDialog`）
- 缓存策略：`ui` 标签配置永久缓存（模型不变则不重复请求）
- 错误处理：统一根据 `code` 判断结果，失败时通过 Nuxt UI 提示 `msg` 信息

## 二、协议基础格式与通用规则
### 1. 核心语法规则
- **Tag Key**：固定为 `ui`，不可自定义
- **语法格式**：`key:value;`（多项配置用分号 `;` 分隔，键值对用冒号 `:` 分隔，末尾分号可省略）
- **空格兼容**：键值对前后允许空格（如 `label: 用户名 ; search: true`），前端自动过滤
- **默认解析**：仅写 `key` 无 `value` 时，解析为 `key:true`（例：`search;` → `search:true`）
- **空值处理**：显式配置空值用 `key:` 表示（例：`placeholder:` → 占位提示语为空）
- **转义规则**：需显示分号时用 `;;` 转义（前端解析为单个 `;`）

### 2. 动态表达式规则
- **语法**：支持 `{{表达式}}` 引用动态数据，从 `row`（表格行数据）或 `formData`（表单数据）求值
- **支持场景**：`default`、`disabled`、`api-params` 等配置项
- **表达式限制**：仅支持 JavaScript 语法子集（属性访问、简单运算、三元表达式）
- **示例**：
  - 关联行数据：`disabled:{{row.status === 1}}`
  - 表单联动：`default:{{formData.parentId + '-001'}}`
  - 条件判断：`min:{{formData.type === 'large' ? 10 : 5}}`

### 3. 通用约束
- 字符串值无需加引号（含空格、特殊字符，如 `label:用户名称（必填）`）
- 布尔值仅支持 `true`/`false`（大小写不敏感，前端统一转为小写）
- 数字值直接填写（如 `sort:10`、`span:8`），无需加引号
- 配置键名大小写不敏感（前端统一转为小写处理，如 `Search` → `search`）

## 三、模型与基础配置
分为「模型级全局配置」（仅 `UIConfig` 字段）与「字段级基础配置」（业务字段），全局配置作用于整个模型，字段配置仅作用于当前字段。

### 1. 模型级全局配置（`UIConfig` 字段）
| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| model | 模型唯一标识（全局唯一） | `model:SysUser`、`model:Product` | - | 必配项，前端缓存键与接口参数依据 |
| actions | 操作按钮列表 | 内置按钮（`view`/`edit`/`delete`）、自定义按钮（`custom:Audit`） | - | 示例：`actions:view,edit,custom:Export` |
| action-width | 操作列固定宽度 | 数字（px，如 `action-width:180`） | 150 | 控制表格操作列宽度，避免按钮换行 |
| action-item-condition | 按钮动态显示条件 | `delete:status===0;Audit:status===1` | - | 格式：`按钮名:表达式`，多条件用分号分隔 |
| action-label | 按钮文本自定义 | `view:查看详情;edit:编辑用户` | 内置默认文本 | 自定义按钮默认显示按钮名 |
| action-icon | 按钮图标配置 | `view:ic:outline:visibility` | 内置默认图标 | 符合 Nuxt UI 图标规范（如 `ic:outline:xxx`） |
| action-class | 按钮样式自定义 | `delete:bg-red-500 hover:bg-red-600` | 内置默认样式 | 支持 Tailwind 类名 |
| action-permission | 按钮权限绑定 | `edit=sysuser:edit;delete=sysuser:delete;Audit=sysuser:audit` | - | 格式：`按钮名=权限标识`，与后端 RBAC 一致 |
| action-api | 自定义按钮关联接口 | `Audit=/api/v1/audit;Export=/api/v1/export` | - | 格式：`按钮名=接口路径` |
| action-method | 自定义按钮请求方法 | `Audit=POST;Export=GET` | `POST` | 格式：`按钮名=请求方法` |
| action-callback | 自定义按钮回调函数 | `Audit=handleAudit;Export=handleExport` | - | 格式：`按钮名=函数名`，前端全局注册 |
| search-default-count | 搜索区默认显示字段数 | 正整数（如 `search-default-count:4`） | 3 | 超出部分默认隐藏，可展开 |

### 2. 字段级基础配置（业务字段）
| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| label | 字段显示名称 | 任意字符串（如 `label:用户名`） | 字段名 | 表格列标题、表单标签、搜索提示共用 |
| sort | 全局显示权重 | 整数（如 `sort:1`、`sort:20`） | 99 | 数值越小越靠前，相同值按字段定义顺序排序 |
| hidden | 全局物理隐藏 | `true`/`false` | `false` | 优先级最高，覆盖 `table`/`form`/`detail` 配置 |
| table | 表格列显隐 | `true`/`false` | `true` | 控制表格是否显示该字段 |
| form | 表单项显隐 | `true`/`false` | `true` | 控制新增/编辑表单是否显示该字段 |
| detail | 详情页显隐 | `true`/`false` | `true` | 控制详情页是否显示该字段 |
| empty-text | 空值占位符 | `empty-text:暂无数据`、`empty-text:--` | - | 字段值为 `null`/空字符串时显示 |
| tooltip | 字段说明提示 | `tooltip:用户登录账号，唯一标识` | - | 悬浮显示（使用 Nuxt UI 的 `UTooltip` 组件） |

## 四、表单状态与初始化
针对表单「新增」「编辑」「详情」三种状态，精细化控制字段的可见性、可操作性与默认值。

| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| default | 新增时默认值 | 固定值（`default:0`）、动态表达式（`default:{{now}}`） | - | 仅「新增」表单生效，`now` 为当前时间戳 |
| placeholder | 输入提示语 | `placeholder:请输入11位手机号` | 自动生成（如 `请输入用户名`） | 仅输入类组件生效 |
| disabled | 全局禁用 | `true`/`false`、动态表达式（`disabled:{{row.status === 2}}`） | `false` | 禁用后不可编辑，仅展示 |
| readonly | 全局只读 | `true`/`false` | `false` | 可选中复制，样式与禁用区分 |
| add-hidden | 新增时隐藏 | `true`/`false` | `false` | 新增表单不显示（如 ID、创建时间） |
| edit-hidden | 编辑时隐藏 | `true`/`false` | `false` | 编辑表单不显示（如无需修改的关联ID） |
| detail-hidden | 详情页隐藏 | `true`/`false` | `false` | 详情页不显示该字段 |
| add-disabled | 新增时禁用 | `true`/`false`、动态表达式 | `false` | 新增表单字段禁用（如系统预设值） |
| edit-disabled | 编辑时禁用 | `true`/`false`、动态表达式（`edit-disabled:{{row.createTime < '2024-01-01'}}`） | `false` | 编辑表单字段禁用（如账号名、创建时间） |
| required | 表单必填标识（仅显示） | `true`/`false` | `false` | 控制前端显示必填星号，校验逻辑需通过 `rules` 配置 |

## 五、布局与样式配置
控制表单栅格布局、表格列样式、组件外观，适配不同页面排版需求，支持 Tailwind CSS 样式透传。

| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| type | 前端渲染组件类型 | Nuxt UI 组件名（`UInput`/`USelect`/`UDatePicker`/`UTextarea`/`UFileUpload`/`URadioGroup` 等）、自定义组件（`custom:ProductSelect`） | `UInput` | 直接映射 Nuxt UI 组件，自定义组件需放在 `app/components/custom/` 目录 |
| span | 表单栅格宽度（24格布局） | 1~24（如 `span:8`、`span:12`） | 24 | 支持响应式（`span:md-12 lg-8`，适配不同屏幕尺寸） |
| search-span | 搜索栏栅格宽度 | 1~24（如 `search-span:6`、`search-span:12`） | 6 | 控制搜索项占比，多个搜索项自动换行 |
| ui-class | 组件根节点样式 | Tailwind 类名（`ui-class:font-bold text-blue-500`）、多类名（`ui-class:py-2 px-4 bg-gray-50`） | - | 支持所有 Tailwind 工具类 |
| table-class | 表格单元格样式 | Tailwind 类名（`table-class:text-red-600 font-mono`） | - | 仅作用于表格 `td`/`th` 标签 |
| form-class | 表单容器样式 | Tailwind 类名（`form-class:mb-4`） | - | 作用于表单字段的外层容器 |
| align | 表格列对齐方式 | `left`/`center`/`right` | `left` | 仅控制表格单元格文本对齐 |
| width | 表格列固定宽度 | 数字（px，如 `width:150`）、百分比（如 `width:20%`） | 自动 | 固定宽度时优先使用，超出部分按 `ellipsis` 配置处理 |
| min-width | 表格列最小宽度 | 数字（px，如 `min-width:120`） | - | 防止列宽过窄导致内容挤压 |
| ellipsis | 表格列溢出省略 | `true`/`false` | `false` | 为 `true` 时显示省略号，悬浮展示完整内容（自动包裹 `UTooltip`） |
| form-label-width | 表单标签宽度 | 数字（px，如 `form-label-width:100`）、百分比（`form-label-width:15%`） | 自动 | 统一表单标签宽度，优化排版一致性 |

## 六、数据源协议（静态/动态）
用于下拉选择、单选/多选组件的数据源配置，支持静态枚举、动态 API 联动两种方式，适配选项固定或动态变化的场景。

### 1. 静态枚举（Static）
直接在标签中定义数据源，适用于选项固定不变的场景（如状态、类型等）。

#### 格式
`options:值1=标签1:颜色1:状态1,值2=标签2:颜色2:状态2,...`
- 分隔符说明：`=` 分隔「值-标签」，`:` 分隔「标签-颜色-状态」，`,` 分隔多个选项
- 可选字段：颜色、状态为可选，仅需标签时可简写为 `值=标签`

#### 支持配置
- **颜色**：支持 Tailwind 颜色类（如 `emerald`/`rose`/`blue`/`amber`），用于渲染选项颜色
- **状态**：仅支持 `disabled`（禁用该选项），不配置则为启用状态

#### 示例
- 基础用法：`options:1=上架,0=下架`
- 带颜色：`options:1=正常:emerald,0=禁用:rose`
- 带禁用：`options:1=可选,2=不可选:gray:disabled`
- 完整配置：`options:3=待审核:amber,2=审核通过:emerald,1=审核驳回:rose:disabled`

### 2. 动态 API（Dynamic）
通过后端接口获取数据源，支持依赖字段联动（如选择省份后，动态加载对应城市列表）。

| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| api | 数据源接口路径（GET/POST） | `api:/api/v1/warehouses`、`api:/api/v1/departments` | - | 必配项，接口返回格式需统一 |
| api-params | 接口请求参数 | 固定参数（`api-params:type=1`）、动态参数（`api-params:pid={{parentId}}`）、多参数（`api-params:pid={{parentId}};status=active`） | - | GET 拼接 URL，POST 放入请求体 |
| depend | 依赖字段（触发 API 刷新） | 字段名（`depend:provinceId`）、多字段（`depend:provinceId,cityId`） | - | 依赖字段值变化时，重新请求 API 刷新选项 |
| label-key | 接口返回「标签」字段名 | 任意字符串（`label-key:warehouseName`） | `label` | 接口返回标签字段非 `label` 时指定 |
| value-key | 接口返回「值」字段名 | 任意字符串（`value-key:warehouseId`） | `value` | 接口返回值字段非 `value` 时指定 |
| api-method | 请求方法 | `GET`/`POST` | `GET` | POST 请求时，`api-params` 放入请求体 |
| loading-text | 加载提示语 | 任意字符串（`loading-text:加载中...`） | `加载中...` | API 请求过程中显示的提示 |
| empty-options-text | 无数据提示语 | 任意字符串（`empty-options-text:暂无匹配数据`） | `暂无数据` | API 返回空数组时显示 |

#### 接口返回格式要求
```json
{
  "code": 0,
  "data": [
    { "value": 1, "label": "北京仓库" },
    { "value": 2, "label": "上海仓库", "disabled": true },
    { "value": 3, "label": "广州仓库", "color": "blue" }
  ],
  "msg": "success"
}
```

### 3. 混合模式（静态+动态）
支持静态选项与动态 API 选项结合，静态选项优先显示（如「全部」选项+动态列表）。
- 格式：`options:all=全部,api:/api/v1/users`
- 说明：静态选项需放在前面，用逗号与 `api` 分隔，动态参数通过 `api-params` 配置

## 七、搜索与过滤协议
前端根据 `search:true` 自动生成搜索栏，支持多种查询操作符，适配精确匹配、模糊搜索、区间查询等场景，同时支持搜索区折叠/展开优化布局。

| 键名 | 描述 | 可选值 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| search | 启用搜索功能 | `true`/`false` | `false` | 为 `true` 时，搜索栏显示该字段 |
| op | 搜索操作符（统一小写） | `eq`(=)、`ne`(!=)、`like`(包含模糊)、`notlike`(不包含模糊)、`gt`(>)、`gte`(>=)、`lt`(<)、`lte`(<=)、`range`(区间)、`in`(包含)、`isnull`(为空)、`isnotnull`(不为空) | `eq` | 前端根据操作符渲染对应组件与提示语 |
| search-default | 搜索默认值 | 固定值、动态表达式（`search-default:{{now-7d}}`） | - | 页面初始化时搜索框的默认值 |
| search-placeholder | 搜索提示语 | 任意字符串（`search-placeholder:请输入产品编号`） | 自动生成（如 `op:like` 对应 `搜索用户名关键词...`） | 优先级高于自动生成的提示语 |
| multiple | 多值搜索（仅 `in` 操作符支持） | `true`/`false` | `false` | 为 `true` 时，支持输入多个值（用逗号分隔） |

### 操作符前端渲染规则
| 操作符 | 渲染组件 | 自动提示语 | 示例 |
| --- | --- | --- | --- |
| eq | 输入框/下拉选择 | `等于{{label}}...` | 搜索用户名=admin |
| ne | 输入框/下拉选择 | `不等于{{label}}...` | 搜索状态≠启用 |
| like | 输入框 | `包含{{label}}关键词...` | 搜索用户名含「张」 |
| notlike | 输入框 | `不包含{{label}}关键词...` | 搜索用户名不含「测试」 |
| gt | 数字输入框/日期选择器 | `大于{{label}}...` | 搜索年龄>18 |
| gte | 数字输入框/日期选择器 | `大于等于{{label}}...` | 搜索创建时间≥2024-01-01 |
| lt | 数字输入框/日期选择器 | `小于{{label}}...` | 搜索库存<10 |
| lte | 数字输入框/日期选择器 | `小于等于{{label}}...` | 搜索销量≤1000 |
| range | 双输入框（数字/日期） | `{{label}}区间...` | 搜索价格100~200 |
| in | 输入框/多选组件 | `输入多个{{label}}（逗号分隔）...` | 搜索ID包含1,2,3 |
| isnull | 复选框 | `{{label}}为空` | 勾选后查询字段为空的数据 |
| isnotnull | 复选框 | `{{label}}不为空` | 勾选后查询字段不为空的数据 |

### 搜索区折叠/展开逻辑
1. 前端解析模型全局配置的 `search-default-count`（默认3）；
2. 统计所有 `search:true` 的搜索字段总数 `totalCount`；
3. 若 `totalCount ≤ search-default-count`：显示所有搜索字段，不显示折叠/展开按钮；
4. 若 `totalCount > search-default-count`：默认显示前 `search-default-count` 个字段，其余隐藏，显示「展开更多」按钮；
5. 点击「展开更多」：显示所有搜索字段，按钮切换为「收起」；
6. 点击「收起」：仅显示前 `search-default-count` 个字段，按钮切换为「展开更多」；
7. 状态记忆：前端缓存当前展开/收起状态，页面刷新后保持。

## 八、表单校验协议
后端通过 `rules` 标签定义表单校验逻辑，前端解析后转化为 Zod 校验规则，支持多规则组合与自定义提示语。

### 1. 基础规则（无参数）
| 规则名称 | 描述 | 示例 | 前端校验逻辑 |
| --- | --- | --- | --- |
| required | 必填项（非空） | `rules:required` | 禁止输入空值（空字符串、null、undefined） |
| email | 邮箱格式校验 | `rules:email` | 匹配邮箱正则（`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`） |
| phone | 手机号格式校验（中国大陆） | `rules:phone` | 匹配手机号正则（`/^1[3-9]\d{9}$/`） |
| number | 数字格式（整数/小数） | `rules:number` | 允许输入整数、小数（支持正负号、小数点） |
| integer | 整数格式 | `rules:integer` | 仅允许输入整数（支持正负号） |
| url | URL 格式校验 | `rules:url` | 匹配 URL 正则（支持 http/https/ftp） |
| idcard | 18位身份证格式校验 | `rules:idcard` | 匹配18位身份证正则（含最后一位校验码） |

### 2. 带参数规则（冒号后跟参数）
| 规则名称 | 描述 | 示例 | 前端校验逻辑 |
| --- | --- | --- | --- |
| len | 固定长度（字符串/数组） | `rules:len:6` | 字符串长度或数组元素个数必须等于指定值 |
| min | 最小值/最小长度 | `rules:min:5` | 数字≥指定值；字符串/数组长度≥指定值 |
| max | 最大值/最大长度 | `rules:max:100` | 数字≤指定值；字符串/数组长度≤指定值 |
| regex | 正则表达式匹配 | `rules:regex:/^[A-Za-z0-9]{6,16}$/` | 按指定正则表达式校验（正则无需加引号） |
| enum | 枚举值校验 | `rules:enum:1,2,3`、`rules:enum:正常,禁用` | 输入值必须是枚举列表中的某一项（大小写敏感） |

### 3. 多规则组合与自定义提示
- **组合格式**：多规则用分号 `;` 分隔（例：`rules:required;phone;min:11;max:11`）；
- **自定义提示**：格式为 `规则=提示语`（例：`rules:required=用户名不能为空;len:6=用户名必须6个字符`）；
- **组合示例**：
  - 手机号必填且格式正确：`rules:required=手机号不能为空;phone=请输入正确的手机号`；
  - 密码（6-16位字母数字）：`rules:required;len:6,16;regex:/^[A-Za-z0-9]{6,16}$/=密码仅支持字母数字`。

## 九、模型关系与格式化
用于处理关联数据展示（如多对多标签、嵌套对象属性）和字段值格式化（如日期、金额、图片），适配复杂数据结构的渲染需求。

### 1. 关联关系（Relations）
| 键名 | 描述 | 可选值/示例 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| path | 嵌套取值路径 | 单层级（`path:user.name`）、多层级（`path:user.profile.avatar`）、数组（`path:tags`） | - | 从 `row`/`formData` 中获取关联数据的路径 |
| path-item | 数组项取值字段（仅数组关联） | 字段名（`path-item:name`）、多层级（`path-item:user.nickname`） | - | 当 `path` 指向数组时，指定数组项的展示字段 |
| mode | 关联渲染模式 | `flat`(扁平文本)、`tags`(标签组)、`avatar-group`(头像组)、`count`(计数)、`link`(链接) | `flat` | 不同模式对应不同前端渲染样式 |

#### 渲染模式说明
| 模式 | 描述 | 适用场景 | 示例 |
| --- | --- | --- | --- |
| flat | 逗号分隔文本 | 简单数组/对象属性展示 | 标签数组 `[{name:"手机"},{name:"数码"}]` → 「手机,数码」 |
| tags | Tailwind 样式标签组 | 多标签展示（需配置颜色时优先使用） | 状态数组 → 带颜色的标签集合 |
| avatar-group | 圆形头像拼接 | 头像列表展示（如成员头像） | 头像数组 `[{avatar:"url1"},{avatar:"url2"}]` → 头像拼接 |
| count | 计数展示（显示数组长度） | 仅需展示关联数据个数 | 订单数组 → 「3个订单」 |
| link | 链接模式（可点击跳转） | 关联对象详情跳转 | 用户名 → 可点击链接，跳转至用户详情页 |

### 2. 格式化（Formatting）
对字段原始值进行格式化处理，支持内置格式和自定义格式。

| 格式类型 | 描述 | 配置示例 | 渲染结果 |
| --- | --- | --- | --- |
| date | 日期格式化 | 内置格式（`formatter:date`）、自定义格式（`formatter:date:YYYY-MM-DD`） | 时间戳 1735689600 → 2024-12-01 |
| datetime | 日期时间格式化 | `formatter:datetime`、`formatter:datetime:MM-DD HH:mm` | 时间戳 → 12-01 00:00 |
| currency | 金额格式化（千分位+小数） | `formatter:currency`、`formatter:currency:0`（保留0位小数） | 12345.67 → 12,345.67 |
| percent | 百分比格式化（乘以100） | `formatter:percent`、`formatter:percent:1`（保留1位小数） | 0.123 → 12.3% |
| img | 图片/头像展示 | `formatter:img`（默认尺寸）、`formatter:img:80x80`（宽高80px） | 图片URL → 图片元素（使用 Nuxt UI 的 `UImg`） |
| custom | 自定义格式化函数 | `formatter:custom:StatusFormat` | 调用前端自定义函数 `StatusFormat` 处理值 |

#### 日期格式占位符（兼容 Moment.js 语法）
| 占位符 | 描述 | 示例 |
| --- | --- | --- |
| YYYY | 4位年份 | 2024 |
| MM | 2位月份 | 01~12 |
| DD | 2位日期 | 01~31 |
| HH | 24小时制小时 | 00~23 |
| mm | 分钟 | 00~59 |
| ss | 秒 | 00~59 |
| WW | 星期 | 一~日 |

## 十、行操作协议（按钮/权限）
用于表格行操作列的按钮配置（如查看、编辑、删除、自定义审核按钮），支持动态显示、权限控制、自定义 API 与回调函数。

### 1. 内置按钮说明
| 按钮名 | 默认文本 | 默认图标 | 功能说明 | 默认权限标识 |
| --- | --- | --- | --- | --- |
| view | 查看 | `ic:outline:visibility` | 触发查看详情事件，跳转至详情页 | 模型名:view（如 `sysuser:view`） |
| edit | 编辑 | `ic:outline:edit` | 触发编辑事件，打开编辑表单 | 模型名:edit（如 `sysuser:edit`） |
| delete | 删除 | `ic:outline:delete` | 触发删除事件，显示确认弹窗 | 模型名:delete（如 `sysuser:delete`） |
| add | 新增 | `ic:outline:add` | 触发新增事件，打开新增表单 | 模型名:add（如 `sysuser:add`） |

### 2. 自定义按钮说明
- 格式：`custom:按钮名`（如 `custom:Audit`、`custom:Export`）；
- 前端要求：自定义按钮需在 `app/components/custom/actions/` 目录下创建对应组件，或全局注册回调函数；
- 核心配置：通过 `action-api`（关联接口）、`action-method`（请求方法）、`action-callback`（回调函数）绑定功能。

### 3. 权限控制逻辑
1. 前端通过 `/getpermissions` 接口获取当前用户权限列表；
2. 解析模型全局配置的 `action-permission`，得到按钮与权限标识的映射关系；
3. 对每个按钮进行权限校验：
   - 有配置 `action-permission`：校验用户是否拥有对应的权限标识；
   - 无配置 `action-permission`：使用内置按钮的默认权限标识校验；
   - 自定义按钮无配置：默认隐藏（需显式配置权限标识才显示）；
4. 无权限的按钮直接隐藏，不渲染到页面。

### 4. 自定义按钮调用逻辑
1. 点击自定义按钮时，先执行权限校验（无权限则提示并返回）；
2. 若配置 `action-callback`：调用前端全局注册的回调函数，传入参数：
   ```javascript
   {
     data: 当前行数据/选中数据, // 单条操作传行数据，批量操作传选中数据数组
     api: 按钮关联的接口路径,    // 从 action-api 解析
     method: 接口请求方法,      // 从 action-method 解析（默认 POST）
     modelName: 模型标识        // 从 model 解析
   }
   ```
3. 若未配置 `action-callback` 但配置 `action-api`：前端自动发送请求，携带参数并处理结果；
4. 操作成功后刷新数据列表，失败则显示错误提示。

## 十一、后端接口规范
### 1. 接口清单与格式
#### （1）获取 UI 标签配置接口
- 请求方式：`GET`
- 接口地址：`/getuitag`
- 请求参数：`model_name`（模型名称，如 `sysuser`）
- 响应示例：
  ```json
  {
    "code": 0,
    "data": [
      {
        "field": "Username",
        "tag": "label:用户名;table:true;form:true;search:true;op:like;sort:1;rules:required"
      },
      {
        "field": "UIConfig",
        "tag": "model:SysUser;actions:view,edit,delete,custom:Audit;action-permission:edit=sysuser:edit;Audit=sysuser:audit;action-api:Audit=/api/v1/audit;action-callback:Audit=handleAudit"
      }
    ],
    "msg": "success"
  }
  ```

#### （2）获取业务数据列表接口
- 请求方式：`POST`
- 接口地址：`/getlist`
- 请求参数：
  ```json
  {
    "model_name": "sysuser",
    "page": 1,          // 页码（默认1）
    "page_size": 10,     // 每页条数（默认10）
    "sort": "Username_asc", // 排序规则（字段名_asc/字段名_desc）
    "filters": {         // 搜索过滤条件（键为字段名，值为查询值）
      "Username": "admin",
      "Status": 1,
      "CreateTime": ["2024-01-01", "2024-12-31"]
    }
  }
  ```
- 响应示例：
  ```json
  {
    "code": 0,
    "data": {
      "list": [/* 业务数据数组 */],
      "total": 3 // 符合条件的总条数
    },
    "msg": "success"
  }
  ```

#### （3）新增数据接口
- 请求方式：`POST`
- 接口地址：`/add`
- 请求参数：
  ```json
  {
    "model_name": "sysuser",
    "data": {
      "Username": "testuser",
      "Mobile": "13800138000",
      "Status": 1
    }
  }
  ```
- 响应示例（成功）：`{"code":0,"msg":"新增成功","data":null}`
- 响应示例（失败）：`{"code":1001,"msg":"用户名已存在","data":null}`

#### （4）编辑数据接口
- 请求方式：`POST`
- 接口地址：`/edit`
- 请求参数（`id` 独立于 `data`）：
  ```json
  {
    "model_name": "sysuser",
    "id": 1,
    "data": {
      "Mobile": "13900139000",
      "Status": 0
    }
  }
  ```
- 响应示例：`{"code":0,"msg":"编辑成功","data":null}`

#### （5）删除数据接口
- 请求方式：`POST`
- 接口地址：`/del`
- 请求参数（支持单条/批量）：
  ```json
  {
    "model_name": "sysuser",
    "ids": [1, 2, 3] // 单条删除传 [1]
  }
  ```
- 响应示例：`{"code":0,"msg":"删除成功","data":null}`

#### （6）获取权限列表接口
- 请求方式：`GET`
- 接口地址：`/getpermissions`
- 响应示例：
  ```json
  {
    "code": 0,
    "data": ["sysuser:view", "sysuser:edit", "sysuser:audit"],
    "msg": "success"
  }
  ```

### 2. 接口通用约束
- 所有接口请求/响应均为 JSON 格式；
- 跨域支持：后端需配置 CORS，允许前端域名访问；
- 认证机制：可根据业务需求添加 Token 认证（如请求头 `Authorization: Bearer xxx`）；
- 错误处理：失败响应的 `msg` 字段需包含清晰的错误原因，方便前端展示。

## 十二、综合示例（Gin+Gorm 模型）
```go
package model

import (
	"time"
	"gorm.io/gorm"
)

// 公共基础模型（多模型共享，无 UI 全局配置）
type BaseModel struct {
	ID        uint           `gorm:"primarykey" json:"id" ui:"label:ID;hidden:true;search:false"`
	CreatedAt time.Time      `json:"createdAt" ui:"label:创建时间;type:UDatePicker;formatter:datetime;add-hidden:true;edit-disabled:true;search:true;op:range"`
	UpdatedAt time.Time      `json:"updatedAt" ui:"label:更新时间;type:UDatePicker;formatter:datetime;add-hidden:true;edit-hidden:true;search:false"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-" ui:"hidden:true"`
}

// 系统用户模型（含独立 UIConfig 全局配置字段）
type SysUser struct {
	BaseModel
	Username    string      `json:"username" ui:"label:用户名;table:true;form:true;search:true;op:like;sort:1;rules:required;len:4,20;regex:/^[A-Za-z0-9_]{4,20}$/;tooltip:4-20位字母、数字或下划线"`
	Password    string      `json:"password" ui:"label:密码;table:false;form:true;add-hidden:false;edit-hidden:true;rules:required;len:6,20;type:UPassword"`
	Email       string      `json:"email" ui:"label:邮箱;table:true;form:true;search:true;op:notlike;rules:email;placeholder:请输入有效的邮箱地址"`
	Mobile      string      `json:"mobile" ui:"label:手机号;table:true;form:true;search:true;op:eq;rules:required;phone;tooltip:请输入11位中国大陆手机号"`
	Nickname    string      `json:"nickname" ui:"label:昵称;table:true;form:true;search:true;op:like;sort:2;ui-class:text-blue-500"`
	Sex         int         `json:"sex" ui:"label:性别;table:true;form:true;type:URadioGroup;options:1=男,2=女,0=未知;sort:3"`
	Avatar      string      `json:"avatar" ui:"label:头像;table:false;form:true;type:UFileUpload;formatter:img:80x80;search:false"`
	Status      int         `json:"status" ui:"label:状态;table:true;form:true;search:true;type:USelect;options:1=启用:emerald,0=禁用:rose;op:eq;sort:4;rules:required;enum:0,1"`
	Description string      `json:"description" ui:"label:备注;type:UTextarea;table:false;form:true;span:24;rows:3;rules:max:200;search:false"`
	Depts       []Dept      `gorm:"many2many:sys_user_depts;" json:"depts" ui:"label:所属部门;table:true;form:true;type:USelect;mode:tags;path:depts;path-item:name;api:/api/v1/depts;search:false"`
	Roles       []Role      `gorm:"many2many:sys_user_roles;" json:"roles" ui:"label:角色;table:true;form:true;type:USelect;mode:tags;path:roles;path-item:name;api:/api/v1/roles;search:false"`

	// 模型级全局配置（独立字段，仅存 ui 标签，不序列化）
	UIConfig string `json:"-" ui:"model:SysUser;actions:view,edit,delete,custom:Audit,custom:Export;action-width:250;search-default-count:3;action-permission:view=sysuser:view;edit=sysuser:edit;delete=sysuser:delete;Audit=sysuser:audit;Export=sysuser:export;action-api:Audit=/api/v1/user/audit;Export=/api/v1/user/export;action-method:Audit=POST;Export=GET;action-callback:Audit=handleAudit;action-label:view:查看详情;edit:编辑用户;delete:删除用户;Audit:审核用户;Export:导出数据;action-icon:Audit:ic:outline:check_circle;Export:ic:outline:download"`
}

// 部门模型（关联模型）
type Dept struct {
	ID   uint   `gorm:"primarykey" json:"id"`
	Name string `json:"name" ui:"label:部门名称"`
}

// 角色模型（关联模型）
type Role struct {
	ID   uint   `gorm:"primarykey" json:"id"`
	Name string `json:"name" ui:"label:角色名称"`
}

// 表名映射
func (SysUser) TableName() string { return "sys_users" }
func (Dept) TableName() string    { return "sys_depts" }
func (Role) TableName() string    { return "sys_roles" }
```

## 十三、前端解析器开发指引（Nuxt 4 + Nuxt UI）
### 1. 核心目录结构
```
components/
├── custom/                # 自定义组件目录
│   ├── ProductSelect.vue  # 自定义表单组件
│   └── actions/           # 自定义操作按钮组件
│       └── AuditAction.vue
composables/
├── useUIConfig.js         # UI标签配置解析与缓存
├── usePermissions.js      # 权限校验逻辑
├── useApi.js              # 核心接口请求函数
└── useFormatter.js        # 数据格式化工具
pages/
├── [model]/               # 模型列表页（动态路由）
│   ├── index.vue          # 表格+搜索栏
│   ├── create.vue         # 新增表单
│   ├── edit/[id].vue      # 编辑表单
│   └── detail/[id].vue    # 详情页
```

### 2. 关键功能实现
#### （1）UI 标签解析与缓存
```javascript
// composables/useUIConfig.js
import { useToast } from 'nuxt/ui/composables';

const toast = useToast();
const uiConfigCache = {}; // 全局缓存：key=模型名，value=解析后的配置

// 获取并解析 UI 标签配置
export const fetchAndParseUIConfig = async (modelName) => {
  // 优先从缓存获取
  if (uiConfigCache[modelName]) {
    return uiConfigCache[modelName];
  }

  try {
    // 请求标签配置接口
    const res = await $fetch(`/getuitag?model_name=${modelName}`, { method: 'GET' });
    if (res.code !== 0) throw new Error(res.msg || '获取标签配置失败');

    // 解析配置（分全局配置和字段配置）
    const parsedConfig = {
      model: modelName,
      global: {}, // 模型级全局配置（来自 UIConfig 字段）
      fields: {}  // 字段级配置（来自业务字段）
    };

    res.data.forEach(({ field, tag }) => {
      const tagObj = parseTagString(tag);
      if (field === 'UIConfig') {
        parsedConfig.global = tagObj;
      } else {
        parsedConfig.fields[field] = tagObj;
      }
    });

    // 缓存解析后的配置
    uiConfigCache[modelName] = parsedConfig;
    return parsedConfig;
  } catch (err) {
    toast.add({ title: '错误', description: err.message, variant: 'destructive' });
    throw err;
  }
};

// 解析标签字符串为键值对
const parseTagString = (tagStr) => {
  const result = {};
  if (!tagStr) return result;

  // 按分号分割配置项，过滤空项
  const items = tagStr.split(';').filter(item => item.trim());

  items.forEach(item => {
    const [key, value] = item.split(':').map(part => part.trim());
    if (!key) return;

    // 处理默认值（仅key无value时设为true）
    if (value === undefined) {
      result[key] = true;
      return;
    }

    // 类型转换（布尔值、数字）
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (!isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  });

  return result;
};
```

#### （2）权限校验逻辑
```javascript
// composables/usePermissions.js
import { useToast } from 'nuxt/ui/composables';

const toast = useToast();
let userPermissions = []; // 缓存用户权限列表

// 获取用户权限列表
export const fetchUserPermissions = async () => {
  if (userPermissions.length > 0) return userPermissions;

  try {
    const res = await $fetch('/getpermissions', { method: 'GET' });
    if (res.code === 0) {
      userPermissions = res.data;
    }
    return userPermissions;
  } catch (err) {
    toast.add({ title: '权限获取失败', description: err.message, variant: 'destructive' });
    return [];
  }
};

// 校验按钮权限
export const checkButtonPermission = async (buttonName, modelName, actionPermission) => {
  const permissions = await fetchUserPermissions();

  // 无权限配置时，使用默认权限标识
  if (!actionPermission) {
    const defaultPerm = `${modelName}:${buttonName}`;
    return permissions.includes(defaultPerm);
  }

  // 解析权限配置（格式：按钮名=权限标识;...）
  const permMap = {};
  actionPermission.split(';').forEach(item => {
    const [btn, perm] = item.split('=').map(part => part.trim());
    if (btn && perm) permMap[btn] = perm;
  });

  // 自定义按钮无权限配置时，默认隐藏
  const targetPerm = permMap[buttonName];
  return targetPerm ? permissions.includes(targetPerm) : false;
};
```

#### （3）核心接口请求函数
```javascript
// composables/useApi.js
import { useToast } from 'nuxt/ui/composables';

const toast = useToast();

// 新增数据
export const submitAddForm = async (modelName, formData) => {
  try {
    const res = await $fetch('/add', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName, data: formData })
    });

    if (res.code !== 0) throw new Error(res.msg || '新增失败');
    toast.add({ title: '成功', description: '新增数据成功', variant: 'success' });
    return res;
  } catch (err) {
    toast.add({ title: '失败', description: err.message, variant: 'destructive' });
    throw err;
  }
};

// 编辑数据
export const submitEditForm = async (modelName, id, formData) => {
  try {
    const res = await $fetch('/edit', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName, id, data: formData })
    });

    if (res.code !== 0) throw new Error(res.msg || '编辑失败');
    toast.add({ title: '成功', description: '编辑数据成功', variant: 'success' });
    return res;
  } catch (err) {
    toast.add({ title: '失败', description: err.message, variant: 'destructive' });
    throw err;
  }
};

// 删除数据（单条/批量）
export const submitDelete = async (modelName, ids) => {
  try {
    const res = await $fetch('/del', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName, ids })
    });

    if (res.code !== 0) throw new Error(res.msg || '删除失败');
    toast.add({ title: '成功', description: '删除数据成功', variant: 'success' });
    return res;
  } catch (err) {
    toast.add({ title: '失败', description: err.message, variant: 'destructive' });
    throw err;
  }
};

// 自定义按钮接口请求
export const callCustomAction = async (api, method = 'POST', data) => {
  try {
    const res = await $fetch(api, {
      method,
      body: JSON.stringify(data)
    });

    if (res.code !== 0) throw new Error(res.msg || '操作失败');
    toast.add({ title: '成功', description: '操作成功', variant: 'success' });
    return res;
  } catch (err) {
    toast.add({ title: '失败', description: err.message, variant: 'destructive' });
    throw err;
  }
};
```

#### （4）搜索区组件实现（支持折叠/展开）
```vue
<!-- components/SearchBar.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'nuxt/ui/composables';

const toast = useToast();
const props = defineProps({
  uiConfig: { type: Object, required: true },
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue', 'search', 'reset']);

// 筛选搜索字段（search:true）
const searchFields = computed(() => {
  return Object.entries(props.uiConfig.fields)
    .filter(([_, config]) => config.search)
    .sort((a, b) => (a[1].sort || 99) - (b[1].sort || 99))
    .map(([fieldName, config]) => ({ fieldName, ...config }));
});

// 默认显示字段数
const defaultShowCount = computed(() => props.uiConfig.global.searchDefaultCount || 3);
const isExpanded = ref(false); // 展开状态

// 可见的搜索字段
const visibleFields = computed(() => {
  if (isExpanded.value || searchFields.value.length <= defaultShowCount.value) {
    return searchFields.value;
  }
  return searchFields.value.slice(0, defaultShowCount.value);
});

// 输入变化同步到父组件
const handleInput = (fieldName, value) => {
  emit('update:modelValue', { ...props.modelValue, [fieldName]: value });
};

// 重置搜索
const handleReset = () => {
  const emptyForm = Object.fromEntries(searchFields.value.map(({ fieldName }) => [fieldName, '']));
  emit('update:modelValue', emptyForm);
  emit('reset');
};

// 获取默认提示语
const getDefaultPlaceholder = (op, label) => {
  const placeholderMap = {
    eq: `等于${label}...`,
    ne: `不等于${label}...`,
    like: `包含${label}关键词...`,
    notlike: `不包含${label}关键词...`,
    gt: `大于${label}...`,
    gte: `大于等于${label}...`,
    lt: `小于${label}...`,
    lte: `小于等于${label}...`,
    range: `${label}区间...`,
    in: `输入多个${label}（逗号分隔）...`,
    isnull: `${label}为空`,
    isnotnull: `${label}不为空`
  };
  return placeholderMap[op] || `请输入${label}`;
};

// 解析静态选项
const parseOptions = (optionsStr) => {
  if (!optionsStr) return [];
  return optionsStr.split(',').map(item => {
    const [value, labelAndMore] = item.split('=');
    const [label, color, status] = (labelAndMore || '').split(':');
    return {
      value,
      label,
      color,
      disabled: status === 'disabled'
    };
  });
};
</script>

<template>
  <UCard class="p-4 mb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 搜索字段 -->
      <div v-for="field in visibleFields" :key="field.fieldName">
        <UFormGroup :label="field.label || field.fieldName" :required="field.required">
          <Component
            :is="field.type || 'UInput'"
            v-model="props.modelValue[field.fieldName]"
            @update:modelValue="handleInput(field.fieldName, $event)"
            :placeholder="field.searchPlaceholder || getDefaultPlaceholder(field.op, field.label)"
            :multiple="field.multiple"
            :options="field.options ? parseOptions(field.options) : undefined"
            :class="field.ui-class"
          />
        </UFormGroup>
      </div>

      <!-- 展开/收起按钮 -->
      <div v-if="searchFields.length > defaultShowCount" class="flex items-end">
        <UButton @click="isExpanded = !isExpanded" variant="ghost" size="sm">
          {{ isExpanded ? '收起' : `展开更多（${searchFields.length - defaultShowCount}个）` }}
        </UButton>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-end gap-2">
        <UButton @click="emit('search')" type="primary" size="sm">搜索</UButton>
        <UButton @click="handleReset" variant="ghost" size="sm">重置</UButton>
      </div>
    </div>
  </UCard>
</template>
```

### 3. 错误处理建议
- **标签解析失败**：日志打印错误字段与标签内容，使用默认配置（`type:UInput`、`label:字段名`）降级渲染；
- **API 请求失败**：通过 Nuxt UI 的 `useToast` 显示错误提示，提供重试按钮；
- **动态表达式错误**：返回原始配置值，不影响整体渲染，日志记录错误表达式；
- **组件不存在**：降级为 `UInput` 组件，日志提示「组件不存在：xxx」；
- **数据字段缺失**：表格/表单中显示 `empty-text` 配置的占位符（无配置则显示 `--`）。

## 十四、版本更新日志
| 版本 | 更新日期 | 状态 | 主要更新内容 |
| --- | --- | --- | --- |
| v2.4.0 | 2025-01-05 | 稳定（最终版） | 1. 编辑接口 `id` 恢复独立于 `data` 字段；2. 优化文档结构，增加目录与场景说明；3. 补充前端组件示例，完善错误处理；4. 统一权限控制与自定义按钮调用逻辑 |
| v2.3.0 | 2024-12-30 | 稳定 | 编辑接口 `id` 并入 `data` 字段；统一 Nuxt UI 交互组件；简化错误处理 |
| v2.2.0 | 2024-12-25 | 稳定 | 新增删除接口（单条/批量）；操作按钮权限控制；自定义按钮支持 API 与回调 |
| v2.1.0 | 2024-12-15 | 稳定 | 支持所有 Nuxt UI 组件；新增/编辑接口；`notlike` 操作符；搜索区折叠/展开 |
| v2.0.0 | 2024-12-05 | 稳定 | 独立 `UIConfig` 字段；分离标签与数据请求；规范接口格式 |
| v1.9.1 | 2024-11-15 | 淘汰 | 补充动态表达式、详情页配置、更多校验规则 |
| v1.9.0 | 2024-10-27 | 淘汰 | 初始版本，基础属性、布局、搜索、校验功能 |

## 十五、文档使用说明
### 1. 后端开发
- **模型配置**：
  - 每个业务模型新增 `UIConfig` 虚拟字段，配置模型级全局参数（按钮、权限、搜索区等）；
  - 业务字段按规范编写 `ui` 标签，`type` 直接使用 Nuxt UI 组件名；
  - 无需解析 `ui` 标签，直接通过 `/getuitag` 接口返回原始字符串。
- **接口实现**：
  - 按规范实现所有核心接口，确保请求/响应格式一致；
  - 编辑接口从顶层 `id` 字段提取主键，无需从 `data` 中解析；
  - 权限接口 `/getpermissions` 返回当前用户的权限标识列表，与 `action-permission` 配置对应。

### 2. 前端开发
- **核心流程**：
  - 页面初始化时，先通过 `/getuitag` 获取标签配置并缓存，再请求业务数据；
  - 解析标签配置后，自动渲染表格、搜索栏、表单等组件；
  - 实现权限校验逻辑，根据用户权限动态显示/隐藏操作按钮。
- **组件开发**：
  - 自定义组件放在 `components/custom/` 目录，遵循 Nuxt 自动导入规范；
  - 所有交互使用 Nuxt UI 组件（如提示用 `useToast`、确认用 `UDialog`）；
  - 自定义按钮回调函数需全局注册，接收固定格式的参数。

### 3. 协作规范
- **命名约定**：模型 `model` 标识全局唯一，前后端保持一致（如 `SysUser` 对应 `sysuser` 接口参数）；
- **配置变更**：后端修改 `ui` 标签后，需通知前端手动刷新缓存（模型配置不变则无需重复请求）；
- **权限同步**：新增按钮或权限标识时，前后端需同步更新配置，确保权限校验生效；
- **版本兼容**：最终版协议向下兼容所有历史版本的核心配置，无需修改已有代码。

要不要我帮你整理一份**前后端协作 checklist**，包含模型配置、接口实现、前端渲染等关键节点的校验项，确保开发过程无遗漏？