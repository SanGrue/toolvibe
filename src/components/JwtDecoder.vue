<script setup lang="ts">
import { ref, computed } from 'vue';

const inputJwt = ref('');

const decoded = computed(() => {
  const token = inputJwt.value.trim();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return { error: '无效的 JWT 格式（需要 header.payload.signature 三部分）' };
  
  const decodeBase64Url = (str: string) => {
    try {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = str.length % 4;
      if (pad) str += new Array(5 - pad).join('=');
      // 避免中文字符解码错误
      return decodeURIComponent(escape(atob(str)));
    } catch(e) {
      return null;
    }
  };
  
  const headerStr = decodeBase64Url(parts[0]);
  const payloadStr = decodeBase64Url(parts[1]);
  
  if (!headerStr || !payloadStr) return { error: '解析 Base64 失败，Token 可能已损坏' };
  
  try {
    return {
      header: JSON.stringify(JSON.parse(headerStr), null, 2),
      payload: JSON.stringify(JSON.parse(payloadStr), null, 2),
      signature: parts[2]
    };
  } catch (e) {
    return { error: '解析 JSON 对象失败' };
  }
});

const loadDemo = () => {
  inputJwt.value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcm9udGVuZC1kZXYiLCJuYW1lIjoiVG9vbFZpYmUgVXNlciIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
};
</script>

<template>
  <div class="jwt-decoder">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>JWT 解析器</h2>
      <p>完全在本地安全地解码、验证 JSON Web Token 数据，不会向远端发生任何敏感传输。</p>
    </div>

    <div class="container">
      <div class="panel">
        <div class="panel-header">
          <h3>Encoded Token (输入原始 JWT)</h3>
          <button @click="loadDemo" class="btn small">测试用例</button>
        </div>
        <!-- 以常见的高亮形式暗示由三部分组成，但此处使用简易纯文本 -->
        <textarea v-model="inputJwt" class="jwt-input" placeholder="在此粘贴您的 eyJ..."></textarea>
      </div>

      <div class="panel output-panel">
        <div class="panel-header">
          <h3>Decoded (解析结果)</h3>
        </div>
        <div v-if="decoded?.error" class="error-msg">{{ decoded.error }}</div>
        <div v-else-if="decoded" class="result">
          <div class="section">
            <span class="badger header-badge">Header : Algorithm & Type</span>
            <pre class="json-code header-code">{{ decoded.header }}</pre>
          </div>
          <div class="section">
            <span class="badger payload-badge">Payload : Data</span>
            <pre class="json-code payload-code">{{ decoded.payload }}</pre>
          </div>
          <div class="section">
            <span class="badger signature-badge">Signature (Secret部分防篡改展示)</span>
            <div class="signature-text">{{ decoded.signature }}</div>
          </div>
        </div>
        <div v-else class="empty-hint">等待粘贴有效 JWT ...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jwt-decoder { max-width: 1200px; margin: 0 auto; }
.tool-header { margin-bottom: 1.5rem; }
.back-link { display: inline-block; margin-bottom: 1rem; color: var(--primary-color); font-weight: 500; text-decoration: none; }
.back-link:hover { text-decoration: underline; }
.container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .container { grid-template-columns: 1fr; } }
.panel { display: flex; flex-direction: column; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; height: 650px; }
.panel-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--border-color); align-items: center; }
.panel-header h3 { font-size: 0.95rem; margin: 0; color: var(--text-primary); text-transform: uppercase; font-weight: 600;}
.jwt-input { flex: 1; padding: 1.5rem; border: none; background: transparent; color: #fb923c; font-family: monospace; font-size: 16px; resize: none; outline: none; word-break: break-all; line-height: 1.6;}
.output-panel { background: var(--bg-color); }
.empty-hint { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-style: italic; }
.error-msg { padding: 1rem; margin: 1rem; background: #fef2f2; color: #ef4444; border-radius: 8px; border: 1px solid #f87171; }
.result { display: flex; flex-direction: column; padding: 1.5rem; gap: 1.25rem; overflow-y: auto; height: 100%; }
.section { display: flex; flex-direction: column; gap: 0.5rem; }
.badger { font-size: 0.75rem; font-weight: bold; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 4px; display: inline-block; width: fit-content; letter-spacing: 0.5px;}

.header-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.header-code { border-left: 3px solid #ef4444 !important; }

.payload-badge { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.payload-code { border-left: 3px solid #a855f7 !important; color: #a855f7 !important; }

.signature-badge { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.signature-text { padding: 1rem; background: var(--surface-color); border: 1px solid var(--border-color); font-family: monospace; word-break: break-all; color: #3b82f6; border-radius: 8px; border-left: 3px solid #3b82f6;}

.json-code { margin: 0; padding: 1rem; background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-primary); font-family: Consolas, monospace; border-radius: 8px; font-size: 14px;}
.btn { padding: 0.35rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--surface-color); color: var(--text-primary); cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
.btn:hover { background: var(--border-color); }
@media (prefers-color-scheme: light) {
  .header-code { color: #d14; }
  .payload-code { color: #6f42c1 !important; }
}
</style>
