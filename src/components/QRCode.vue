<script setup lang="ts">
import { ref, computed } from 'vue';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

const activeTab = ref<'generate' | 'decode'>('decode');

// 生成二维码
const generateText = ref('');
const generateError = ref('');
const qrCodeDataUrl = ref('');
const isGenerating = ref(false);

// 识别二维码
const decodeError = ref('');
const decodeResult = ref('');
const isDecoding = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const canGenerate = computed(() => generateText.value.trim().length > 0);

// 生成二维码
const generateQRCode = async () => {
  if (!canGenerate.value) return;
  
  isGenerating.value = true;
  generateError.value = '';
  
  try {
    const dataUrl = await QRCode.toDataURL(generateText.value, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    qrCodeDataUrl.value = dataUrl;
  } catch (e) {
    generateError.value = '生成失败: ' + (e as Error).message;
  } finally {
    isGenerating.value = false;
  }
};

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) return;
  
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = qrCodeDataUrl.value;
  link.click();
};

// 复制二维码图片
const copyQRCode = async () => {
  if (!qrCodeDataUrl.value) return;
  
  try {
    const response = await fetch(qrCodeDataUrl.value);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    alert('已复制到剪贴板');
  } catch (e) {
    alert('复制失败，请右键图片另存为');
  }
};

// 复制文本
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  } catch (e) {
    alert('复制失败');
  }
};

// 处理文件上传
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  await decodeImage(file);
};

// 处理剪贴板粘贴
const handlePaste = async () => {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          await decodeImage(blob);
          return;
        }
      }
    }
    decodeError.value = '剪贴板中没有图片';
  } catch (e) {
    decodeError.value = '读取剪贴板失败，请确保已授权权限';
  }
};

// 解码图片
const decodeImage = async (source: File | Blob) => {
  isDecoding.value = true;
  decodeError.value = '';
  decodeResult.value = '';
  
  try {
    const bitmap = await createImageBitmap(source);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建画布');
    
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      decodeResult.value = code.data;
    } else {
      decodeError.value = '未识别到二维码';
    }
  } catch (e) {
    decodeError.value = '识别失败: ' + (e as Error).message;
  } finally {
    isDecoding.value = false;
  }
};

// 清空结果
const clearResult = () => {
  decodeResult.value = '';
  decodeError.value = '';
};
</script>

<template>
  <div class="qrcode-tool">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>二维码工具</h2>
      <p>生成和识别二维码</p>
    </div>

    <div class="tab-switcher">
      <button 
        :class="{ active: activeTab === 'decode' }" 
        @click="activeTab = 'decode'"
      >
        识别二维码
      </button>
      <button 
        :class="{ active: activeTab === 'generate' }" 
        @click="activeTab = 'generate'"
      >
        生成二维码
      </button>
    </div>

    <!-- 生成二维码 -->
    <div v-if="activeTab === 'generate'" class="tab-content">
      <div class="input-section">
        <textarea 
          v-model="generateText" 
          placeholder="输入文字或链接..." 
          rows="3"
          @keydown.ctrl.enter="generateQRCode"
        ></textarea>
        <button 
          class="generate-btn" 
          @click="generateQRCode"
          :disabled="!canGenerate || isGenerating"
        >
          {{ isGenerating ? '生成中...' : '生成二维码' }}
        </button>
      </div>

      <div v-if="generateError" class="error-msg">{{ generateError }}</div>

      <div v-if="qrCodeDataUrl" class="qr-result">
        <img :src="qrCodeDataUrl" alt="二维码" class="qr-image" />
        <div class="qr-actions">
          <button @click="downloadQRCode" class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载
          </button>
          <button @click="copyQRCode" class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制
          </button>
        </div>
      </div>
    </div>

    <!-- 识别二维码 -->
    <div v-else class="tab-content">
      <div class="decode-options">
        <button @click="fileInput?.click()" class="decode-option-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          上传图片
        </button>
        <button @click="handlePaste" class="decode-option-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          剪贴板粘贴
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
      </div>

      <div v-if="isDecoding" class="decoding">
        识别中...
      </div>

      <div v-if="decodeError" class="error-msg">{{ decodeError }}</div>

      <div v-if="decodeResult" class="decode-result">
        <div class="result-label">识别结果：</div>
        <div class="result-content">
          <a v-if="decodeResult.startsWith('http')" :href="decodeResult" target="_blank" class="result-link">
            {{ decodeResult }}
          </a>
          <span v-else>{{ decodeResult }}</span>
        </div>
        <div class="result-actions">
          <button @click="copyText(decodeResult)" class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制
          </button>
          <button @click="clearResult" class="action-btn secondary">
            清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qrcode-tool {
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

.tab-switcher button:hover:not(.active) {
  background: var(--hover-color);
}

.tab-content {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.input-section textarea:focus {
  border-color: var(--primary-color);
}

.generate-btn {
  padding: 0.85rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: #2563eb;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .error-msg {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
}

.qr-result {
  margin-top: 1.5rem;
  text-align: center;
}

.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.secondary:hover {
  background: var(--hover-color);
}

.decode-options {
  display: flex;
  gap: 1rem;
}

.decode-option-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: var(--bg-color);
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.decode-option-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.decoding {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.decode-result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
}

.result-label {
  font-size: 0.85rem;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.result-content {
  word-break: break-all;
  margin-bottom: 1rem;
}

.result-link {
  color: var(--primary-color);
  text-decoration: none;
}

.result-link:hover {
  text-decoration: underline;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
