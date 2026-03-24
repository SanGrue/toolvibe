<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const now = ref(Date.now());
let timer: number | null = null;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 时间戳输入
const timestampInput = ref('');
const timestampUnit = ref<'秒' | '毫秒'>('秒');

// 日期时间输入
const dateInput = ref('');

// 转换结果
const convertedTimestamp = ref('');
const convertedDate = ref('');

const currentTimestamp = computed(() => Math.floor(now.value / 1000));
const currentTimestampMs = computed(() => now.value);

const currentDate = computed(() => {
  const d = new Date(now.value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${year}-${month}-${day} ${weekDays[d.getDay()]}`;
});

const currentTime = computed(() => {
  const d = new Date(now.value);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

// 将时间戳转换为日期
const timestampToDate = () => {
  const input = timestampInput.value.trim();
  if (!input) return;

  try {
    let ts = parseInt(input);
    if (isNaN(ts)) {
      convertedDate.value = '请输入有效的时间戳';
      return;
    }

    // 如果是秒级时间戳（小于10位），转换为毫秒
    if (timestampUnit.value === '秒' && ts < 10000000000) {
      ts = ts * 1000;
    }

    const date = new Date(ts);
    if (isNaN(date.getTime())) {
      convertedDate.value = '无效的时间戳';
      return;
    }

    convertedDate.value = formatDate(date);
  } catch (e) {
    convertedDate.value = '转换失败';
  }
};

// 将日期转换为时间戳
const dateToTimestamp = () => {
  const input = dateInput.value.trim();
  if (!input) return;

  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      convertedTimestamp.value = '无效的日期格式';
      return;
    }

    const ts = date.getTime();
    convertedTimestamp.value = `秒: ${Math.floor(ts / 1000)} | 毫秒: ${ts}`;
  } catch (e) {
    convertedTimestamp.value = '转换失败';
  }
};

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[date.getDay()];
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${weekDay}`;
};

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('复制失败', e);
  }
};

// 填充当前时间
const fillCurrentTimestamp = () => {
  timestampInput.value = String(currentTimestamp.value);
  timestampUnit.value = '秒';
  timestampToDate();
};

const fillCurrentDate = () => {
  const date = new Date(now.value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
</script>

<template>
  <div class="timestamp-converter">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>时间戳转换</h2>
      <p>Unix 时间戳与日期时间相互转换</p>
    </div>

    <div class="current-time">
      <div class="current-main">
        <div class="current-date">{{ currentDate }}</div>
        <div class="current-time-display">{{ currentTime }}</div>
      </div>
      <div class="current-timestamp">
        <div class="timestamp-item">
          <span class="ts-label">秒</span>
          <span class="ts-value">{{ currentTimestamp }}</span>
        </div>
        <div class="timestamp-divider"></div>
        <div class="timestamp-item">
          <span class="ts-label">毫秒</span>
          <span class="ts-value">{{ currentTimestampMs }}</span>
        </div>
      </div>
    </div>

    <div class="converter-section">
      <h3>时间戳 → 日期</h3>
      <div class="input-row">
        <input 
          type="text" 
          v-model="timestampInput" 
          placeholder="输入时间戳..." 
          @keyup.enter="timestampToDate"
        />
        <select v-model="timestampUnit">
          <option value="秒">秒</option>
          <option value="毫秒">毫秒</option>
        </select>
        <button @click="timestampToDate">转换</button>
        <button class="secondary" @click="fillCurrentTimestamp">当前时间</button>
      </div>
      <div v-if="convertedDate" class="result-row" @click="copyToClipboard(convertedDate)">
        <span class="result-label">结果:</span>
        <span class="result-value">{{ convertedDate }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </div>
    </div>

    <div class="converter-section">
      <h3>日期 → 时间戳</h3>
      <div class="input-row">
        <input 
          type="datetime-local" 
          v-model="dateInput" 
          class="datetime-input"
        />
        <button @click="dateToTimestamp">转换</button>
        <button class="secondary" @click="fillCurrentDate">当前时间</button>
      </div>
      <div v-if="convertedTimestamp" class="result-row" @click="copyToClipboard(convertedTimestamp)">
        <span class="result-label">结果:</span>
        <span class="result-value">{{ convertedTimestamp }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </div>
    </div>

    <div class="tips">
      <h4>提示</h4>
      <ul>
        <li>当前时间戳: 从 1970-01-01 00:00:00 UTC 到现在的秒数</li>
        <li>常见编程语言时间戳: JavaScript/PHP 用毫秒，Python/Go 用秒</li>
        <li>点击结果可复制到剪贴板</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.timestamp-converter {
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

.current-time {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
}

.current-main {
  margin-bottom: 0.75rem;
}

.current-date {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.current-time-display {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 2px;
}

.current-timestamp {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.timestamp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.ts-label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.ts-value {
  font-size: 0.95rem;
  font-weight: 500;
  font-family: monospace;
}

.timestamp-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.4);
}

@media (max-width: 480px) {
  .current-time-display {
    font-size: 2.2rem;
  }
  
  .current-timestamp {
    gap: 1.5rem;
  }
}

.converter-section {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.converter-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.input-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.input-row input {
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-row input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.datetime-input {
  flex: 1;
}

.input-row select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  cursor: pointer;
}

.input-row button {
  padding: 0.75rem 1.25rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.input-row button:hover {
  background-color: #2563eb;
}

.input-row button.secondary {
  background: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.input-row button.secondary:hover {
  background: var(--border-color);
}

.result-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-row:hover {
  background: rgba(16, 185, 129, 0.15);
}

.result-label {
  color: #10b981;
  font-weight: 500;
}

.result-value {
  flex: 1;
  color: var(--text-primary);
  font-family: monospace;
}

.result-row svg {
  color: var(--text-secondary);
}

.tips {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
}

.tips h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
}
</style>
