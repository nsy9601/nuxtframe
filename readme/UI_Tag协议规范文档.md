# UI-Tag 协议规范文档（Ant Design Vue 4 适配版·最终版）
本规范旨在通过后端 Golang 结构体的 `ui` 标签，彻底驱动前端（Nuxt 4 + Ant Design Vue 4）的列表渲染、搜索过滤、表单生成、复杂的 GORM 关联关系展示以及行操作按钮动态渲染，核心适配 Ant Design Vue 4 组件的原生属性与交互逻辑，平衡后端开发严谨性与前端 UI 灵活性，为中后台系统提供标准化的前后端协同方案。

---

## 一、协议基础格式
- **Tag Key**: `ui`（固定唯一标识，后端结构体统一通过该 Tag 配置）
- **语法**: `key:value;`（多项配置以分号 `;` 分隔，键值以冒号 `:` 分隔；无 `:value` 时默认值为 `true`，支持省略默认值配置）
- **原则**: 后端仅负责按规范填充 `ui` 标签字符串，透传给前端后，由前端解析引擎实时生成符合 Ant Design Vue 4 风格的 UI 组件与操作按钮
- **数据类型约定**:
  - 数值类配置（`sort`/`span`/`width` 等）：后端必须传递数字字符串，前端直接转为 `Number` 类型
  - 布尔类配置（`table`/`form`/`search` 等）：仅支持 `true`/`false` 小写字符串，前端统一转为布尔值；默认值均为 `true`，可省略不写
  - 日期类配置：后端返回格式遵循 ISO 8601 标准（`YYYY-MM-DD`/`YYYY-MM-DD HH:mm:ss`），前端通过 Ant Design Vue 4 `DatePicker` 组件统一解析
  - 多值类配置：统一用逗号 `,` 分隔，前后无空格（如 `options:1=正常,0=禁用`、`actions:edit,delete`）

---

## 二、核心配置项索引（Ant Design Vue 4 适配）
### 1. 模型与基础（Model & Base）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `model` | 模型唯一标识，用于前端国际化、缓存 Key 或组件命名空间 | `model:SysUser` | 与 Ant Design Vue 4 表单 `name` 属性联动，支持表单校验分组；同时作为操作按钮权限前缀 |
| `label` | 界面显示名称（表格表头、表单标签、搜索框占位符前缀） | `label:用户名` | 直接映射 Ant Design Vue 4 组件的 `label` 属性 |
| `sort` | 字段显示权重（数字越小越靠前） | `sort:10` | 统一控制表格列顺序、表单字段顺序、搜索栏字段顺序；默认 `99` |
| `empty-text` | 字段值为空时的默认显示文本 | `empty-text:无` | 适配 Ant Design Vue 4 表格 `empty-text` 特性，替代默认空值显示；默认 `-` |
| `hidden` | 完全隐藏字段（表格/表单/搜索栏均不显示） | `hidden:true` | 比 `table:false+form:false+search:false` 更简洁，适配全局隐藏场景；默认 `false` |

### 2. 组件渲染（Component & Layout）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `type` | 组件类型（Ant Design Vue 4 标准组件） | `type:select` | 支持组件：<br>- 输入类：`input`/`input-number`/`text-area`<br>- 选择类：`select`/`radio-group`/`checkbox-group`/`switch`<br>- 日期类：`date-picker`/`range-picker`/`month-picker`<br>- 其他：`slider`/`rate`/`image`（图片展示）；默认 `input` |
| `type:custom:` | 自定义组件（前缀固定 `custom:`） | `type:custom:UserSelector` | 前端需将组件放置在 `app/components/custom/` 目录，支持表格/表单通用（通过 `ui` 配置区分场景），适配 Ant Design Vue 4 组件 props 规范 |
| `table` | 是否在表格列中显示 | 省略不写（默认 `true`）/ `table:false` | 映射 Ant Design Vue 4 `a-table` 的 `columns` 配置；默认 `true`，可省略 |
| `form` | 是否在表单中显示 | 省略不写（默认 `true`）/ `form:false` | 映射 Ant Design Vue 4 `a-form` 的 `fields` 配置；默认 `true`，可省略 |
| `span` | 表单栅格宽度 | `span:12` | 取值 1-24，适配 Ant Design Vue 4 `a-grid` 布局；默认 `24` |
| `align` | 表格列对齐方式 | `align:center` | 可选值：`left`/`center`/`right`，适配 Ant Design Vue 4 `a-table` 列 `align` 属性；默认 `left` |
| `width` | 表格列宽度 | `width:120` | 支持数字（px）或百分比，适配 Ant Design Vue 4 `a-table` 列 `width` 属性；默认自动适配 |
| `ellipsis` | 表格文本过长是否省略 | `ellipsis:true` | 适配 Ant Design Vue 4 `a-table` 列 `ellipsis` 属性，hover 显示完整文本；默认 `false` |
| `sortable` | 表格列是否支持前端排序 | `sortable:true` | 适配 Ant Design Vue 4 `a-table` 列 `sortable` 属性；默认 `false` |
| `formatter` | 表格文本格式化（内置/自定义） | 内置：`formatter:date` / 自定义：`formatter:img:{{host}}` | 支持：<br>- 内置格式器：`date`（默认 `YYYY-MM-DD HH:mm:ss`）、`currency`（保留 2 位小数）、`percent`（百分比）、`img`（图片拼接）<br>- 自定义格式：`formatter:date:YYYY-MM-DD`（指定日期格式）、`formatter:img:https://xxx.com`（拼接自定义 host）<br>- 适配 Ant Design Vue 4 表格列 `customRender` 函数 |
| `disabled` | 组件是否禁用（表单/搜索栏） | `disabled:true` | 适配 Ant Design Vue 4 组件 `disabled` 属性，支持动态表达式：`disabled:{{isReadOnly}}`；默认 `false` |
| `placeholder` | 输入类组件占位提示 | `placeholder:请输入用户名` | 直接映射 Ant Design Vue 4 输入组件 `placeholder` 属性；默认 `请输入{{label}}`（自动拼接标签名） |

### 3. 搜索与查询（Search & Query）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `search` | 是否作为搜索条件 | 省略不写（默认 `false`）/ `search:true` | 默认 `false`，需显式配置 `search:true` 才生成搜索组件；可省略默认值配置 |
| `op` | 匹配操作符 | `op:notLike` | 支持：<br>- `eq`(=)：适配输入框/选择器<br>- `ne`(!=)：适配输入框/选择器<br>- `like`(模糊匹配)：适配输入框（自动拼接 `%`）<br>- `notLike`(不包含模糊匹配)：适配输入框（自动拼接 `%`）<br>- `range`(区间匹配)：强制关联 `type:range-picker`/`input-number` 组件<br>- `in`(包含匹配)：强制关联 `type:select`（`mode:multiple`）组件<br>- `isNull`(为空)：生成单选开关，无需输入组件；默认 `eq` |
| `search-span` | 搜索栏栅格宽度 | `search-span:8` | 取值 1-24，适配 Ant Design Vue 4 搜索栏栅格布局；默认 `6` |
| `default-search` | 搜索栏默认值 | `default-search:admin` | 初始化搜索时自动带入该值，支持多值：`default-search:1,2,3`（适配 `in` 操作符）；默认无 |

### 4. 关联关系处理（Relations）- 核心增强
| 键名 | 描述 | 示例 | 说明 | 适配说明 |
| --- | --- | --- | --- | --- |
| `preload` | GORM 关联预加载名称 | `preload:Roles` | 必须匹配后端结构体关联成员名，支持多级预加载：`preload:Profile.Address` | 前端根据预加载结果，通过 `path` 取值渲染 |
| `path` | 前端取值路径 | `path:profile.nickname` | 支持 `.` 语法访问嵌套对象/数组，数组取值默认取 `name` 字段 | 适配 Ant Design Vue 4 组件 `v-model` 数据绑定，空值时显示 `empty-text` |
| `path-item` | 数组项取值字段 | `path:roles;path-item:roleName` | 当 `path` 指向数组时，指定数组项的取值字段 | 适配 `custom:TagGroup` 组件，批量渲染数组项指定字段 |

### 5. 数据源与校验（Data & Rules）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `options` | 静态枚举数据 | `options:1=正常,0=禁用` | 支持禁用状态：`options:1=正常,0=禁用:disabled` | 直接映射 Ant Design Vue 4 `a-select`/`a-radio-group` 的 `options` 属性（自动转换为 `[{label, value, disabled}]` 格式） |
| `api` | 动态数据源接口 | `api:/api/v1/role/options` | 接口默认返回格式：`[{label:string, value:any, disabled?:boolean}]` | 适配 Ant Design Vue 4 远程搜索组件，支持下拉加载 |
| `api-method` | 动态接口请求方式 | `api:/api/role;api-method:POST` | 支持 `GET`/`POST`，默认 `GET` | 适配 Axios 请求方法，与 Ant Design Vue 4 组件加载状态联动 |
| `api-params` | 动态接口请求参数 | `api:/api/dept;api-params:pid={{deptId}}` | 用 `{{字段名}}` 占位，从当前表单取值作为请求参数 | 表单字段变化时自动刷新数据源，适配 Ant Design Vue 4 组件联动逻辑 |
| `api-cache` | 动态接口缓存策略 | `api:/api/dict/status;api-cache:true` | 缓存接口返回结果，避免重复请求 | 适配前端缓存机制，提升组件渲染性能；默认 `false` |
| `mode` | 组件模式（针对选择类组件） | `mode:multiple` | 支持 `multiple`（多选）/`tags`（标签输入） | 直接映射 Ant Design Vue 4 `a-select` 的 `mode` 属性；默认单选 |
| `rules` | 表单校验规则 | `rules:required,regex:/^1[3-9]\d{9}$/` | 支持内置规则与自定义正则，多规则用逗号分隔 | 完全适配 Ant Design Vue 4 表单校验规则，错误提示自动关联 `label`；默认无 |
| `maxLength` | 输入长度上限 | `maxLength:20` | 限制输入内容长度 | 适配 Ant Design Vue 4 `a-input`/`a-textarea` 的 `maxLength` 属性，同步显示输入计数；默认无 |
| `minLength` | 输入长度下限 | `minLength:6` | 限制输入内容最小长度 | 适配 Ant Design Vue 4 表单校验规则，与 `rules` 协同生效；默认无 |
| `precision` | 数字精度（小数位数） | `precision:2` | 仅适用于 `type:input-number` 组件 | 适配 Ant Design Vue 4 `a-input-number` 的 `precision` 属性；默认无 |
| `range` | 数值范围限制 | `range:[1,100]` | 格式：`[min, max]`，仅适用于数字类组件 | 适配 Ant Design Vue 4 `a-input-number`/`a-slider` 的 `min`/`max` 属性，同时触发表单校验；默认无 |

### 6. 权限控制（Auth）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `auth` | 权限标识 | `auth:sys:user:edit` | 前端根据当前用户权限判断是否显示/启用组件 | 与 Ant Design Vue 4 `a-authority` 组件联动，支持权限粒度控制 |
| `auth-hide` | 无权限时是否隐藏 | `auth:sys:user:view;auth-hide:true` | 默认 `false`（无权限时禁用），`true` 时完全隐藏 | 适配 Ant Design Vue 4 组件 `v-if`/`v-show` 逻辑，避免无权限组件渲染 |

### 7. 表单联动（Form Linkage）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `depend` | 依赖字段 | `depend:deptId` | 当依赖字段值变化时，触发当前字段更新（如刷新数据源、改变禁用状态） | 适配 Ant Design Vue 4 表单 `watch` 机制，支持多依赖：`depend:deptId,roleId` |
| `show-condition` | 字段显示条件 | `show-condition:status===1` | 表达式语法：`字段名===值`/`字段名!==值`/`字段名in[1,2]` | 适配 Ant Design Vue 4 组件 `v-if` 逻辑，满足条件时渲染组件；默认无 |

### 8. 行操作按钮（Action - 新增核心配置）
| 键名 | 描述 | 示例 | 适配说明 |
| --- | --- | --- | --- |
| `actions` | 行操作按钮集合（内置按钮/自定义按钮） | `actions:view,edit,delete,custom:audit` | 支持：<br>- 内置按钮：`view`（查看）、`edit`（编辑）、`delete`（删除）、`disable`（禁用）、`enable`（启用）<br>- 自定义按钮：前缀 `custom:`，格式 `custom:按钮标识`（如 `custom:audit` 对应审核按钮）<br>- 多按钮用逗号分隔，按配置顺序渲染 | 适配 Ant Design Vue 4 `a-table` 的 `actions` 列，自动生成操作按钮组 |
| `action-auth` | 操作按钮权限前缀（可选） | `action-auth:sys:user` | 拼接按钮标识生成完整权限（如 `sys:user:view`），默认使用 `model` 字段值作为权限前缀 | 与前端权限系统联动，无对应权限则隐藏该按钮 |
| `action-width` | 操作列宽度 | `action-width:180` | 适配操作按钮组显示需求，支持数字（px）或百分比；默认 `150` | 映射 Ant Design Vue 4 `a-table` 操作列 `width` 属性 |
| `action-show-condition` | 操作按钮显示条件（全局） | `action-show-condition:status===1` | 表达式语法：`字段名===值`/`字段名!==值`/`字段名in[1,2]`，控制所有操作按钮的显示状态 | 适配 Ant Design Vue 4 组件 `v-if` 逻辑，满足条件时显示操作列 |
| `action-item-condition:` | 单个按钮显示条件（前缀 `action-item-condition:`） | `action-item-condition:edit:status===1;action-item-condition:delete:status!==2` | 格式：`action-item-condition:按钮标识:条件表达式`，单独控制某个按钮的显示 | 支持内置按钮和自定义按钮，优先级高于全局 `action-show-condition` |

---

## 三、内置格式化器详解（含自定义扩展）
| 格式化器类型 | 描述 | 示例配置 | 前端处理逻辑 | 适配场景 |
| --- | --- | --- | --- | --- |
| `date` | 日期格式化 | `formatter:date` / `formatter:date:YYYY-MM-DD` | 按指定格式解析 ISO 8601 日期字符串，默认 `YYYY-MM-DD HH:mm:ss` | 时间字段表格展示 |
| `currency` | 金额格式化 | `formatter:currency` / `formatter:currency:2` | 保留指定小数位数（默认 2 位），添加货币符号（默认无，可扩展） | 金额、数值字段展示 |
| `percent` | 百分比格式化 | `formatter:percent` / `formatter:percent:1` | 数值乘以 100 后添加 `%`，保留指定小数位数（默认 0 位） | 比例字段展示 |
| `img` | 图片路径拼接 | `formatter:img` / `formatter:img:https://xxx.com` | 拼接 host 与字段存储路径（如字段值 `/uploads/xxx.png` → `https://xxx.com/uploads/xxx.png`），默认使用前端全局 host | 头像、图片字段表格展示 |
| 自定义格式 | 扩展格式化逻辑 | `formatter:custom:statusFormat` | 前端注册自定义格式化函数（如 `statusFormat` 函数将 1 转为“启用”），通过键名匹配执行 | 特殊字段自定义展示 |

### 关键说明：自定义组件的表格/表单通用方案
- 同一自定义组件（如 `custom:UserSelector`）可同时支持表格展示和表单编辑，前端通过 `ui` 配置中的 `table`/`form` 标识区分场景：
  - 表格场景：组件接收 `value`（`path` 取值结果），仅用于展示（如显示用户名）；
  - 表单场景：组件接收 `v-model` 绑定值，支持编辑交互（如下拉选择用户）；
- 示例配置：`ui:"type:custom:UserSelector;table:true;form:true;path:userId"` → 表格展示用户名称，表单提供用户选择器。

---

## 四、内置操作按钮与自定义按钮规范
### 1. 内置操作按钮
| 按钮标识 | 按钮名称 | 图标（Ant Design Vue 4） | 默认权限 | 触发事件 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| `view` | 查看 | `EyeOutlined` | `{{model}}:view` | `onView(record)` | 查看行详情 |
| `edit` | 编辑 | `EditOutlined` | `{{model}}:edit` | `onEdit(record)` | 编辑行数据 |
| `delete` | 删除 | `DeleteOutlined` | `{{model}}:delete` | `onDelete(record)` | 删除行数据（默认带确认弹窗） |
| `disable` | 禁用 | `BanOutlined` | `{{model}}:disable` | `onDisable(record)` | 禁用状态切换（适用于状态字段） |
| `enable` | 启用 | `CheckCircleOutlined` | `{{model}}:enable` | `onEnable(record)` | 启用状态切换（适用于状态字段） |

### 2. 自定义操作按钮
| 配置格式 | 示例 | 前端处理逻辑 | 规范要求 |
| --- | --- | --- | --- |
| `custom:按钮标识` | `custom:audit` | 1. 从前端自定义按钮配置中匹配 `按钮标识`；<br>2. 渲染按钮名称、图标、权限；<br>3. 触发自定义事件 `onCustomAction('按钮标识', record)` | 1. 前端需在 `app/components/custom/actions/` 目录注册按钮配置；<br>2. 配置需包含 `label`（按钮名称）、`icon`（Ant Design Vue 4 图标）、`auth`（可选，默认 `{{model}}:custom:按钮标识`）；<br>3. 支持单独配置显示条件：`action-item-condition:custom:audit:status===0` |

### 3. 操作按钮权限与显示逻辑优先级
1. 权限校验：无对应权限 → 按钮隐藏；
2. 单个按钮显示条件：`action-item-condition:按钮标识:条件` → 不满足 → 按钮隐藏；
3. 全局操作列显示条件：`action-show-condition:条件` → 不满足 → 整个操作列隐藏；
4. 默认：有权限且满足条件 → 按钮显示。

---

## 五、内置校验规则（Ant Design Vue 4 适配）
| 规则关键词 | 描述 | 示例 | 适配 Ant Design Vue 4 校验规则 |
| --- | --- | --- | --- |
| `required` | 必填项 | `rules:required` | `{ required: true, message: '{{label}}不能为空', trigger: ['blur', 'change'] }` |
| `email` | 邮箱格式校验 | `rules:email` | `{ type: 'email', message: '{{label}}格式不正确', trigger: ['blur', 'change'] }` |
| `phone` | 手机号格式校验（中国） | `rules:phone` | `{ pattern: /^1[3-9]\d{9}$/, message: '{{label}}格式不正确', trigger: ['blur', 'change'] }` |
| `integer` | 整数校验 | `rules:integer` | `{ pattern: /^-?\d+$/, message: '{{label}}必须为整数', trigger: ['blur', 'change'] }` |
| `number` | 数字校验（支持小数） | `rules:number` | `{ type: 'number', message: '{{label}}必须为数字', trigger: ['blur', 'change'] }` |
| `range:[min,max]` | 数值范围校验 | `rules:range:[1,100]` | `{ validator: (rule, value) => { ... }, message: '{{label}}必须在1-100之间', trigger: ['blur', 'change'] }` |
| `equal:字段名` | 与其他字段值相等 | `rules:equal:password` | `{ validator: (rule, value, callback) => { ... }, message: '{{label}}与密码不一致', trigger: ['blur', 'change'] }` |
| `regex:/pattern/flags` | 自定义正则校验 | `rules:regex:/^[\u4e00-\u9fa5]{2,4}$/` | `{ pattern: new RegExp(pattern, flags), message: '{{label}}格式不正确', trigger: ['blur', 'change'] }` |

---

## 六、GORM 关联关系与操作按钮应用示例
### 1. 一对一（One-to-One）+ 基础操作按钮
- **场景**：用户表关联扩展信息表，表格显示真实姓名和头像，支持查看、编辑、删除操作
- **后端定义**：
```go
// 关联结构体（触发 GORM 预加载）
Profile SysUserProfile `json:"profile" ui:"preload:Profile"`
// 模型基础配置（含操作按钮）
BaseModel `ui:"model:SysUser;actions:view,edit,delete;action-width:160;action-show-condition:status!==3"`
// 虚拟显示字段（表格展示真实姓名）
RealName string `gorm:"-" json:"-" ui:"label:真实姓名;table:true;path:profile.realName;sort:2;ellipsis:true"`
// 头像字段（表格展示，拼接 host）
Avatar string `gorm:"-" json:"-" ui:"label:头像;table:true;path:profile.avatar;formatter:img:https://xxx.com;sort:3;width:80;align:center"`
```

### 2. 多对多 + 自定义操作按钮
- **场景**：用户关联多个角色，表格显示角色标签组，支持审核（自定义按钮）、启用/禁用操作
- **后端定义**：
```go
// 关联集合（触发 GORM 预加载）
Roles []SysRole `json:"roles" ui:"preload:Roles"`
// 模型基础配置（含自定义按钮）
BaseModel `ui:"model:SysUser;actions:enable,disable,custom:audit;action-auth:sys:user;action-item-condition:enable:status===0;action-item-condition:disable:status===1;action-item-condition:custom:audit:status===2"`
// 表格显示字段（自定义 TagGroup 组件）
RoleNames string `gorm:"-" json:"-" ui:"label:所属角色;table:true;path:roles;path-item:roleName;type:custom:TagGroup;sort:4"`
```

### 3. 动态数据源与表单联动（含 `notLike` 搜索）
- **场景**：选择部门后动态加载用户，搜索支持“不包含用户名”，操作按钮支持批量编辑（自定义）
- **后端定义**：
```go
// 部门选择字段（触发联动）
DeptId uint `json:"deptId" ui:"label:所属部门;form:true;search:true;type:select;options:1=技术部,2=产品部;sort:1;rules:required"`
// 用户选择字段（动态数据源 + 联动）
UserId uint `json:"userId" ui:"label:负责人;form:true;type:select;api:/api/v1/user/options;api-params:deptId={{deptId}};depend:deptId;sort:2;rules:required"`
// 模型基础配置（含批量操作按钮）
BaseModel `ui:"model:SysUser;actions:custom:batchEdit;action-item-condition:custom:batchEdit:deptId!==0"`
// 用户名搜索（支持 notLike 操作符）
UsernameSearch string `json:"username" ui:"label:用户名筛选;search:true;op:notLike;placeholder:请输入不包含的用户名;sort:1"`
```

---

## 七、综合模型示例（Golang）
```go
type SysUser struct {
	BaseModel `ui:"model:SysUser;actions:view,edit,delete,enable,disable,custom:audit;action-width:200;action-show-condition:status!==3;action-item-condition:edit:status===1;action-item-condition:delete:status!==2;action-item-condition:custom:audit:status===0"`
	
	// 基础字段（表单+表格+搜索，省略默认配置）
	Username string `json:"username" ui:"label:用户名;search:true;op:like;sort:1;rules:required,maxLength:20;placeholder:请输入用户名"`
	
	// 密码字段（仅表单显示，隐藏表格和搜索）
	Password string `json:"password,omitempty" ui:"label:密码;table:false;search:false;sort:2;rules:required,minLength:6;hidden:{{isEdit}}"`
	
	// 一对一关联（嵌套取值 + 头像拼接）
	Profile SysUserProfile `json:"profile" ui:"preload:Profile"`
	RealName string        `gorm:"-" json:"-" ui:"label:真实姓名;path:profile.realName;sort:3;empty-text:未设置"`
	Avatar   string        `gorm:"-" json:"-" ui:"label:头像;table:true;path:profile.avatar;formatter:img;sort:4;width:80;align:center"`
	
	// 多对多关联（自定义标签组）
	Roles []SysRole `json:"roles" ui:"preload:Roles"`
	RoleNames string `gorm:"-" json:"-" ui:"label:所属角色;path:roles;path-item:roleName;type:custom:TagGroup;sort:5"`
	
	// 枚举字段（下拉选择 + 搜索）
	Status int `json:"status" ui:"label:状态;search:true;type:select;options:1=启用,0=禁用:disabled;op:eq;sort:6;default-search:1"`
	
	// 手机号（正则校验）
	Mobile string `json:"mobile" ui:"label:手机号;rules:required,phone;sort:7"`
	
	// 金额字段（数字输入 + 精度控制）
	Balance float64 `json:"balance" ui:"label:账户余额;type:input-number;precision:2;range:[0,999999];sort:8;formatter:currency"`
	
	// 日期字段（范围搜索）
	CreatedAt time.Time `json:"createdAt" ui:"label:创建时间;search:true;op:range;type:range-picker;sort:9;formatter:date:YYYY-MM-DD"`
	
	// 动态下拉（部门联动用户）
	DeptId uint `json:"deptId" ui:"label:所属部门;search:true;type:select;options:1=技术部,2=产品部;sort:10;rules:required"`
	UserId uint `json:"userId" ui:"label:对接人;type:select;api:/api/v1/user/options;api-params:deptId={{deptId}};depend:deptId;sort:11;rules:required"`
	
	// 不包含模糊搜索
	Remark string `json:"remark" ui:"label:备注;search:true;op:notLike;sort:12;placeholder:请输入不包含的备注内容"`
}
```

---

## 八、前后端执行流程（Ant Design Vue 4 适配）
### 后端逻辑（query.go）
1. 解析 Model 的 `ui` 标签，提取 `preload` 配置，自动执行 GORM 关联预加载（支持多级预加载）
2. 接收前端传入的 `filters` 参数，筛选出 `search:true` 的字段，根据 `op` 操作符（含 `notLike`）构建 SQL `Where` 子句
3. 将查询结果（包含嵌套关联对象）按 ISO 8601 格式序列化 JSON，透传 `ui` 标签中的操作按钮配置返回前端
4. 字段隐藏处理：建议通过后端序列化时动态过滤（而非 `omitempty`），确保 `table:false但form:true` 的字段正常返回

### 前端逻辑（SchemaTable.vue / SchemaForm.vue）
1. **配置解析**：接收后端返回的 `ui` 标签字符串，通过解析引擎转换为标准 `UIProperty` 配置（含操作按钮配置），适配 Ant Design Vue 4 组件属性
2. **表格渲染**：
   - 根据 `table:true`（默认）筛选字段，按 `sort` 排序生成 `a-table` 的 `columns` 配置
   - 有 `path` 字段时，通过路径解析嵌套数据；数组类型字段使用 `custom:TagGroup` 组件渲染
   - 应用 `formatter` 配置：内置格式化器直接处理，自定义格式化器执行对应函数（如图片路径拼接）
   - 应用 `align`/`width`/`ellipsis` 配置，空值显示 `empty-text`
3. **操作列渲染**：
   - 根据 `actions` 配置解析内置/自定义按钮，按顺序生成按钮组
   - 结合 `action-auth`/`action-show-condition`/`action-item-condition` 过滤无权限/不满足条件的按钮
   - 绑定按钮事件（内置按钮触发标准事件，自定义按钮触发 `onCustomAction` 事件）
4. **搜索栏渲染**：
   - 根据 `search:true` 筛选字段，按 `search-span` 布局生成 Ant Design Vue 4 搜索组件（`a-input`/`a-select`/`a-range-picker` 等）
   - 绑定 `default-search` 默认值，根据 `op` 操作符（含 `notLike`）处理搜索参数格式（如 `notLike` 拼接 `%value%`）
5. **表单渲染**：
   - 根据 `form:true`（默认）筛选字段，按 `span` 布局生成 `a-form` 的 `fields` 配置
   - 绑定 `rules` 校验规则，适配 Ant Design Vue 4 表单校验机制
   - 处理 `depend`/`show-condition` 联动逻辑，监听依赖字段变化更新组件状态（如刷新动态数据源）
   - 自定义组件通过 `props` 接收 `UIProperty` 配置，区分表格/表单场景，遵循 Ant Design Vue 4 `v-model` 规范传递值

---

## 九、开发者调试清单
### 后端调试
- [ ] 检查 SQL 日志，确认 `preload` 配置是否触发正确的关联查询（含多级预加载）
- [ ] 验证 `op` 操作符（尤其是 `notLike`）与 `search:true` 字段的匹配性，确保查询条件正确构建
- [ ] 检查接口返回 JSON：关联对象键名与 `path` 定义一致（统一小驼峰），日期格式符合 ISO 8601
- [ ] 验证字段隐藏逻辑：`table:false但form:true` 的字段是否正常返回，未被 `omitempty` 过滤
- [ ] 确认 `ui` 标签中操作按钮配置（`actions`/`action-auth` 等）是否按预期透传
- [ ] 检查操作按钮权限前缀与按钮标识拼接是否符合预期（如 `model:SysUser` → `SysUser:view`）

### 前端调试
- [ ] 检查解析后的 `UIProperty` 配置，确认组件类型、属性、操作按钮配置与 `ui` 标签一致
- [ ] 自定义组件需放置在 `app/components/custom/` 目录，自定义操作按钮需在 `app/components/custom/actions/` 目录注册
- [ ] 格式化器（尤其是图片拼接）是否正常工作，路径拼接是否正确
- [ ] 联动字段（`depend`/`show-condition`）是否正常响应值变化，动态数据源是否正确刷新
- [ ] 搜索操作符 `notLike` 是否生效，查询参数格式是否正确
- [ ] 操作按钮是否按权限和显示条件正常渲染，无权限按钮是否隐藏
- [ ] 表单校验规则是否生效，错误提示是否显示 `label` 名称，适配 Ant Design Vue 4 校验样式
- [ ] 权限控制字段：无权限时是否按 `auth-hide` 配置隐藏/禁用，适配 Ant Design Vue 4 权限组件

---

## 十、版本兼容约定
- **协议版本**：支持在 `ui` 标签中添加 `version:1.0` 配置，后续协议迭代时，前端可根据版本兼容旧配置
- **废弃配置**：标记废弃的配置项时，前端兼容旧配置并在控制台给出警告，确保平滑过渡
- **组件兼容**：Ant Design Vue 4 组件 API 变更时，解析引擎内部适配，确保后端 `ui` 标签无需修改
- **操作按钮扩展**：新增内置按钮时，保持原有按钮标识和事件兼容，避免影响旧代码

---

本协议深度适配 Ant Design Vue 4 组件生态，新增行操作按钮动态配置能力，覆盖中后台系统全场景需求（基础表单/表格、关联关系、动态联动、权限控制、自定义格式化、操作按钮），明确了默认配置规则与省略语法，后端仅需按规范配置 `ui` 标签即可实现前端 UI 与操作按钮的自动生成，极大降低重复开发与前后端联调成本，为中后台系统提供标准化、可扩展的协同方案。