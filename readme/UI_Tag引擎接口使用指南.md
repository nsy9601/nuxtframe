# UI-Tag 引擎接口使用指南
本指南基于 UI-Tag 协议规范（Ant Design Vue 4 适配版），详细说明 `ui_tag_engine` 组件的对外接口用法、参数配置、模型注册及查询调用流程，帮助开发者快速集成并使用该引擎。

## 一、核心接口概览
`ui_tag_engine` 对外提供 5 个核心接口，涵盖模型注册、缓存管理、配置获取及通用查询能力，所有接口均遵循 Golang 访问控制规范（大写开头暴露对外）：

| 接口名称 | 功能描述 | 适用场景 |
|----------|----------|----------|
| `RegisterModel(name string, model interface{})` | 注册模型到引擎，预解析 UI-Tag 配置并缓存 | 模型层初始化时注册（如 `sys_user.go` 的 `init` 函数） |
| `GetModelByName(name string) (interface{}, bool)` | 根据模型名称获取注册的模型实例 | 需手动操作模型实例时（如自定义查询逻辑） |
| `GetSchemaByModelName(modelName string) ([]FieldSchema, bool)` | 获取预解析的 UI-Tag 配置（供前端渲染使用） | 前端独立请求 schema 配置并缓存时 |
| `ClearCache(modelName string)` | 清理指定模型的 schema 及表格字段缓存 | 开发环境修改模型 UI-Tag 配置后热重载 |
| `AutoQuickQuery(ctx *gin.Context) (*QueryResult, error)` | 通用查询入口，支持分页、排序、过滤等 | 前端表格/列表数据查询（通过控制器调用） |

## 二、接口详细用法
### 1. 模型注册接口：RegisterModel
#### 功能说明
将 GORM 模型注册到引擎，自动解析模型的 `ui` 标签配置（含关联预加载、搜索规则、表单规则等），并缓存解析结果，避免运行时重复解析。

#### 调用要求
- 模型必须是 **结构体指针**（如 `&models.SysUser{}`）。
- 模型必须实现 `TableName() string` 方法（GORM 模型必需）。
- 模型字段需按 UI-Tag 协议规范配置 `ui` 标签。

#### 调用示例（模型层）
```go
// model/sys_user.go
package models

import "ginframe/components/ui_tag_engine"

// 定义 GORM 模型（遵循 UI-Tag 协议配置 ui 标签）
type SysUser struct {
	ID       uint   `gorm:"primarykey" json:"id" ui:"label:ID;table:true;sort:1"`
	Username string `json:"username" ui:"label:用户名;search:true;op:like;sort:2;rules:required,maxLength:20"`
	Status   int    `json:"status" ui:"label:状态;search:true;type:select;options:1=启用,0=禁用;sort:3"`
	// 一对一关联（配置 preload 触发预加载）
	Profile SysUserProfile `json:"profile" ui:"preload:Profile"`
	// 虚拟字段（表格展示关联数据）
	RealName string `gorm:"-" json:"-" ui:"label:真实姓名;table:true;path:profile.realName;sort:4"`
}

// 实现 GORM 模型必需的 TableName 方法
func (s *SysUser) TableName() string {
	return "sys_user"
}

// 初始化时注册模型到 UI-Tag 引擎
func init() {
	ui_tag_engine.RegisterModel("sysuser", &SysUser{}) // 模型名称：sysuser（前端调用时使用）
}
```

#### 注意事项
- 模型名称（第一个参数）需唯一，建议使用小写（如 `sysuser`、`sysdept`），前端查询时需传入一致名称。
- 注册时会自动校验模型合法性，非法模型（非结构体指针、未实现 `TableName`）会直接 panic，确保启动时暴露配置错误。

### 2. 模型实例获取接口：GetModelByName
#### 功能说明
根据注册时的模型名称，获取对应的模型实例（结构体指针），适用于需要手动操作模型的场景（如自定义 GORM 查询）。

#### 调用示例
```go
// 从引擎获取 sysuser 模型实例
model, ok := ui_tag_engine.GetModelByName("sysuser")
if !ok {
    // 模型未注册，处理错误
    fmt.Errorf("模型 sysuser 未注册")
}

// 转换为具体模型类型（可选）
sysUserModel, ok := model.(*models.SysUser)
if ok {
    // 手动执行 GORM 查询
    var user models.SysUser
    db.Instance.Model(sysUserModel).First(&user, 1)
}
```

### 3. Schema 配置获取接口：GetSchemaByModelName
#### 功能说明
获取模型注册时预解析的 UI-Tag 配置，返回字段的 `ui` 标签详情（如 `label`、`search`、`type` 等），供前端解析并生成 UI 组件（表格、表单、搜索栏）。

#### 调用示例（控制器层）
```go
// controller/schema_controller.go
package controller

import (
	"ginframe/components/ui_tag_engine"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 获取模型的 UI-Tag 配置（供前端缓存）
func GetSchemaHandler(ctx *gin.Context) {
	modelName := ctx.Query("model_name") // 前端传入模型名称（如 sysuser）
	if modelName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "模型名称不能为空"})
		return
	}

	schema, ok := ui_tag_engine.GetSchemaByModelName(modelName)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": fmt.Sprintf("模型[%s]未注册", modelName)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "data": schema})
}
```

#### 返回结果示例
```json
{
  "code": 200,
  "data": [
    {
      "field": "id",
      "tag": "label:ID;table:true;sort:1"
    },
    {
      "field": "username",
      "tag": "label:用户名;search:true;op:like;sort:2;rules:required,maxLength:20"
    },
    {
      "field": "status",
      "tag": "label:状态;search:true;type:select;options:1=启用,0=禁用;sort:3"
    }
  ]
}
```

### 4. 缓存清理接口：ClearCache
#### 功能说明
清理指定模型的缓存（包括 UI-Tag 配置缓存和表格查询字段缓存），适用于开发环境修改模型 `ui` 标签后，无需重启服务即可生效。

#### 调用示例（开发工具接口）
```go
// controller/dev_controller.go
package controller

import (
	"ginframe/components/ui_tag_engine"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 清理模型缓存（仅开发环境使用）
func ClearModelCacheHandler(ctx *gin.Context) {
	modelName := ctx.Query("model_name")
	if modelName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "模型名称不能为空"})
		return
	}

	ui_tag_engine.ClearCache(modelName)
	ctx.JSON(http.StatusOK, gin.H{"code": 200, "msg": fmt.Sprintf("模型[%s]缓存清理成功", modelName)})
}
```

### 5. 通用查询接口：AutoQuickQuery
#### 功能说明
引擎核心查询接口，支持分页、排序、多条件过滤（适配 UI-Tag 协议所有 `op` 操作符）、关联预加载，前端仅需传入模型名称和查询参数，即可返回标准化结果。

#### 调用示例（控制器层）
```go
// controller/query_controller.go
package controller

import (
	"ginframe/components/ui_tag_engine"
	"github.com/gin-gonic/gin"
	"net/http"
)

// 通用查询接口（供前端表格/列表调用）
func QueryHandler(ctx *gin.Context) {
	result, err := ui_tag_engine.AutoQuickQuery(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}
```

#### 前端请求参数示例（JSON）
```json
{
  "model_name": "sysuser", // 必需：注册的模型名称
  "page": 1,               // 可选：页码（默认 1）
  "page_size": 10,         // 可选：每页条数（默认 10，最大 100）
  "sort": "username_asc",  // 可选：排序规则（格式：字段名_asc/字段名_desc，默认 id_desc）
  "filters": {             // 可选：过滤条件（key 为字段名，value 为过滤值）
    "username": "admin",   // 模糊匹配（op:like）
    "status": 1,           // 等于匹配（op:eq）
    "createdAt": ["2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z"] // 区间匹配（op:range）
  }
}
```

#### 响应结果示例
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "status": 1,
        "profile": {
          "realName": "系统管理员"
        },
        "realName": "系统管理员"
      }
    ],
    "total": 1 // 符合条件的总条数
  }
}
```

#### 支持的过滤操作符（op）
| 操作符 | 说明 | 适用场景 |
|--------|------|----------|
| `eq` | 等于（默认） | 数值、字符串、枚举字段 |
| `ne` | 不等于 | 所有字段 |
| `like` | 模糊匹配 | 字符串字段（自动拼接 `%`） |
| `notLike` | 不包含模糊匹配 | 字符串字段（自动拼接 `%`） |
| `range` | 区间匹配 | 日期（ISO 8601 格式）、数值字段 |
| `in` | 包含匹配 | 枚举、关联 ID 字段（value 为数组） |
| `isNull` | 为空/不为空 | 所有字段（value 为 `true`/`false`） |
| `gt`/`lt` | 大于/小于 | 数值、日期字段 |
| `gte`/`lte` | 大于等于/小于等于 | 数值、日期字段 |

## 三、关键配置约束
1. **模型字段 UI-Tag 配置**：必须严格遵循 UI-Tag 协议规范，如数值类配置（`sort`/`width`）需传递数字字符串，布尔类配置（`table`/`search`）需用小写 `true`/`false`。
2. **关联预加载**：配置 `preload:关联字段名`（如 `preload:Profile`），支持多级预加载（`preload:Profile.Address`），引擎会自动触发 GORM 关联查询。
3. **搜索字段**：仅配置 `search:true` 的字段会被纳入过滤逻辑，未配置的字段即使传入 `filters` 也会被忽略。
4. **分页与排序**：`page_size` 最大限制为 100（防止大数据量查询性能问题），`sort` 参数支持 Ant Design Vue 4 表格前端排序逻辑。

## 四、常见问题排查
### 1. 模型注册失败（panic）
- 检查模型是否为 **结构体指针**（如 `&models.SysUser{}`，而非 `models.SysUser{}`）。
- 检查模型是否实现 `TableName() string` 方法。

### 2. 查询时未触发关联预加载
- 检查模型关联字段是否配置 `preload:关联名称`（如 `Profile SysUserProfile ui:"preload:Profile"`）。
- 关联名称需与结构体关联字段名一致（大小写敏感）。

### 3. 过滤条件不生效
- 检查字段是否配置 `search:true`（仅 `search:true` 的字段支持过滤）。
- 检查 `op` 操作符与字段类型是否匹配（如 `range` 仅支持日期/数值字段）。
- 检查 `filters` 中字段名是否与模型 JSON 标签一致（去 `omitempty` 后）。

### 4. 前端未获取到关联字段数据
- 检查查询结果中关联字段是否存在（引擎会自动返回预加载的关联数据）。
- 前端需通过 `path` 配置取值（如 `path:profile.realName`），而非直接访问字段。

## 五、扩展说明
1. **新增模型流程**：
   1. 定义 GORM 模型并配置 UI-Tag 标签。
   2. 实现 `TableName()` 方法。
   3. 在模型 `init` 函数中调用 `RegisterModel` 注册。
   4. 在 `ui_tag_engine.go` 的 `executeQuery` 函数中添加模型 case（如 `case *models.SysDept: list = &[]*models.SysDept{}`）。

2. **性能优化**：
   - 模型注册时预解析缓存，运行时无反射开销。
   - 表格查询字段缓存，避免重复筛选字段。
   - 限制最大页大小（100），防止大数据量查询拖慢系统。

## 结尾交付物提议
要不要我帮你生成一份 **UI-Tag 引擎前端调用示例代码**，包含 schema 缓存、表格渲染、搜索过滤、操作按钮渲染的完整实现（适配 Ant Design Vue 4）？