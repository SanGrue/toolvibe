<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const inputSql = ref('');
const outputSql = ref('');
const errorMsg = ref('');

const formatSql = () => {
  if (!inputSql.value.trim()) {
    errorMsg.value = '请输入 SQL 语句';
    return;
  }
  // 简单的 SQL 格式化
  let sql = inputSql.value;
  
  // 关键字大写
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sql = sql.replace(regex, keyword);
  });
  
  // 换行处理
  sql = sql.replace(/\s+/g, ' ');
  sql = sql.replace(/\s*,\s*/g, ',\n  ');
  sql = sql.replace(/\s*(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT)\s*/gi, '\n$1 ');
  sql = sql.trim();
  
  outputSql.value = sql;
  errorMsg.value = '';
};

const copyResult = async () => {
  if (outputSql.value) {
    await navigator.clipboard.writeText(outputSql.value);
  }
};
</script>

<template>
  <div class="sql-formatter">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>SQL 格式化</h2>
      <p>在线美化 SQL 语句</p>
    </div>

    <div class="editor-container">
      <div class="input-section">
        <h3>输入 SQL</h3>
        <textarea
          v-model="inputSql"
          placeholder="请输入 SQL 语句..."
          class="sql-input"
        ></textarea>
      </div>

      <div class="actions">
        <button @click="formatSql" class="btn primary">格式化</button>
      </div>

      <div class="output-section">
        <div class="output-header">
          <h3>输出结果</h3>
          <button @click="copyResult" class="btn small" v-if="outputSql">复制</button>
        </div>
        <pre v-if="outputSql" class="sql-output">{{ outputSql }}</pre>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sql-formatter {
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

.sql-input {
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

.sql-output {
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
