<template>
  <div>
    <!-- 顶部操作栏 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名/学号"
            style="width: 200px; margin-right: 10px;"
            clearable
            @input="handleSearch"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
        <el-button type="success" @click="openAddDialog">+ 新增学生</el-button>
      </div>
    </el-card>

    <!-- 学生表格 -->
    <el-card>
      <el-table
        :data="filteredStudents"
        border
        stripe
        style="width: 100%;"
        v-loading="loading"
      >
        <el-table-column prop="studentId" label="序号" width="80" />
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column prop="class" label="班级" min-width="120" />

        <!-- 宿舍列 -->
        <el-table-column label="宿舍" width="200">
          <template #default="{ row }">
            <template v-if="row.currentRoom">
              <el-tag size="small" type="primary">
                {{ row.currentRoom.buildingName }} - {{ row.currentRoom.roomNumber }}
              </el-tag>
              <span style="font-size: 12px; color: #909399; margin-left: 6px;">
                {{ row.currentRoom.floorNumber }}楼
              </span>
            </template>
            <span v-else style="color: #c0c4cc;">未分配</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'info'">
              {{ row.status === 0 ? '在读' : '已毕业' }}
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
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="formData.studentNo" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>

        <!-- 当前宿舍显示（编辑时只读） -->
        <el-form-item label="当前宿舍" v-if="isEdit">
          <span v-if="currentRoomInfo">
            {{ currentRoomInfo.buildingName }} - {{ currentRoomInfo.roomNumber }}
            <span style="font-size: 12px; color: #909399; margin-left: 6px;">
              {{ currentRoomInfo.floorNumber }}楼
            </span>
          </span>
          <span v-else style="color: #c0c4cc;">未分配</span>
        </el-form-item>

        <el-form-item label="学院" prop="college">
          <el-input v-model="formData.college" />
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="formData.class" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">在读</el-radio>
            <el-radio :value="1">已毕业</el-radio>
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
import { studentApi } from '../api/student'

const students = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentRoomInfo = ref(null)

const formData = reactive({
  studentId: 0,
  studentNo: '',
  name: '',
  gender: '男',
  phone: '',
  email: '',
  college: '',
  class: '',
  status: 0
})

const formRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑学生' : '新增学生')

const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value
  const keyword = searchKeyword.value.toLowerCase()
  return students.value.filter(item =>
    item.name.includes(keyword) || item.studentNo.includes(keyword)
  )
})

const loadStudents = async () => {
  loading.value = true
  try {
    const res = await studentApi.getAll()
    students.value = res.data
  } catch (error) {
    ElMessage.error('加载数据失败，请检查后端是否运行')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {}

const resetSearch = () => {
  searchKeyword.value = ''
}

const openAddDialog = () => {
  isEdit.value = false
  currentRoomInfo.value = null
  dialogVisible.value = true
  resetForm()
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true

  // 手动映射字段
  formData.studentId = row.studentId
  formData.studentNo = row.studentNo
  formData.name = row.name
  formData.gender = row.gender
  formData.phone = row.phone || ''
  formData.email = row.email || ''
  formData.college = row.college || ''
  formData.class = row.class || ''
  formData.status = row.status

  currentRoomInfo.value = row.currentRoom || null
}

const resetForm = () => {
  Object.assign(formData, {
    studentId: 0,
    studentNo: '',
    name: '',
    gender: '男',
    phone: '',
    email: '',
    collegeName: '',
    className: '',
    status: 0
  })
  currentRoomInfo.value = null
  formRef.value?.clearValidate()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()

    // 构建提交数据，将 collegeName 和 className 映射为后端需要的字段
    const submitData = {
      studentId: formData.studentId,
      studentNo: formData.studentNo,
      name: formData.name,
      gender: formData.gender,
      phone: formData.phone || '',
      email: formData.email || '',
      college: formData.college || '',
      class: formData.class || '',
      status: formData.status
    }
    console.log('提交数据',submitData)
    if (isEdit.value) {
      await studentApi.update(formData.studentId, submitData)
      ElMessage.success('更新成功！')
    } else {
      await studentApi.create(submitData)
      ElMessage.success('添加成功！')
    }

    dialogVisible.value = false
    loadStudents()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data || '操作失败')
    } else {
      ElMessage.error('操作失败，请检查网络')
    }
    console.error(error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.name}（${row.studentNo}）吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await studentApi.delete(row.studentId)
      ElMessage.success('删除成功！')
      loadStudents()
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadStudents()
})
</script>