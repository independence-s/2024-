<template>
  <div>
    <!-- 顶部操作栏 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索楼名"
            style="width: 200px; margin-right: 10px;"
            clearable
          />
          <el-button type="primary" @click="loadBuildings">搜索</el-button>
          <el-button @click="searchKeyword = ''; loadBuildings()">重置</el-button>
        </div>
        <el-button type="success" @click="openAddDialog">+ 新增宿舍楼</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="filteredBuildings" border stripe v-loading="loading">
        <el-table-column prop="buildingId" label="序号" width="80" />
        <el-table-column prop="buildingName" label="楼名" width="150" />
        <el-table-column label="宿舍楼类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'">
              {{ row.gender === '男' ? '男生楼' : '女生楼' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalFloors" label="楼层数" width="100" />
        <el-table-column prop="address" label="地址" min-width="180" />
        <el-table-column prop="managerName" label="楼管姓名" width="120" />
        <el-table-column prop="managerPhone" label="楼管电话" width="150" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="楼名" prop="buildingName">
          <el-input v-model="formData.buildingName" />
        </el-form-item>
        <!-- 新增：性别选择-->
        <el-form-item label="宿舍楼类型" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男">男生楼</el-radio>
            <el-radio label="女">女生楼</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="楼层数" prop="totalFloors">
          <el-input-number v-model="formData.totalFloors" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" />
        </el-form-item>
        <el-form-item label="楼管姓名" prop="managerName">
          <el-input v-model="formData.managerName" />
        </el-form-item>
        <el-form-item label="楼管电话" prop="managerPhone">
          <el-input v-model="formData.managerPhone" />
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
import { buildingApi } from '../api/building'

const buildings = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const formData = reactive({
  buildingId: 0,
  buildingName: '',
  gender: '男', 
  totalFloors: 1,
  address: '',
  managerName: '',
  managerPhone: ''
})

const formRules = {
  buildingName: [{ required: true, message: '请输入楼名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择宿舍楼类型', trigger: 'change' }],
  totalFloors: [{ required: true, message: '请输入楼层数', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑宿舍楼' : '新增宿舍楼')

const filteredBuildings = computed(() => {
  if (!searchKeyword.value) return buildings.value
  return buildings.value.filter(item =>
    item.buildingName.includes(searchKeyword.value)
  )
})

const loadBuildings = async () => {
  loading.value = true
  try {
    const res = await buildingApi.getAll()
    buildings.value = res.data
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(formData, row)
}

const resetForm = () => {
  Object.assign(formData, {
    buildingId: 0,
    buildingName: '',
    gender: '男',
    totalFloors: 1,
    address: '',
    managerName: '',
    managerPhone: ''
  })
  formRef.value?.clearValidate()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await buildingApi.update(formData.buildingId, formData)
      ElMessage.success('更新成功！')
    } else {
      await buildingApi.create(formData)
      ElMessage.success('添加成功！')
    }
    dialogVisible.value = false
    loadBuildings()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除宿舍楼 ${row.buildingName} 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await buildingApi.delete(row.buildingId)
      ElMessage.success('删除成功！')
      loadBuildings()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => loadBuildings())
</script>