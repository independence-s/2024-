<template>
  <div>
    <!-- 顶部操作栏 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索房间号或楼名"
            style="width: 200px; margin-right: 10px;"
            clearable
          />
          <el-button type="primary" @click="loadRooms">搜索</el-button>
          <el-button @click="searchKeyword = ''; loadRooms()">重置</el-button>
        </div>
        <el-button type="success" @click="openAddDialog">+ 新增房间</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="filteredRooms" border stripe v-loading="loading">
        <el-table-column prop="roomId" label="ID" width="80" />
        <el-table-column prop="roomNumber" label="房间号" width="120" />
        <el-table-column label="所属宿舍楼" width="150">
          <template #default="{ row }">
            {{ row.building?.buildingName || '未关联' }}
          </template>
        </el-table-column>
        <el-table-column prop="floorNumber" label="楼层" width="80" />
        <el-table-column prop="capacity" label="总床位数" width="100" />
        <el-table-column prop="availableBeds" label="空床位数" width="100" />
        <el-table-column label="房间类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.roomType === 0 ? 'success' : row.roomType === 1 ? 'warning' : 'info'">
              {{ ['四人间', '六人间', '八人间'][row.roomType] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="所属宿舍楼" prop="buildingId">
          <el-select v-model="formData.buildingId" placeholder="请选择宿舍楼" style="width: 100%;">
            <el-option
              v-for="building in buildingOptions"
              :key="building.buildingId"
              :label="building.buildingName"
              :value="building.buildingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floorNumber">
          <el-input-number v-model="formData.floorNumber" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="房间号" prop="roomNumber">
          <el-input v-model="formData.roomNumber" />
        </el-form-item>
        <el-form-item label="总床位数" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="1" :max="8" />
        </el-form-item>
        <el-form-item label="空床位数" prop="availableBeds">
          <el-input-number v-model="formData.availableBeds" :min="0" :max="8" />
        </el-form-item>
        <el-form-item label="房间类型" prop="roomType">
          <el-radio-group v-model="formData.roomType">
            <el-radio :label="0">四人间</el-radio>
            <el-radio :label="1">六人间</el-radio>
            <el-radio :label="2">八人间</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roomApi } from '../api/room'
import { buildingApi } from '../api/building'

// ============ 数据 ============
const rooms = ref([])
const buildingOptions = ref([])      // 用于下拉框的楼栋列表
const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  roomId: 0,
  buildingId: null,
  floorNumber: 1,
  roomNumber: '',
  capacity: 4,
  availableBeds: 4,
  roomType: 0
})

// 表单验证
const formRules = {
  buildingId: [{ required: true, message: '请选择宿舍楼', trigger: 'change' }],
  floorNumber: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
  roomNumber: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入总床位数', trigger: 'blur' }],
  availableBeds: [{ required: true, message: '请输入空床位数', trigger: 'blur' }]
}

// ============ 计算属性 ============
const dialogTitle = computed(() => isEdit.value ? '编辑房间' : '新增房间')

const filteredRooms = computed(() => {
  if (!searchKeyword.value) return rooms.value
  const keyword = searchKeyword.value.toLowerCase()
  return rooms.value.filter(item =>
    item.roomNumber.includes(keyword) ||
    (item.building?.buildingName && item.building.buildingName.includes(keyword))
  )
})

// ============ 方法 ============
// 加载房间列表
const loadRooms = async () => {
  loading.value = true
  try {
    const res = await roomApi.getAll()
    rooms.value = res.data
  } catch (error) {
    ElMessage.error('加载房间数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载宿舍楼列表（用于下拉框）
const loadBuildings = async () => {
  try {
    const res = await buildingApi.getAll()
    buildingOptions.value = res.data
  } catch (error) {
    ElMessage.error('加载宿舍楼数据失败')
    console.error(error)
  }
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
  // 确保下拉框有数据
  if (buildingOptions.value.length === 0) {
    loadBuildings()
  }
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  // 复制数据到表单
  Object.assign(formData, row)
  // 如果关联的楼栋信息存在，确保 buildingId 正确
  formData.buildingId = row.buildingId
  if (buildingOptions.value.length === 0) {
    loadBuildings()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    roomId: 0,
    buildingId: null,
    floorNumber: 1,
    roomNumber: '',
    capacity: 4,
    availableBeds: 4,
    roomType: 0
  })
  formRef.value?.clearValidate()
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await roomApi.update(formData.roomId, formData)
      ElMessage.success('更新成功！')
    } else {
      await roomApi.create(formData)
      ElMessage.success('添加成功！')
    }
    dialogVisible.value = false
    loadRooms()          // 刷新列表
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data || '操作失败')
    } else {
      ElMessage.error('操作失败，请检查网络')
    }
    console.error(error)
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除房间 ${row.roomNumber} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await roomApi.delete(row.roomId)
      ElMessage.success('删除成功！')
      loadRooms()
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }).catch(() => {})
}

// ============ 生命周期 ============
onMounted(() => {
  loadRooms()
  loadBuildings()
})
</script>