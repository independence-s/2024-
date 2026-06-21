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
        <el-table-column prop="studentId" label="ID" width="80" />
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column prop="class" label="班级" min-width="120" />
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
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="formData.college" />
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="formData.class" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">在读</el-radio>
            <el-radio :label="1">已毕业</el-radio>
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

// ============ 数据 ============
const students = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
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

// 表单验证规则
const formRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

// ============ 计算属性 ============
const dialogTitle = computed(() => isEdit.value ? '编辑学生' : '新增学生')

const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value
  const keyword = searchKeyword.value.toLowerCase()
  return students.value.filter(item =>
    item.name.includes(keyword) || item.studentNo.includes(keyword)
  )
})

// ============ 方法 ============
// 加载数据
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

// 搜索
const handleSearch = () => {
  // 已通过 computed 自动过滤
}

const resetSearch = () => {
  searchKeyword.value = ''
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(formData, row)
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
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
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 更新
      await studentApi.update(formData.studentId, formData)
      ElMessage.success('更新成功！')
    } else {
      // 新增
      await studentApi.create(formData)
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

// 删除
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

// ============ 生命周期 ============
onMounted(() => {
  loadStudents()
})
</script>