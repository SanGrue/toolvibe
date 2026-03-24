<script setup lang="ts">
import { ref, computed } from 'vue';
import JsonTreeNode from './JsonTreeNode.vue';

const inputJson = ref('');
const errorMsg = ref('');

const parsedJson = computed(() => {
  if (!inputJson.value.trim()) {
    errorMsg.value = '';
    return null;
  }
  try {
    const parsed = JSON.parse(inputJson.value);
    errorMsg.value = '';
    return parsed;
  } catch (e) {
    errorMsg.value = '解析失败：不是合法的 JSON 数据';
    return null;
  }
});

const pasteDemo = () => {
  inputJson.value = `{
  "projectName": "ToolVibe",
  "version": 1.0,
  "isPublic": true,
  "features": ["JSON View", "Timestamp", "UUID"],
  "author": {
    "name": "Developer",
    "contacts": {
      "email": "dev@example.com",
      "github": null
    }
  }
}`;
};
</script>

<template>
  <div class="json-viewer-container">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>JSON 层级视图器</h2>
      <p>粘贴 JSON，为您自动生成可完全收起/展开的直观层级树状图。</p>
    </div>

    <div class="editor-container">
      <!-- 左侧：输入区域 -->
      <div class="panel">
        <div class="panel-header">
          <h3>输入原始 JSON 数据</h3>
          <button @click="pasteDemo" class="btn small">测试用例</button>
        </div>
        <textarea
          v-model="inputJson"
          placeholder="在此粘贴任意标准的 JSON 报文..."
          class="json-input"
        ></textarea>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      </div>

      <!-- 右侧：树状视图区域 -->
      <div class="panel tree-panel">
        <div class="panel-header">
          <h3>可视化 JSON 视图</h3>
        </div>
        
        <div class="tree-container">
          <div v-if="parsedJson !== null" class="tree-root">
             <!-- 树结构的入口节点，没有 key，并且 isLast=true 因为它是根对象 -->
             <JsonTreeNode :data="parsedJson" :nameKey="null" :isLast="true" />
          </div>
          <div v-else class="empty-hint">请在左侧输入以查看层级视图...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-viewer-container {
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
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  height: 600px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(0,0,0,0.02);
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
}

.json-input {
  flex: 1;
  width: 100%;
  padding: 1.5rem;
  border: none;
  background: var(--surface-color);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  resize: none;
  outline: none;
}

.error {
  padding: 0.75rem 1.5rem;
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.9rem;
  border-top: 1px solid #f87171;
}

@media (prefers-color-scheme: dark) {
  .error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
  .panel-header {
    background: rgba(255,255,255,0.02);
  }
  .tree-container {
    background: #1e1e1e; /* 为右侧树状图设置黑底 */
  }
}



.tree-container {
  flex: 1;
  margin: 0;
  padding: 1.5rem;
  background: var(--bg-color);
  overflow: auto;
  border-radius: 0 0 12px 12px;
}

.tree-root {
  min-width: fit-content;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-style: italic;
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
  background: var(--border-color);
}

.btn.small {
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
}
</style>
