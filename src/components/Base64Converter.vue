<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const inputText = ref('');
const outputText = ref('');
const mode = ref('encode');
const errorMsg = ref('');

const convert = () => {
  errorMsg.value = '';
  try {
    if (mode.value === 'encode') {
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)));
    } else {
      outputText.value = decodeURIComponent(escape(atob(inputText.value)));
    }
  } catch (e) {
    errorMsg.value = mode.value === 'decode' ? 'Base64 格式不正确' : '编码失败';
    outputText.value = '';
  }
};

const copyResult = async () => {
  if (outputText.value) {
    await navigator.clipboard.writeText(outputText.value);
  }
};

const swap = () => {
  inputText.value = outputText.value;
  outputText.value = '';
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
};
</script>

<template>
  <div class="base64-converter">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>Base64 编解码</h2>
      <p>文本和 Base64 相互转换</p>
    </div>

    <div class="tool-container">
      <div class="mode-switch">
        <button 
          :class="['mode-btn', { active: mode === 'encode' }]"
          @click="mode = 'encode'; convert()"
        >
          编码
        </button>
        <button 
          :class="['mode-btn', { active: mode === 'decode' }]"
          @click="mode = 'decode'; convert()"
        >
          解码
        </button>
      </div>

      <div class="input-section">
        <label>{{ mode === 'encode' ? '原始文本' : 'Base64 字符串' }}</label>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encode' ? '请输入需要编码的文本...' : '请输入 Base64 字符串...'"
          class="text-input"
          @input="convert"
        ></textarea>
      </div>

      <div class="swap-btn">
        <button @click="swap" class="btn">⇅ 交换</button>
      </div>

      <div class="output-section">
        <div class="output-header">
          <label>{{ mode === 'encode' ? 'Base64 结果' : '解码结果' }}</label>
          <button @click="copyResult" class="btn small" v-if="outputText">复制</button>
        </div>
        <pre v-if="outputText" class="output-text">{{ outputText }}</pre>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base64-converter {
  max-width: 800px;
  margin: 0 auto;
}

.tool-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
}

.back-link:hover {
  text-decoration: underline;
}

.tool-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-switch {
  display: flex;
  gap: 0.5rem;
}

.mode-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-section label,
.output-section label {
  font-weight: 500;
  color: var(--text-primary);
}

.text-input,
.output-text {
  width: 100%;
  height: 150px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.output-text {
  overflow-x: auto;
  white-space: pre-wrap;
}

.swap-btn {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--bg-color);
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error {
  color: #ef4444;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}
</style>
