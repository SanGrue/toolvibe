<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const inputJson = ref('');
const outputJson = ref('');
const errorMsg = ref('');

const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(parsed, null, 2);
    errorMsg.value = '';
  } catch (e) {
    errorMsg.value = 'JSON 格式不正确';
    outputJson.value = '';
  }
};

const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(parsed);
    errorMsg.value = '';
  } catch (e) {
    errorMsg.value = 'JSON 格式不正确';
    outputJson.value = '';
  }
};

const copyResult = async () => {
  if (outputJson.value) {
    await navigator.clipboard.writeText(outputJson.value);
  }
};
</script>

<template>
  <div class="json-formatter">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>JSON 格式化</h2>
      <p>在线美化和校验 JSON 数据</p>
    </div>

    <div class="editor-container">
      <div class="input-section">
        <h3>输入 JSON</h3>
        <textarea
          v-model="inputJson"
          placeholder="请输入 JSON 字符串..."
          class="json-input"
        ></textarea>
      </div>

      <div class="actions">
        <button @click="formatJson" class="btn primary">格式化</button>
        <button @click="minifyJson" class="btn">压缩</button>
      </div>

      <div class="output-section">
        <div class="output-header">
          <h3>输出结果</h3>
          <button @click="copyResult" class="btn small" v-if="outputJson">复制</button>
        </div>
        <pre v-if="outputJson" class="json-output">{{ outputJson }}</pre>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-formatter {
  max-width: 1200px;
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

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section h3,
.output-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.json-input {
  width: 100%;
  height: 200px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.json-output {
  padding: 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 0.5rem;
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

.btn.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.error {
  color: #ef4444;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}
</style>
