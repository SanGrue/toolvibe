<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const inputText = ref('');
const outputHash = ref('');
const algorithm = ref('SHA-256');

const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const generateHash = async () => {
  if (!inputText.value) {
    outputHash.value = '';
    return;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(inputText.value);
  
  const hashBuffer = await crypto.subtle.digest(algorithm.value, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  outputHash.value = hashHex;
};

const copyResult = async () => {
  if (outputHash.value) {
    await navigator.clipboard.writeText(outputHash.value);
  }
};
</script>

<template>
  <div class="hash-generator">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>哈希摘要</h2>
      <p>计算文本的 MD5、SHA 等哈希值</p>
    </div>

    <div class="tool-container">
      <div class="input-section">
        <label>算法</label>
        <select v-model="algorithm" class="select">
          <option v-for="alg in algorithms" :key="alg" :value="alg">{{ alg }}</option>
        </select>
      </div>

      <div class="input-section">
        <label>输入文本</label>
        <textarea
          v-model="inputText"
          placeholder="请输入需要生成哈希的文本..."
          class="text-input"
          @input="generateHash"
        ></textarea>
      </div>

      <div class="output-section">
        <div class="output-header">
          <label>哈希结果</label>
          <button @click="copyResult" class="btn small" v-if="outputHash">复制</button>
        </div>
        <div v-if="outputHash" class="hash-output">{{ outputHash }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hash-generator {
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

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-section label,
.output-section label {
  font-weight: 500;
  color: var(--text-primary);
}

.select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 1rem;
}

.text-input {
  width: 100%;
  height: 120px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hash-output {
  padding: 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-all;
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
</style>
