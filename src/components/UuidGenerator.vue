<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const uuidCount = ref(1);
const uuids = ref<string[]>([]);

// 兼容非 HTTPS 环境下 crypto.randomUUID 不存在的问题
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateUuids = () => {
  const results: string[] = [];
  for (let i = 0; i < uuidCount.value; i++) {
    results.push(generateUUID());
  }
  uuids.value = results;
};

const copyAll = async () => {
  if (uuids.value.length > 0) {
    await navigator.clipboard.writeText(uuids.value.join('\n'));
  }
};

const copyOne = async (uuid: string) => {
  await navigator.clipboard.writeText(uuid);
};

generateUuids();
</script>

<template>
  <div class="uuid-generator">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>UUID 生成</h2>
      <p>生成随机 UUID</p>
    </div>

    <div class="tool-container">
      <div class="options">
        <div class="option">
          <label>生成数量</label>
          <input 
            type="number" 
            v-model.number="uuidCount" 
            min="1" 
            max="100"
            class="number-input"
          />
        </div>
        <button @click="generateUuids" class="btn primary">生成</button>
      </div>

      <div class="output-section">
        <div class="output-header">
          <label>UUID 列表</label>
          <button @click="copyAll" class="btn small" v-if="uuids.length">复制全部</button>
        </div>
        <div class="uuid-list">
          <div 
            v-for="uuid in uuids" 
            :key="uuid" 
            class="uuid-item"
            @click="copyOne(uuid)"
          >
            {{ uuid }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uuid-generator {
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

.options {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option label {
  font-weight: 500;
  color: var(--text-primary);
}

.number-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 1rem;
  width: 100px;
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

.output-header label {
  font-weight: 500;
  color: var(--text-primary);
}

.uuid-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.uuid-item {
  padding: 0.75rem 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.uuid-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-color);
}
</style>
