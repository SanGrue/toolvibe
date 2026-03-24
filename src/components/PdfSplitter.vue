<script setup lang="ts">
import { ref, computed } from 'vue';
import { PDFDocument } from 'pdf-lib';

const activeTab = ref<'split' | 'merge'>('split');

// ========== 拆分功能 ==========
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfDoc = ref<any>(null);
const pageCount = ref(0);
const splitErrorMsg = ref('');
const splitSuccessMsg = ref('');
const isSplitting = ref(false);

const splitMode = ref<'extract' | 'range'>('extract');
const extractStart = ref(1);
const extractEnd = ref(1);
const customRange = ref('');

const canExtract = computed(() => pdfDoc.value && extractStart.value >= 1 && extractEnd.value <= pageCount.value && extractStart.value <= extractEnd.value);

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.includes('pdf')) {
    splitErrorMsg.value = '请选择 PDF 文件';
    return;
  }

  splitErrorMsg.value = '';
  splitSuccessMsg.value = '';
  selectedFile.value = file;

  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc.value = await PDFDocument.load(arrayBuffer);
    pageCount.value = pdfDoc.value.getPageCount();
    extractEnd.value = pageCount.value;
    splitSuccessMsg.value = `已加载 PDF，共 ${pageCount.value} 页`;
  } catch (e) {
    splitErrorMsg.value = 'PDF 文件加载失败，请确保文件未加密';
    selectedFile.value = null;
    pdfDoc.value = null;
    pageCount.value = 0;
  }
};

const extractPages = async () => {
  if (!pdfDoc.value || !canExtract.value) return;

  isSplitting.value = true;
  splitErrorMsg.value = '';
  splitSuccessMsg.value = '';

  try {
    const newPdf = await PDFDocument.create();
    const pages: number[] = [];

    if (splitMode.value === 'extract') {
      for (let i = extractStart.value; i <= extractEnd.value; i++) {
        pages.push(i - 1);
      }
    } else {
      const rangeParts = customRange.value.split(',').flatMap(part => {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
          }
        } else {
          const num = parseInt(trimmed);
          if (!isNaN(num)) return [num - 1];
        }
        return [];
      });
      pages.push(...rangeParts.filter(p => p >= 0 && p < pageCount.value));
    }

    const copiedPages = await newPdf.copyPages(pdfDoc.value, [...new Set(pages)]);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const originalName = selectedFile.value?.name.replace('.pdf', '') || 'output';
    link.download = `${originalName}_pages_${extractStart.value}-${extractEnd.value}.pdf`;
    link.click();
    
    URL.revokeObjectURL(url);
    splitSuccessMsg.value = 'PDF 提取成功！';
  } catch (e) {
    splitErrorMsg.value = 'PDF 处理失败: ' + (e as Error).message;
  } finally {
    isSplitting.value = false;
  }
};

const resetFile = () => {
  selectedFile.value = null;
  pdfDoc.value = null;
  pageCount.value = 0;
  splitErrorMsg.value = '';
  splitSuccessMsg.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// ========== 合并功能 ==========
const mergeFiles = ref<{ name: string; file: File; pageCount: number }[]>([]);
const mergeInput = ref<HTMLInputElement | null>(null);
const mergeErrorMsg = ref('');
const mergeSuccessMsg = ref('');
const isMerging = ref(false);

const handleMergeFiles = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  mergeErrorMsg.value = '';
  
  for (const file of Array.from(files)) {
    if (!file.type.includes('pdf')) {
      mergeErrorMsg.value = '请选择 PDF 文件';
      continue;
    }
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      mergeFiles.value.push({
        name: file.name,
        file: file,
        pageCount: doc.getPageCount()
      });
    } catch (e) {
      mergeErrorMsg.value = `文件 ${file.name} 加载失败`;
    }
  }
  
  // 清空 input 以便重复选择同一文件
  target.value = '';
};

const removeMergeFile = (index: number) => {
  mergeFiles.value.splice(index, 1);
};

const moveFile = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    [mergeFiles.value[index], mergeFiles.value[index - 1]] = [mergeFiles.value[index - 1], mergeFiles.value[index]];
  } else if (direction === 'down' && index < mergeFiles.value.length - 1) {
    [mergeFiles.value[index], mergeFiles.value[index + 1]] = [mergeFiles.value[index + 1], mergeFiles.value[index]];
  }
};

const mergePDFs = async () => {
  if (mergeFiles.value.length < 2) {
    mergeErrorMsg.value = '请至少选择 2 个 PDF 文件';
    return;
  }

  isMerging.value = true;
  mergeErrorMsg.value = '';
  mergeSuccessMsg.value = '';

  try {
    const newPdf = await PDFDocument.create();
    
    for (const item of mergeFiles.value) {
      const arrayBuffer = await item.file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await newPdf.copyPages(doc, Array.from({ length: doc.getPageCount() }, (_, i) => i));
      copiedPages.forEach(page => newPdf.addPage(page));
    }

    const pdfBytes = await newPdf.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `merged_${mergeFiles.value.length}_files.pdf`;
    link.click();
    
    URL.revokeObjectURL(url);
    mergeSuccessMsg.value = `成功合并 ${mergeFiles.value.length} 个 PDF 文件`;
  } catch (e) {
    mergeErrorMsg.value = '合并失败: ' + (e as Error).message;
  } finally {
    isMerging.value = false;
  }
};

const clearMergeFiles = () => {
  mergeFiles.value = [];
  mergeErrorMsg.value = '';
  mergeSuccessMsg.value = '';
};
</script>

<template>
  <div class="pdf-splitter">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>PDF 工具</h2>
      <p>在线拆分、提取或合并 PDF 文件</p>
    </div>

    <div class="tab-switcher">
      <button 
        :class="{ active: activeTab === 'split' }" 
        @click="activeTab = 'split'"
      >
        拆分/提取
      </button>
      <button 
        :class="{ active: activeTab === 'merge' }" 
        @click="activeTab = 'merge'"
      >
        合并
      </button>
    </div>

    <!-- 拆分/提取 -->
    <div v-if="activeTab === 'split'" class="tab-content">
      <div v-if="!selectedFile" class="upload-section">
        <div class="upload-area" @click="fileInput?.click()">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <p class="upload-text">点击选择 PDF 文件</p>
          <p class="upload-hint">支持 PDF 文件（未加密）</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>

      <div v-else class="content-section">
        <div class="file-info">
          <div class="file-name">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>{{ selectedFile.name }}</span>
          </div>
          <span class="page-count">共 {{ pageCount }} 页</span>
          <button class="reset-btn" @click="resetFile">重新选择</button>
        </div>

        <div class="mode-selector">
          <label class="radio-label">
            <input type="radio" v-model="splitMode" value="extract" />
            <span>连续页面</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="splitMode" value="range" />
            <span>自定义范围</span>
          </label>
        </div>

        <div v-if="splitMode === 'extract'" class="range-inputs">
          <div class="input-group">
            <label>起始页</label>
            <input type="number" v-model.number="extractStart" min="1" :max="pageCount" />
          </div>
          <span class="separator">-</span>
          <div class="input-group">
            <label>结束页</label>
            <input type="number" v-model.number="extractEnd" min="1" :max="pageCount" />
          </div>
        </div>

        <div v-else class="range-inputs">
          <div class="input-group full-width">
            <label>页面范围</label>
            <input 
              type="text" 
              v-model="customRange" 
              placeholder="如: 1-3, 5, 7-10" 
            />
            <span class="hint">用逗号分隔，范围用横线连接</span>
          </div>
        </div>

        <div v-if="splitErrorMsg" class="error-msg">{{ splitErrorMsg }}</div>
        <div v-if="splitSuccessMsg" class="success-msg">{{ splitSuccessMsg }}</div>

        <button 
          class="extract-btn" 
          @click="extractPages"
          :disabled="isSplitting || (splitMode === 'extract' && !canExtract) || (splitMode === 'range' && !customRange.trim())"
        >
          <span v-if="isSplitting">处理中...</span>
          <span v-else>提取并下载</span>
        </button>
      </div>
    </div>

    <!-- 合并 -->
    <div v-else class="tab-content">
      <div class="merge-upload" @click="mergeInput?.click()">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <p>点击添加 PDF 文件</p>
        <span>可多个文件</span>
        <input
          ref="mergeInput"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          @change="handleMergeFiles"
          style="display: none"
        />
      </div>

      <div v-if="mergeFiles.length > 0" class="merge-list">
        <div v-for="(item, index) in mergeFiles" :key="index" class="merge-item">
          <div class="merge-item-info">
            <span class="merge-item-index">{{ index + 1 }}</span>
            <div class="merge-item-detail">
              <span class="merge-item-name">{{ item.name }}</span>
              <span class="merge-item-pages">{{ item.pageCount }} 页</span>
            </div>
          </div>
          <div class="merge-item-actions">
            <button @click="moveFile(index, 'up')" :disabled="index === 0" title="上移">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button @click="moveFile(index, 'down')" :disabled="index === mergeFiles.length - 1" title="下移">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button @click="removeMergeFile(index)" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="mergeErrorMsg" class="error-msg">{{ mergeErrorMsg }}</div>
      <div v-if="mergeSuccessMsg" class="success-msg">{{ mergeSuccessMsg }}</div>

      <div v-if="mergeFiles.length > 0" class="merge-actions">
        <button class="clear-btn" @click="clearMergeFiles">清空</button>
        <button 
          class="merge-btn" 
          @click="mergePDFs"
          :disabled="isMerging || mergeFiles.length < 2"
        >
          <span v-if="isMerging">合并中...</span>
          <span v-else>合并并下载</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-splitter {
  max-width: 600px;
  margin: 0 auto;
}

.tool-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.tool-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.tab-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--surface-color);
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.tab-switcher button {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-switcher button.active {
  background: var(--primary-color);
  color: white;
  font-weight: 500;
}

.tab-content {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.upload-section {
  margin-top: 2rem;
}

.upload-area, .merge-upload {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-area:hover, .merge-upload:hover {
  border-color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.05);
}

.upload-area svg, .merge-upload svg {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.upload-text, .merge-upload p {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.upload-hint, .merge-upload span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
}

.file-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.reset-btn {
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.2s, color 0.2s;
}

.reset-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.mode-selector {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.radio-label input {
  accent-color: var(--primary-color);
}

.range-inputs {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group.full-width {
  flex: 1;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.input-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-group input[type="number"] {
  width: 100px;
}

.separator {
  color: var(--text-secondary);
  padding-bottom: 0.75rem;
}

.hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.error-msg {
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #f87171;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-msg {
  color: #10b981;
  background-color: #ecfdf5;
  border: 1px solid #6ee7b7;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .error-msg {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
  .success-msg {
    background-color: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
  }
}

.extract-btn, .merge-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.extract-btn:hover:not(:disabled), .merge-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.extract-btn:active:not(:disabled), .merge-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.extract-btn:disabled, .merge-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 合并功能样式 */
.merge-upload {
  padding: 2rem;
}

.merge-list {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.merge-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.merge-item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  overflow: hidden;
}

.merge-item-index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.merge-item-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.merge-item-name {
  font-size: 0.9rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merge-item-pages {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.merge-item-actions {
  display: flex;
  gap: 0.25rem;
}

.merge-item-actions button {
  padding: 0.4rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.merge-item-actions button:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.merge-item-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.merge-actions {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  padding: 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.merge-actions .merge-btn {
  flex: 1;
}
</style>
