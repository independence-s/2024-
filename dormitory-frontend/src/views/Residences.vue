<template>
  <div>
    <!-- 顶部操作栏 -->
    <el-card style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <el-select v-model="filters.buildingId" placeholder="全部楼栋" clearable style="width: 150px; margin-right: 10px;">
            <el-option
              v-for="item in buildings"
              :key="item.buildingId"
              :label="`${item.buildingName}（${item.gender === '男' ? '男生楼' : '女生楼'}）`"
              :value="item.buildingId"
            />
          </el-select>
          <el-select v-model="filters.collegeId" placeholder="全部学院" clearable style="width: 150px; margin-right: 10px;">
            <el-option
              v-for="item in colleges"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeId"
            />
          </el-select>
          <el-input v-model="filters.keyword" placeholder="搜索姓名/学号" style="width: 200px; margin-right: 10px;" clearable />
          <el-button type="primary" @click="loadResidences">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
        <div>
          <el-button v-if="userInfo?.role >= 1" type="success" @click="openAssignDialog">+ 分配宿舍</el-button>
          <el-button v-if="userInfo?.role === 2" type="primary" @click="openBatchDialog">📋 批量分配</el-button>
        </div>
      </div>
    </el-card>

    <!-- 住宿记录表格 -->
    <el-card>
      <el-table :data="filteredResidences" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column label="宿舍楼" width="150">
          <template #default="{ row }">
            {{ row.buildingName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="roomNumber" label="房间号" width="100" />
        <el-table-column label="宿舍类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.buildingGender === '男' ? 'primary' : 'danger'">
              {{ row.buildingGender === '男' ? '男生楼' : '女生楼' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入住时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.checkInDate).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="140" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="userInfo?.role >= 1" size="small" type="warning" @click="openChangeDialog(row)">调宿</el-button>
            <el-button v-if="userInfo?.role >= 1" size="small" type="danger" @click="handleCheckout(row)">退宿</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ===== 单个分配弹窗 ===== -->
    <el-dialog v-model="assignDialogVisible" title="分配宿舍" width="500px" @close="resetAssignForm">
      <el-form ref="assignFormRef" :model="assignForm" :rules="assignRules" label-width="100px">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="assignForm.studentId" placeholder="请选择学生" style="width: 100%;" filterable>
            <el-option
              v-for="item in availableStudents"
              :key="item.studentId"
              :label="`${item.name}（${item.studentNo}）`"
              :value="item.studentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间" prop="roomId">
          <el-select v-model="assignForm.roomId" placeholder="请选择房间" style="width: 100%;" filterable>
            <el-option
              v-for="item in availableRooms"
              :key="item.roomId"
              :label="`${item.building?.buildingName || ''} - ${item.roomNumber}（${item.building?.gender === '男' ? '男生楼' : '女生楼'}，空床: ${item.availableBeds}）`"
              :value="item.roomId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="assignForm.semester" placeholder="如：2025-2026-1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="submitAssign">确定分配</el-button>
      </template>
    </el-dialog>

    <!-- ===== 批量分配弹窗 ===== -->
    <el-dialog v-model="batchDialogVisible" title="批量分配宿舍" width="500px" @close="resetBatchForm">
      <el-form ref="batchFormRef" :model="batchForm" label-width="100px">
        <el-form-item label="学院">
          <el-select v-model="batchForm.collegeId" placeholder="全部学院" clearable style="width: 100%;">
            <el-option
              v-for="item in colleges"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="batchForm.classId" placeholder="全部班级" clearable style="width: 100%;">
            <el-option
              v-for="item in filteredClassesForBatch"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="batchForm.gender" placeholder="全部性别" clearable style="width: 100%;">
            <el-option label="男生" value="男" />
            <el-option label="女生" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="batchForm.semester" placeholder="如：2025-2026-1" />
        </el-form-item>
        <el-form-item>
          <el-tag type="info">将自动为符合条件且未分配宿舍的学生分配空闲房间</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="submitBatchAssign">开始分配</el-button>
      </template>
    </el-dialog>

    <!-- ===== 调宿弹窗 ===== -->
    <el-dialog v-model="changeDialogVisible" title="调宿" width="500px" @close="resetChangeForm">
      <el-form ref="changeFormRef" :model="changeForm" :rules="changeRules" label-width="100px">
        <el-form-item label="学生">
          <span>{{ changeForm.studentName }}（{{ changeForm.studentNo }}）</span>
        </el-form-item>
        <el-form-item label="当前房间">
          <span>{{ changeForm.currentRoom }}</span>
        </el-form-item>
        <el-form-item label="目标房间" prop="newRoomId">
          <el-select v-model="changeForm.newRoomId" placeholder="请选择目标房间" style="width: 100%;" filterable>
            <el-option
              v-for="item in availableRoomsForChange"
              :key="item.roomId"
              :label="`${item.building?.buildingName || ''} - ${item.roomNumber}（${item.building?.gender === '男' ? '男生楼' : '女生楼'}，空床: ${item.availableBeds}）`"
              :value="item.roomId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="changeLoading" @click="submitChange">确定调宿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { residenceApi } from '../api/residence'
import { studentApi } from '../api/student'
import { roomApi } from '../api/room'
import { collegeApi } from '../api/college'
import { classApi } from '../api/class'
import { buildingApi } from '../api/building'

// 用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 数据
const residences = ref([])
const loading = ref(false)
const filters = reactive({
  buildingId: '',
  collegeId: '',
  keyword: ''
})

// 下拉数据
const buildings = ref([])
const colleges = ref([])
const classes = ref([])
const availableStudents = ref([])
const availableRooms = ref([])
const availableRoomsForChange = ref([])

// 计算属性
const filteredResidences = computed(() => {
  let list = residences.value

  if (filters.buildingId) {
    list = list.filter(r => r.buildingId === filters.buildingId)
  }
  if (filters.collegeId) {
    list = list.filter(r => r.collegeId === filters.collegeId)
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(r =>
      (r.studentName && r.studentName.includes(kw)) ||
      (r.studentNo && r.studentNo.includes(kw))
    )
  }
  return list
})

const filteredClassesForBatch = computed(() => {
  if (!batchForm.collegeId) return classes.value
  return classes.value.filter(c => c.collegeId === batchForm.collegeId)
})

//加载数据 
const loadResidences = async () => {
  loading.value = true
  try {
    const res = await residenceApi.getAll()
    residences.value = res.data
  } catch (error) {
    ElMessage.error('加载住宿记录失败')
  } finally {
    loading.value = false
  }
}

const loadBuildings = async () => {
  try {
    const res = await buildingApi.getAll()
    buildings.value = res.data
  } catch (error) {
    ElMessage.error('加载楼栋数据失败')
  }
}

const loadColleges = async () => {
  try {
    const res = await collegeApi.getAll()
    colleges.value = res.data
  } catch (error) {
    ElMessage.error('加载学院数据失败')
  }
}

const loadClasses = async () => {
  try {
    const res = await classApi.getAll()
    classes.value = res.data
  } catch (error) {
    ElMessage.error('加载班级数据失败')
  }
}

const loadAvailableStudents = async () => {
  try {
    const res = await studentApi.getAll()
    const assignedIds = residences.value.map(r => r.studentId)
    availableStudents.value = res.data.filter(s => !assignedIds.includes(s.studentId))
  } catch (error) {
    ElMessage.error('加载学生数据失败')
  }
}

const loadAvailableRooms = async () => {
  try {
    const res = await roomApi.getAll()
    availableRooms.value = res.data.filter(r => r.availableBeds > 0)
    availableRoomsForChange.value = res.data.filter(r => r.availableBeds > 0)
  } catch (error) {
    ElMessage.error('加载房间数据失败')
  }
}

const resetFilters = () => {
  filters.buildingId = ''
  filters.collegeId = ''
  filters.keyword = ''
  loadResidences()
}

// ============ 获取当前学期 ============
const getCurrentSemester = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 9) return `${year}-${year + 1}-1`
  else if (month >= 2) return `${year - 1}-${year}-2`
  else return `${year - 1}-${year}-1`
}

//单个分配
const assignDialogVisible = ref(false)
const assignLoading = ref(false)
const assignFormRef = ref(null)
const assignForm = reactive({
  studentId: '',
  roomId: '',
  semester: ''
})
const assignRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  roomId: [{ required: true, message: '请选择房间', trigger: 'change' }]
}

const openAssignDialog = () => {
  assignDialogVisible.value = true
  loadAvailableStudents()
  loadAvailableRooms()
  assignForm.semester = getCurrentSemester()
}

const resetAssignForm = () => {
  assignForm.studentId = ''
  assignForm.roomId = ''
  assignForm.semester = getCurrentSemester()
  assignFormRef.value?.clearValidate()
}

const submitAssign = async () => {
  try {
    await assignFormRef.value.validate()
    assignLoading.value = true
    await residenceApi.assign({
      studentId: assignForm.studentId,
      roomId: assignForm.roomId,
      semester: assignForm.semester
    })
    ElMessage.success('分配成功！')
    assignDialogVisible.value = false
    loadResidences()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '分配失败')
  } finally {
    assignLoading.value = false
  }
}

// 批量分配
const batchDialogVisible = ref(false)
const batchLoading = ref(false)
const batchFormRef = ref(null)
const batchForm = reactive({
  collegeId: '',
  classId: '',
  gender: '',
  semester: ''
})

const openBatchDialog = () => {
  batchDialogVisible.value = true
  batchForm.semester = getCurrentSemester()
}

const resetBatchForm = () => {
  batchForm.collegeId = ''
  batchForm.classId = ''
  batchForm.gender = ''
  batchForm.semester = getCurrentSemester()
}

const submitBatchAssign = async () => {
  try {
    batchLoading.value = true
    const res = await residenceApi.batchAssign({
      collegeId: batchForm.collegeId || null,
      classId: batchForm.classId || null,
      gender: batchForm.gender || null,
      semester: batchForm.semester
    })
    ElMessage.success(`分配完成：成功 ${res.data.assigned} 人，剩余 ${res.data.remaining} 人未分配`)
    batchDialogVisible.value = false
    loadResidences()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '批量分配失败')
  } finally {
    batchLoading.value = false
  }
}

//调宿
const changeDialogVisible = ref(false)
const changeLoading = ref(false)
const changeFormRef = ref(null)
const changeForm = reactive({
  studentId: '',
  studentName: '',
  studentNo: '',
  currentRoom: '',
  newRoomId: ''
})
const changeRules = {
  newRoomId: [{ required: true, message: '请选择目标房间', trigger: 'change' }]
}

const openChangeDialog = (row) => {
  changeForm.studentId = row.studentId
  changeForm.studentName = row.studentName
  changeForm.studentNo = row.studentNo
  changeForm.currentRoom = `${row.buildingName} - ${row.roomNumber}`
  changeForm.newRoomId = ''
  changeDialogVisible.value = true
  loadAvailableRooms()
}

const resetChangeForm = () => {
  changeForm.newRoomId = ''
  changeFormRef.value?.clearValidate()
}

const submitChange = async () => {
  try {
    await changeFormRef.value.validate()
    changeLoading.value = true
    await residenceApi.change({
      studentId: changeForm.studentId,
      newRoomId: changeForm.newRoomId
    })
    ElMessage.success('调宿成功！')
    changeDialogVisible.value = false
    loadResidences()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '调宿失败')
  } finally {
    changeLoading.value = false
  }
}

//退宿
const handleCheckout = (row) => {
  ElMessageBox.confirm(
    `确定要为学生 ${row.studentName}（${row.studentNo}）办理退宿吗？`,
    '退宿确认',
    {
      confirmButtonText: '确定退宿',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await residenceApi.checkout({ studentId: row.studentId })
      ElMessage.success('退宿成功！')
      loadResidences()
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '退宿失败')
    }
  }).catch(() => {})
}

//生命周期
onMounted(() => {
  loadResidences()
  loadBuildings()
  loadColleges()
  loadClasses()
})
</script>