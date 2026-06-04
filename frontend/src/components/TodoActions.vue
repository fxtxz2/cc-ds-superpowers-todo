<template>
  <div class="todo-actions">
    <el-button
      type="info"
      plain
      size="small"
      :disabled="doneCount === 0"
      @click="handleArchive"
    >
      📦 归档已完成
    </el-button>
    <el-tooltip content="从 JSON 文件恢复数据，将覆盖当前所有数据" placement="top">
      <el-button
        type="warning"
        plain
        size="small"
        :loading="importing"
        @click="triggerImport"
      >
        📥 导入备份
      </el-button>
    </el-tooltip>
    <el-tooltip content="将所有数据导出为 JSON 文件" placement="top">
      <el-button
        type="primary"
        plain
        size="small"
        @click="handleExport"
      >
        📤 导出备份
      </el-button>
    </el-tooltip>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTodoStore } from '../composables/useTodoStore'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const props = defineProps({
  doneCount: { type: Number, default: 0 },
})

const emit = defineEmits(['archive'])

const store = useTodoStore()
const fileInput = ref(null)
const importing = ref(false)

async function handleArchive() {
  try {
    await ElMessageBox.confirm(
      `确定要归档 ${props.doneCount} 条已完成的任务吗？归档后可在历史记录中查看。`,
      '确认归档',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    )
    emit('archive')
    ElMessage.success('归档完成')
  } catch {
    // 用户取消
  }
}

function handleExport() {
  try {
    const data = store.exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStr = new Date().toLocaleDateString('en-CA')
    a.href = url
    a.download = `todo-backup-${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(`导出失败：${e?.message ?? e}`)
  }
}

function triggerImport() {
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error('文件过大，请选择小于 10MB 的文件')
    return
  }

  importing.value = true
  try {
    const text = await readFileAsText(file)
    let jsonData
    try {
      jsonData = JSON.parse(text)
    } catch {
      ElMessage.error('文件格式错误，请选择 .json 文件')
      return
    }

    if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
      ElMessage.error('文件格式错误，请选择有效的备份文件')
      return
    }

    const itemCount = Array.isArray(jsonData.items) ? jsonData.items.length : 0
    const archivedCount = Array.isArray(jsonData.archivedItems) ? jsonData.archivedItems.length : 0

    await ElMessageBox.confirm(
      `发现 ${itemCount} 条待办事项和 ${archivedCount} 条已归档任务。导入将覆盖当前所有数据，确定继续？`,
      '确认导入',
      { confirmButtonText: '确定导入', cancelButtonText: '取消', type: 'warning' }
    )

    store.importData(jsonData)
    ElMessage.success(`导入完成：${itemCount} 条待办，${archivedCount} 条归档`)
  } catch (e) {
    if (e === 'cancel' || e === 'close') {
      // 用户取消确认
    } else if (e.message) {
      ElMessage.error(`导入失败：${e.message}`)
    } else {
      ElMessage.error('导入失败：未知错误')
    }
  } finally {
    importing.value = false
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
</script>

<style scoped>
.todo-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
</style>
