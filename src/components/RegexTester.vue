<script setup lang="ts">
import { ref, computed } from 'vue';

const pattern = ref('([A-Z])\\w+');
const flags = ref('g');
const testString = ref('Hello World! This is a Regex expression Tester for ToolVibe.');

const commonExamples = [
  { name: '邮箱 Email', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b', test: '可以从文本中提取：\n例如联系 admin@toolvibe.dev，或 test.user_123@sub.domain.org\n无效的如 admin@.com 不会匹配' },
  { name: '中国手机号', pattern: '\\b1[3-9]\\d{9}\\b', test: '文本捕获测试：\n正确的手机号：13812345678，也可以在句子里 15900000000 抓到。\n错误的 12812345678 不会抓到。' },
  { name: '网址 URL', pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)', test: '项目主页: https://github.com/SanGrue/toolvibe\n本地测试: http://localhost:5173\n非链接文字会被忽略。' },
  { name: 'IPv4 地址', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', test: '本地回环：127.0.0.1\n网关：192.168.1.1\n广播：255.255.255.255' },
  { name: '提取中文字符', pattern: '[\\u4e00-\\u9fa5]+', test: 'Hello 大家好，这是【ToolVibe】前端工具箱！Regex Tester 123。' },
  { name: '提取 HTML 标签', pattern: '<([a-z]+)(?:[^>]+)?>.*?<\\/\\1>|<[^>]+>', test: '这是一个 <a href="https://example.com">链接</a>。\n包含段落的 <p class="red">你好</p> 文本。' },
];

const loadExample = (item: any) => {
  pattern.value = item.pattern;
  flags.value = 'gm';
  testString.value = item.test;
};

const matchResult = computed(() => {
  if (!pattern.value) return { html: testString.value || ' ' };
  
  try {
    // 强制转换为合法的 flag，容错处理
    const safeFlags = flags.value.replace(/[^gimsuy]/g, '');
    const rx = new RegExp(pattern.value, safeFlags);
    let html = testString.value || ' ';
    const matchesArray = [];
    
    if (!rx.global) {
      // 非全局匹配只匹配一次
      const m = testString.value.match(rx);
      if (m && m[0]) {
        // 利用 replace 加上标签，但不用全部替换
        html = testString.value.replace(rx, '<mark>$&</mark>');
        matchesArray.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
    } else {
      // 如果加了 g (全局) 或者是其它，可以使用 matchAll (要求 Node/现代浏览器)
      const matches = [...testString.value.matchAll(rx)];
      html = testString.value.replace(rx, '<mark>$&</mark>');
      for (const m of matches) {
        matchesArray.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
    }
    
    return {
      html,
      count: matchesArray.length,
      matches: matchesArray
    };
  } catch (e) {
    return { error: '⚠️ 正则表达式语法错误：' + (e as Error).message };
  }
});
</script>

<template>
  <div class="regex-tester">
    <div class="tool-header">
      <router-link to="/" class="back-link">← 返回主页</router-link>
      <h2>正则表达式测试台</h2>
      <p>编写与调试复杂的正则表达式逻辑，即刻在测试文本中获得高亮结果与正则捕获组。</p>
    </div>

    <div class="editor-container">
      <div class="input-area">
        <div class="section-header">
          <label class="section-label">正则表达式 (Regular Expression)</label>
          <div class="example-buttons">
            <button v-for="(ex, index) in commonExamples" :key="index" @click="loadExample(ex)" class="ex-btn">{{ ex.name }}</button>
          </div>
        </div>
        <div class="regex-input-group">
          <span class="slash">/</span>
          <input v-model="pattern" class="regex-input" placeholder="在此输入正则模式, 例如 \d+" spellcheck="false" />
          <span class="slash">/</span>
          <input v-model="flags" class="flags-input" placeholder="gmi" spellcheck="false" />
        </div>
        
        <label class="section-label string-label">测试文本 (Test String)</label>
        <textarea v-model="testString" class="test-textarea" placeholder="在此处键入待测试的内容..." spellcheck="false"></textarea>
      </div>

      <div class="result-area">
        <div class="panel-header">
          <h3>捕获结果 (Matches)</h3>
          <span v-if="matchResult.count !== undefined" class="badge" :class="{'no-match': matchResult.count === 0}">
            共 {{ matchResult.count }} 处匹配
          </span>
        </div>
        
        <!-- 高亮文本结果区域 -->
        <div v-if="matchResult.error" class="error">{{ matchResult.error }}</div>
        <div class="highlight-wrapper">
          <div class="highlight-box" v-html="matchResult.html"></div>
        </div>
        
        <!-- List of exact captures -->
        <div v-if="matchResult.matches?.length" class="matches-list">
          <div v-for="(m, idx) in matchResult.matches" :key="idx" class="match-item">
            <div class="match-row">
               <span class="match-idx"># {{ idx + 1 }}</span>
               <span class="match-text">{{ m.match }}</span>
               <span class="match-pos">索引位置: {{ m.index }}</span>
            </div>
            <div v-if="m.groups.length > 0" class="groups">
              <div v-for="(g, gIdx) in m.groups" :key="gIdx" class="group-item">
                 <span class="group-badge">Group {{ gIdx + 1 }}</span> "{{ g }}"
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!matchResult.error" class="empty-hint">暂未发生匹配，继续修改上方模式吧...</div>
      </div>
    </div>

    <div class="cheat-sheet">
      <div class="panel-header">
        <h3>常用正则速查表 (Cheat Sheet)</h3>
      </div>
      <div class="cheat-grid">
        <div class="cheat-col">
          <h4>字符匹配 (Characters)</h4>
          <ul>
            <li><code>.</code><span>任意单字符</span></li>
            <li><code>\w</code><span>字母数字下划线</span></li>
            <li><code>\d</code><span>任意数字 [0-9]</span></li>
            <li><code>\s</code><span>任意空白符</span></li>
            <li><code>\W</code><span>非单词字符</span></li>
            <li><code>\D</code><span>非数字字符</span></li>
          </ul>
        </div>
        <div class="cheat-col">
          <h4>重复量词 (Quantifiers)</h4>
          <ul>
            <li><code>*</code><span>0 次或多次 (零到多)</span></li>
            <li><code>+</code><span>1 次或多次 (一到多)</span></li>
            <li><code>?</code><span>0 次或 1 次 (可有可无)</span></li>
            <li><code>{n}</code><span>正好匹配 n 次</span></li>
            <li><code>{n,}</code><span>至少匹配 n 次</span></li>
            <li><code>{n,m}</code><span>匹配 n 到 m 次</span></li>
          </ul>
        </div>
        <div class="cheat-col">
          <h4>位置边界 (Anchors)</h4>
          <ul>
            <li><code>^</code><span>字符串开始处</span></li>
            <li><code>$</code><span>字符串结束处</span></li>
            <li><code>\b</code><span>单词边界</span></li>
            <li><code>\B</code><span>非单词边界</span></li>
            <li><code>(?=a)</code><span>正向先行断言</span></li>
            <li><code>(?!a)</code><span>负向先行断言</span></li>
          </ul>
        </div>
        <div class="cheat-col">
          <h4>分组与集合 (Groups)</h4>
          <ul>
            <li><code>(abc)</code><span>捕获分组</span></li>
            <li><code>(?:abc)</code><span>非捕获分组</span></li>
            <li><code>[A-Z]</code><span>字符集合 (区间)</span></li>
            <li><code>[^A-Z]</code><span>非字符集合</span></li>
            <li><code>a|b</code><span>逻辑或 (Or)</span></li>
            <li><code>\1</code><span>反向引用分组 1</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.regex-tester { max-width: 1200px; margin: 0 auto; }
.tool-header { margin-bottom: 1.5rem; }
.back-link { display: inline-block; margin-bottom: 1rem; color: var(--primary-color); font-weight: 500; text-decoration: none; }
.back-link:hover { text-decoration: underline; }

.editor-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: stretch;}
@media (max-width: 768px) { .editor-container { grid-template-columns: 1fr; } }

.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem;}
.section-label { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); display: block; text-transform: uppercase;}
.string-label { margin-top: 1.5rem; margin-bottom: 0.75rem; }

.example-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.ex-btn { padding: 0.2rem 0.5rem; border: 1px solid var(--border-color); background: var(--surface-color); color: var(--text-secondary); border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
.ex-btn:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: #3b82f6;}

.regex-input-group { display: flex; align-items: center; background: var(--surface-color); border: 2px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; font-size: 1.3rem; font-family: 'Consolas', monospace; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.05);}
.regex-input-group:focus-within { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);}
.slash { color: var(--text-secondary); font-weight: bold; user-select: none; }
.regex-input { flex: 1; border: none; background: transparent; outline: none; color: #e06c75; font-size: inherit; font-family: inherit; margin: 0 0.5rem; width: 100%;}
.flags-input { width: 50px; border: none; background: transparent; outline: none; color: #56b6c2; font-size: inherit; font-family: inherit; margin-left: 0.5rem; letter-spacing: 1px;}
@media (prefers-color-scheme: light) { .regex-input { color: #d14; } .flags-input { color: #0000ff; } }

.test-textarea { width: 100%; height: calc(100% - 200px); min-height: 350px; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--surface-color); color: var(--text-primary); font-family: monospace; font-size: 15px; resize: vertical; outline: none; line-height: 1.5; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);}
.test-textarea:focus { border-color: var(--primary-color); }

.result-area { display: flex; flex-direction: column; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; height: 100%; min-height: 520px;}
.panel-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--border-color); align-items: center; }
.panel-header h3 { font-size: 1rem; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;}
.badge { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; border: 1px solid #10b981;}
.badge.no-match { background: rgba(107, 114, 128, 0.1); color: #6b7280; border-color: #9ca3af; }
.error { padding: 1rem; margin: 1.5rem; background: #fef2f2; color: #ef4444; border-radius: 8px; border: 1px solid #f87171; font-weight: 500;}

.highlight-wrapper { border-bottom: 1px solid var(--border-color); background: var(--bg-color); }
.highlight-box { padding: 1.5rem; font-family: monospace; font-size: 15px; white-space: pre-wrap; word-break: break-all; min-height: 150px; color: var(--text-primary); line-height: 1.5;}
:deep(mark) { background-color: rgba(59, 130, 246, 0.35); color: var(--text-primary); padding: 0.1rem 0; border-radius: 2px; border-bottom: 2px solid #3b82f6;}

.matches-list { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; background: var(--surface-color);}
.match-item { background: var(--bg-color); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); font-family: monospace; font-size: 14px;}
.match-row { display: flex; align-items: center;}
.match-idx { color: var(--text-secondary); margin-right: 1rem; font-weight: bold; width: 35px;}
.match-text { color: #98c379; background: rgba(0,0,0,0.15); padding: 0.2rem 0.6rem; border-radius: 4px; margin-right: auto;}
.match-pos { color: var(--text-secondary); font-size: 12px; background: rgba(0,0,0,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);}

.groups { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.5rem;}
.group-item { display: flex; align-items: center; gap: 0.75rem; }
.group-badge { font-size: 11px; background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 0.1rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: bold;}

@media (prefers-color-scheme: light) { 
  .match-text { color: #098658; background: rgba(0,0,0,0.05); } 
}
.empty-hint { display: flex; align-items: center; justify-content: center; height: 150px; color: var(--text-secondary); font-style: italic;}

.cheat-sheet { margin-top: 1.5rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
.cheat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; padding: 1.5rem; }
@media (max-width: 900px) { .cheat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .cheat-grid { grid-template-columns: 1fr; } }
.cheat-col h4 { margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--text-primary); border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;}
.cheat-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;}
.cheat-col li { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;}
.cheat-col code { background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: 'Consolas', monospace; font-size: 0.9rem; font-weight: bold;}
.cheat-col span { color: var(--text-secondary); text-align: right;}
</style>
