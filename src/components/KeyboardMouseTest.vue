<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, triggerRef } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const keysPressed = ref<Set<string>>(new Set());
const mouseButtons = ref<{ left: boolean; middle: boolean; right: boolean }>({
  left: false,
  middle: false,
  right: false
});
const mousePosition = ref({ x: 0, y: 0 });
const isPageFocused = ref(false);

// 键盘键位映射 - 使用 e.code
const keyboardRows = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ControlRight']
];

// e.code 到显示名称的映射
const codeToDisplay: Record<string, string> = {
  'Escape': 'Esc',
  'Backquote': '`',
  'Digit1': '1',
  'Digit2': '2',
  'Digit3': '3',
  'Digit4': '4',
  'Digit5': '5',
  'Digit6': '6',
  'Digit7': '7',
  'Digit8': '8',
  'Digit9': '9',
  'Digit0': '0',
  'Minus': '-',
  'Equal': '=',
  'Backspace': 'Back',
  'Tab': 'Tab',
  'KeyQ': 'Q',
  'KeyW': 'W',
  'KeyE': 'E',
  'KeyR': 'R',
  'KeyT': 'T',
  'KeyY': 'Y',
  'KeyU': 'U',
  'KeyI': 'I',
  'KeyO': 'O',
  'KeyP': 'P',
  'BracketLeft': '[',
  'BracketRight': ']',
  'Backslash': '\\',
  'CapsLock': 'Caps',
  'KeyA': 'A',
  'KeyS': 'S',
  'KeyD': 'D',
  'KeyF': 'F',
  'KeyG': 'G',
  'KeyH': 'H',
  'KeyJ': 'J',
  'KeyK': 'K',
  'KeyL': 'L',
  'Semicolon': ';',
  'Quote': "'",
  'Enter': 'Enter',
  'ShiftLeft': '⇧',
  'ShiftRight': '⇧',
  'KeyZ': 'Z',
  'KeyX': 'X',
  'KeyC': 'C',
  'KeyV': 'V',
  'KeyB': 'B',
  'KeyN': 'N',
  'KeyM': 'M',
  'Comma': ',',
  'Period': '.',
  'Slash': '/',
  'ControlLeft': 'Ctrl',
  'ControlRight': 'Ctrl',
  'MetaLeft': 'Win',
  'MetaRight': 'Win',
  'AltLeft': 'Alt',
  'AltRight': 'Alt',
  'Space': 'Space',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→'
};

const getKeyDisplay = (code: string): string => {
  return codeToDisplay[code] || code;
};

const isKeyPressed = (code: string): boolean => {
  // 处理某些浏览器code为空的情况，使用key + location组合
  if (!code) return false;
  return keysPressed.value.has(code);
};

// 使用 key + location 作为备选key
const getKeyIdentifier = (e: KeyboardEvent): string => {
  if (e.code) return e.code;
  // 对于code为空的情况，使用location区分左右
  // location: 1=左修饰键, 2=右修饰键, 0=标准键
  if (e.key === 'Shift') {
    // 某些浏览器code为空时，location可能是0
    // 当code为空时，假设按的是右Shift（因为左Shift通常有code）
    return 'ShiftRight';
  }
  if (e.key === 'Control') {
    return 'ControlRight';
  }
  if (e.key === 'Alt') {
    return 'AltRight';
  }
  if (e.key === 'Meta') {
    return 'MetaRight';
  }
  return e.key;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.repeat) return;
  isPageFocused.value = true;
  
  const keyId = getKeyIdentifier(e);
  
  // 阻止浏览器默认快捷键行为 (F1-F12, Ctrl+xxx, Alt+xxx)
  const isCtrl = e.ctrlKey;
  const isAlt = e.altKey;
  const isShift = e.shiftKey;
  
  // 需要阻止的快捷键：所有F键 + 常用Ctrl/Alt组合 + 特殊键
  const shouldPrevent = 
    // F1-F12 所有功能键
    e.key.startsWith('F') ||
    // Tab 切换焦点
    e.key === 'Tab' ||
    // Alt 激活菜单
    isAlt ||
    // Ctrl+S 保存
    (isCtrl && e.key === 's') ||
    // Ctrl+W 关闭标签
    (isCtrl && e.key === 'w') ||
    // Ctrl+N 新建窗口
    (isCtrl && e.key === 'n') ||
    // Ctrl+T 新建标签
    (isCtrl && e.key === 't') ||
    // Ctrl+R 刷新
    (isCtrl && e.key === 'r') ||
    // Ctrl+Shift+I 开发者工具
    (isCtrl && isShift && e.key === 'I') ||
    // Ctrl+Shift+J 控制台
    (isCtrl && isShift && e.key === 'J') ||
    // Ctrl+Shift+Delete 清除缓存
    (isCtrl && isShift && e.key === 'Delete') ||
    // Ctrl+P 打印
    (isCtrl && e.key === 'p') ||
    // Ctrl+U 查看源代码
    (isCtrl && e.key === 'u') ||
    // Ctrl+D 书签
    (isCtrl && e.key === 'd') ||
    // Ctrl+F 查找
    (isCtrl && e.key === 'f') ||
    // Ctrl+H 历史记录
    (isCtrl && e.key === 'h') ||
    // Ctrl+J 下载
    (isCtrl && e.key === 'j') ||
    // Ctrl+L 地址栏
    (isCtrl && e.key === 'l') ||
    // Ctrl+Tab 切换标签
    (isCtrl && e.key === 'Tab') ||
    // Ctrl+PageUp/PageDown
    (isCtrl && (e.key === 'PageUp' || e.key === 'PageDown')) ||
    // Alt+Left/Right 前进后退
    (isAlt && (e.key === 'Left' || e.key === 'Right')) ||
    // Alt+F4 关闭窗口
    (isAlt && e.key === 'F4') ||
    // Ctrl+Alt 组合 (防止切换输入法等)
    (isCtrl && isAlt);
  
  if (shouldPrevent) {
    e.preventDefault();
  }
  
  keysPressed.value.add(keyId);
  triggerRef(keysPressed);
};

const handleKeyUp = (e: KeyboardEvent) => {
  const keyId = getKeyIdentifier(e);
  keysPressed.value.delete(keyId);
  triggerRef(keysPressed);
};

const handleSectionClick = () => {
  isPageFocused.value = true;
};

const handleMouseMove = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const testArea = target.closest('.mouse-test-area');
  if (testArea) {
    const rect = testArea.getBoundingClientRect();
    mousePosition.value = {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    };
  }
};

const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) mouseButtons.value.left = true;
  if (e.button === 1) mouseButtons.value.middle = true;
  if (e.button === 2) mouseButtons.value.right = true;
};

const handleMouseUp = (e: MouseEvent) => {
  if (e.button === 0) mouseButtons.value.left = false;
  if (e.button === 1) mouseButtons.value.middle = false;
  if (e.button === 2) mouseButtons.value.right = false;
};

const handleContextMenu = (e: Event) => {
  e.preventDefault();
};

const clearAll = () => {
  keysPressed.value.clear();
  triggerRef(keysPressed);
  mouseButtons.value = { left: false, middle: false, right: false };
};

// 统计
const pressedCount = computed(() => keysPressed.value.size);
const activeButtons = computed(() => {
  const count = (mouseButtons.value.left ? 1 : 0) + 
                (mouseButtons.value.middle ? 1 : 0) + 
                (mouseButtons.value.right ? 1 : 0);
  return count;
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', () => {
    keysPressed.value.clear();
    triggerRef(keysPressed);
    isPageFocused.value = false;
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<template>
  <div class="keyboard-mouse-test">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>键盘鼠标测试</h2>
      <p>按下键盘按键或点击测试区域，查看按键是否正常工作</p>
    </div>

    <!-- 鼠标测试区 -->
    <div class="mouse-test-section">
      <h3>鼠标测试</h3>
      <div 
        class="mouse-test-area" 
        @mousemove="handleMouseMove"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @contextmenu="handleContextMenu"
      >
        <div class="mouse-cursor" :style="{ left: mousePosition.x + 'px', top: mousePosition.y + 'px' }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4l16 6-6 2-2 6z"/>
          </svg>
        </div>
        <div class="mouse-pos">{{ mousePosition.x }}, {{ mousePosition.y }}</div>
      </div>
      <div class="mouse-visual">
        <div class="mouse-icon" :class="{ active: mouseButtons.left }">
          <span>左键</span>
        </div>
        <div class="mouse-icon middle" :class="{ active: mouseButtons.middle }">
          <span>滚轮</span>
        </div>
        <div class="mouse-icon right" :class="{ active: mouseButtons.right }">
          <span>右键</span>
        </div>
      </div>
      <p class="test-hint">点击测试区域测试鼠标，位置坐标会实时显示</p>
    </div>

    <!-- 键盘测试区 -->
    <div class="keyboard-test-section" @click="handleSectionClick">
      <div v-if="!isPageFocused" class="focus-hint">请点击此区域激活键盘测试</div>
      <h3>键盘测试</h3>
      <div class="keyboard-container" tabindex="0">
        <div v-for="(row, rowIndex) in keyboardRows" :key="rowIndex" class="keyboard-row">
          <div 
            v-for="key in row" 
            :key="key" 
            class="key" 
            :class="{ pressed: isKeyPressed(key), wide: key === 'Space' || key === 'Backspace' || key === 'Tab' || key === 'CapsLock' || key === 'Enter' || key === 'ShiftLeft' || key === 'ShiftRight' || key === 'ControlLeft' || key === 'ControlRight' || key === 'MetaLeft' || key === 'MetaRight' || key === 'AltLeft' || key === 'AltRight' }"
          >
            {{ getKeyDisplay(key) }}
          </div>
        </div>
      </div>
      <div class="keyboard-stats">
        <span>当前按下: {{ pressedCount }} 个键</span>
        <button @click="clearAll" class="clear-btn">清除</button>
      </div>
      <p class="test-hint">在页面任意位置按下键盘按键，键盘图上会高亮显示</p>
    </div>

    <!-- 测试结果 -->
    <div class="test-result">
      <div class="result-item" :class="{ pass: pressedCount > 0 }">
        <span class="result-label">键盘</span>
        <span class="result-value">{{ pressedCount > 0 ? '正常' : '未测试' }}</span>
      </div>
      <div class="result-item" :class="{ pass: activeButtons > 0 }">
        <span class="result-label">鼠标</span>
        <span class="result-value">{{ activeButtons > 0 ? '正常' : '未测试' }}</span>
      </div>
      <div class="result-item pass">
        <span class="result-label">状态</span>
        <span class="result-value">可用</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard-mouse-test {
  max-width: 900px;
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

/* 鼠标测试区 */
.mouse-test-section {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.mouse-test-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.mouse-test-area {
  height: 180px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  position: relative;
  cursor: crosshair;
  overflow: hidden;
}

.mouse-cursor {
  position: absolute;
  pointer-events: none;
  color: #00ff88;
  transform: translate(-2px, -2px);
  transition: left 0.05s, top 0.05s;
}

.mouse-pos {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  font-size: 0.85rem;
}

.mouse-visual {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
}

.mouse-icon {
  padding: 0.75rem 1.5rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.1s;
}

.mouse-icon.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: scale(0.95);
}

.mouse-icon.middle {
  border-radius: 20px;
}

.mouse-icon.right {
  border-radius: 8px 8px 20px 8px;
}

.test-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 1rem;
}

/* 键盘测试区 */
.keyboard-test-section {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.keyboard-test-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.focus-hint {
  text-align: center;
  padding: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .focus-hint {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
}

.keyboard-container {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.keyboard-row {
  display: flex;
  gap: 6px;
}

.key {
  min-width: 42px;
  height: 42px;
  background: #3d3d3d;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.08s;
  box-shadow: 0 2px 0 #1a1a1a;
}

.key.wide {
  min-width: 60px;
  font-size: 0.75rem;
}

.key.pressed {
  background: #00b894;
  color: white;
  transform: translateY(2px);
  box-shadow: 0 0 0 #1a1a1a;
}

.keyboard-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.clear-btn {
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 测试结果 */
.test-result {
  display: flex;
  gap: 1rem;
}

.result-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.result-item.pass {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.result-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.result-value {
  font-weight: 600;
  color: var(--text-secondary);
}

.result-item.pass .result-value {
  color: #10b981;
}

@media (max-width: 600px) {
  .keyboard-container {
    padding: 0.5rem;
    overflow-x: auto;
  }
  
  .key {
    min-width: 32px;
    height: 36px;
    font-size: 0.7rem;
  }
  
  .key.wide {
    min-width: 45px;
  }
  
  .test-result {
    flex-direction: column;
  }
}
</style>
