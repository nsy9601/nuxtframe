<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ParsedUIConfig, FieldConfig } from '@/types/config';
import { formatValue, renderRelationData } from '@/composables/useFormatter';
import { saveVisibleColumns, getVisibleColumns, savePageSize, getPageSize, exportTableToExcel } from '@/composables/useTable';
import ActionButtons from './ActionButtons.vue';
import ColumnFilter from './ColumnFilter.vue';

// Props 定义
const props = defineProps<{
  uiConfig: ParsedUIConfig;
  dataList: Record<string, any>[];
  total: number;
  loading: boolean;
  pageParams: {
    page: number;
    page_size: number;
    sort?: string;
  };
  selectedRows: Record<string, any>[]; // 接收选中数据
}>();

// Emits 声明
const emit = defineEmits<{
  (e: 'page-change', params: { page: number; page_size: number }): void;
  (e: 'sort-change', sort: string): void;
  (e: 'refresh'): void;
  (e: 'update:selected-rows', selectedRows: Record<string, any>[]): void; // 支持双向绑定
}>();

// 修复：全选逻辑（使用计算属性）
const isAllSelected = computed({
  get: () => props.dataList.length > 0 && props.selectedRows.length === props.dataList.length,
  set: (val: boolean) => {
    emit('update:selected-rows', val ? [...props.dataList] : []);
  }
});


const { model } = props.uiConfig;

// 表格列配置（过滤 table:false 的字段）
const tableColumns = computed(() => {
  return Object.entries(props.uiConfig.fields)
    .filter(([_, config]) => config.table !== false)
    .sort((a, b) => (a[1].sort || 99) - (b[1].sort || 99))
    .map(([fieldName, config]) => ({ fieldName, ...config }));
});

// 所有列名
const allColumnNames = computed(() => tableColumns.value.map(col => col.fieldName));

// 显示的列名（本地存储缓存）
const visibleColumnNames = ref(getVisibleColumns(model, allColumnNames.value));

// 监听显示列变化，同步缓存
watch(visibleColumnNames, (val) => {
  saveVisibleColumns(model, val);
});

// 显示的列配置
const visibleColumns = computed(() => {
  return tableColumns.value.filter(col => visibleColumnNames.value.includes(col.fieldName));
});

// 每页条数（缓存+支持切换）
const pageSizes = [10, 20, 50, 100];
const currentPageSize = ref(getPageSize(model));

// 监听每页条数变化
watch(currentPageSize, (val) => {
  savePageSize(model, val);
  emit('page-change', { page: 1, page_size: val });
});

// 当前页码
const currentPage = ref(props.pageParams.page);

// 监听页码变化
watch(currentPage, (val) => {
  emit('page-change', { page: val, page_size: currentPageSize.value });
});

// 排序字段与方向
const sortField = ref<string | undefined>(props.pageParams.sort?.split('_')[0]);
const sortDir = ref<'asc' | 'desc'>((props.pageParams.sort?.split('_')[1] as 'asc' | 'desc') || 'asc');

// 排序变化处理
const handleSort = (fieldName: string) => {
  if (sortField.value === fieldName) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = fieldName;
    sortDir.value = 'asc';
  }
  const sortStr = `${fieldName}_${sortDir.value}`;
  emit('sort-change', sortStr);
};

// 选中的数据
// const selectedRows = ref<Record<string, any>[]>([]);

// 监听选中数据变化
watch(selectedRows, (val) => {
  emit('update:selected-rows', val);
});

// 全选处理
const handleSelectAll = (checked: boolean) => {
  selectedRows.value = checked ? [...props.dataList] : [];
};

// 修复：单行选中逻辑
const handleSelectRow = (row: Record<string, any>, checked: boolean) => {
  let newSelectedRows = [...props.selectedRows];
  if (checked) {
    newSelectedRows.push(row);
  } else {
    newSelectedRows = newSelectedRows.filter(item => item.id !== row.id);
  }
  emit('update:selected-rows', newSelectedRows);
};

// 列筛选弹窗
const columnFilterOpen = ref(false);

// 导出Excel
const handleExportExcel = () => {
  exportTableToExcel(model, props.uiConfig, props.dataList, visibleColumnNames.value);
};

// 表格单元格渲染（遵循协议格式化与关联关系规则）
const renderCell = (row: Record<string, any>, column: { fieldName: string; config: FieldConfig }) => {
  const { fieldName, config } = column;
  const value = row[fieldName];

  // 关联数据处理
  if (config.path || config.mode) {
    return renderRelationData(value, config.path, config.pathItem, config.mode);
  }

  // 格式化处理
  if (config.formatter) {
    return formatValue(value, config.formatter);
  }

  // 空值处理
  return value === null || value === undefined ? (config.emptyText || '--') : value;
};
</script>

<template>
  <div class="card overflow-hidden">
    <!-- 表格顶部操作区 -->
    <div class="flex flex-wrap items-center justify-between p-4 border-b border-border">
      <div class="flex items-center gap-2">
        <!-- 批量操作（仅多选时显示） -->
        <template v-if="dataList.length > 0">
          <UCheckbox
            v-model="isAllSelected"
            label="全选"
            size="sm"
            @change="handleSelectAll"
          />
          <span class="text-text-secondary text-sm">
            已选中 {{ selectedRows.length }} 条
          </span>
          <ActionButtons
            :ui-config="uiConfig"
            :selected-rows="selectedRows"
            is-batch
            @refresh="emit('refresh')"
          />
        </template>
      </div>
      <div class="flex items-center gap-2 mt-2 sm:mt-0">
        <!-- 列筛选按钮 -->
        <UButton
          variant="ghost"
          size="sm"
          @click="columnFilterOpen = true"
        >
          <Icon name="ic:outline:filter_list" class="mr-1" />
          列筛选
        </UButton>
        <!-- 导出Excel按钮 -->
        <UButton
          variant="ghost"
          size="sm"
          :disabled="dataList.length === 0"
          @click="handleExportExcel"
        >
          <Icon name="ic:outline:download" class="mr-1" />
          导出Excel
        </UButton>
      </div>
    </div>

    <!-- 表格主体 -->
    <UTable
      class="w-full"
      :loading="loading"
      :empty="dataList.length === 0 && !loading"
      empty-text="暂无数据"
    >
      <thead>
        <tr class="bg-background-secondary">
          <th v-if="dataList.length > 0" class="w-12 text-center">
            <UCheckbox v-model="isAllSelected" />
          </th>

          <th
            v-for="column in visibleColumns"
            :key="column.fieldName"
            :class="[
              column.align || 'text-left', // 确保 align 是 text-left 而非 left
              column.tableClass
            ]"
            :style="{
              width: column.width,
              minWidth: column.minWidth ? `${column.minWidth}px` : undefined
            }"
          >
            <div class="flex items-center justify-between">
              <span>{{ column.label || column.fieldName }}</span>
              
              <Icon
                v-if="column.sort !== false"
                :name="sortField === column.fieldName 
                  ? (sortDir === 'asc' ? 'ic:outline:arrow-upward' : 'ic:outline:arrow-downward') 
                  : 'ic:outline:unfold_more'"
                class="cursor-pointer text-text-secondary"
                @click="handleSort(column.fieldName)"
              />
            </div>
          </th>

          <th
            class="text-center"
            :style="{
              width: `calc(${uiConfig.global.actionWidth || 150}px + 1rem)`
            }"
          >
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in dataList"
          :key="row.id"
          class="hover:bg-background-secondary transition-colors"
        >
          <!-- 复选框列 -->
          <td v-if="dataList.length > 0" class="text-center">
            <UCheckbox
              :model-value="selectedRows.some(item => item.id === row.id)"
              @change="(val) => handleSelectRow(row, val)"
            />
          </td>
          <!-- 数据列 -->
          <td
            v-for="column in visibleColumns"
            :key="column.fieldName"
            :class="[
              column.align || 'left',
              column.tableClass,
              column.ellipsis ? 'overflow-hidden text-ellipsis whitespace-nowrap' : ''
            ]"
          >
            <div v-if="column.ellipsis" class="relative">
              <UTooltip :content="renderCell(row, { fieldName: column.fieldName, config: column })" placement="top">
                <span class="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {{ renderCell(row, { fieldName: column.fieldName, config: column }) }}
                </span>
              </UTooltip>
            </div>
            <div v-else>
              {{ renderCell(row, { fieldName: column.fieldName, config: column }) }}
            </div>
          </td>
          <!-- 操作列 -->
          <td class="text-center">
            <ActionButtons
              :ui-config="uiConfig"
              :row="row"
              @refresh="emit('refresh')"
            />
          </td>
        </tr>
      </tbody>
    </UTable>

    <!-- 分页 -->
    <div class="flex flex-wrap items-center justify-between p-4 border-t border-border">
      <div class="text-text-secondary text-sm mb-2 sm:mb-0">
        共 {{ total }} 条数据，当前显示第 {{ currentPage }} 页
      </div>
      <div class="flex items-center gap-2">
        <span class="text-text-secondary text-sm">每页条数：</span>
        <USelect
          v-model="currentPageSize"
          :options="pageSizes.map(size => ({ label: size + '条', value: size }))"
          size="sm"
          class="w-24"
        />
        <UPagination
          v-model="currentPage"
          :total="total"
          :page-size="currentPageSize"
          size="sm"
          @page-change="currentPage = $event"
        />
      </div>
    </div>
  </div>

  <!-- 列筛选弹窗 -->
  <UDialog v-model="columnFilterOpen" title="列筛选" size="sm">
    <ColumnFilter
      :fields="tableColumns"
      :visible-columns="visibleColumnNames"
      @column-change="visibleColumnNames = $event"
    />
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="columnFilterOpen = false">取消</UButton>
        <UButton type="primary" @click="columnFilterOpen = false">确认</UButton>
      </div>
    </template>
  </UDialog>
</template>