<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, copyToClipboard } from '../utils/colors';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const selectedColor = ref('#3b82f6');
const activeTab = ref('picker');
const copiedText = ref('');

const showCopied = (text: string) => {
  copiedText.value = text;
  setTimeout(() => {
    copiedText.value = '';
  }, 1500);
};

const handleCopy = async (text: string) => {
  const success = await copyToClipboard(text);
  if (success) {
    showCopied(text);
  }
};

// 当前颜色信息
const currentRgb = computed(() => hexToRgb(selectedColor.value));
const currentHsl = computed(() => rgbToHsl(currentRgb.value.r, currentRgb.value.g, currentRgb.value.b));

const colorInfo = computed(() => {
  const { r, g, b } = currentRgb.value;
  const hex = rgbToHex(r, g, b);
  const { h, s, l } = currentHsl.value;
  return {
    HEX: hex,
    RGB: `rgb(${r}, ${g}, ${b})`,
    HSL: `hsl(${h}, ${s}%, ${l}%)`
  };
});

// ===== 色相环 =====
const hueRingRef = ref<HTMLDivElement>();
const isDraggingHue = ref(false);

const handleHueMouseDown = (e: MouseEvent) => {
  isDraggingHue.value = true;
  updateHueFromPosition(e);
};

const handleHueMouseMove = (e: MouseEvent) => {
  if (isDraggingHue.value) {
    updateHueFromPosition(e);
  }
};

const handleHueMouseUp = () => {
  isDraggingHue.value = false;
};

const updateHueFromPosition = (e: MouseEvent) => {
  if (!hueRingRef.value) return;
  const rect = hueRingRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = e.clientX - centerX;
  const y = e.clientY - centerY;
  let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
  if (angle < 0) angle += 360;
  
  const { s, l } = currentHsl.value;
  const rgb = hslToRgb(angle, s, l);
  selectedColor.value = rgbToHex(rgb.r, rgb.g, rgb.b);
};

// 亮度/饱和度选择器
const satLightRef = ref<HTMLDivElement>();
const isDraggingSatLight = ref(false);

const handleSatLightMouseDown = (e: MouseEvent) => {
  isDraggingSatLight.value = true;
  updateSatLightFromPosition(e);
};

const handleSatLightMouseMove = (e: MouseEvent) => {
  if (isDraggingSatLight.value) {
    updateSatLightFromPosition(e);
  }
};

const handleSatLightMouseUp = () => {
  isDraggingSatLight.value = false;
};

const updateSatLightFromPosition = (e: MouseEvent) => {
  if (!satLightRef.value) return;
  const rect = satLightRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  const s = Math.round(x * 100);
  const l = Math.round((1 - y) * 100);
  const { h } = currentHsl.value;
  const rgb = hslToRgb(h, s, l);
  selectedColor.value = rgbToHex(rgb.r, rgb.g, rgb.b);
};

const satLightPosition = computed(() => {
  const { s, l } = currentHsl.value;
  return {
    left: `${s}%`,
    top: `${100 - l}%`
  };
});

// ===== Color Harmonies =====
const harmonyColors = computed(() => {
  const { h, s, l } = currentHsl.value;
  const colors: { type: string; colors: string[] }[] = [];
  
  // 互补色
  const complementary = [
    hslToRgb(h, s, l),
    hslToRgb((h + 180) % 360, s, l)
  ];
  colors.push({ type: '互补色', colors: complementary.map(c => rgbToHex(c.r, c.g, c.b)) });
  
  // 类似色
  const analogous = [
    hslToRgb((h - 30 + 360) % 360, s, l),
    hslToRgb(h, s, l),
    hslToRgb((h + 30) % 360, s, l)
  ];
  colors.push({ type: '类似色', colors: analogous.map(c => rgbToHex(c.r, c.g, c.b)) });
  
  // 三角色
  const triadic = [
    hslToRgb(h, s, l),
    hslToRgb((h + 120) % 360, s, l),
    hslToRgb((h + 240) % 360, s, l)
  ];
  colors.push({ type: '三角色', colors: triadic.map(c => rgbToHex(c.r, c.g, c.b)) });
  
  // 分裂互补色
  const splitComp = [
    hslToRgb(h, s, l),
    hslToRgb((h + 150) % 360, s, l),
    hslToRgb((h + 210) % 360, s, l)
  ];
  colors.push({ type: '分裂互补色', colors: splitComp.map(c => rgbToHex(c.r, c.g, c.b)) });
  
  // 四角色
  const tetradic = [
    hslToRgb(h, s, l),
    hslToRgb((h + 90) % 360, s, l),
    hslToRgb((h + 180) % 360, s, l),
    hslToRgb((h + 270) % 360, s, l)
  ];
  colors.push({ type: '四角色', colors: tetradic.map(c => rgbToHex(c.r, c.g, c.b)) });
  
  return colors;
});

// ===== 渐变生成器 =====
const gradientType = ref('linear');
const gradientAngle = ref(90);
const gradientStops = ref([
  { color: '#ff0000', position: 0 },
  { color: '#0000ff', position: 100 }
]);

const addGradientStop = () => {
  gradientStops.value.push({ color: '#808080', position: 50 });
  gradientStops.value.sort((a, b) => a.position - b.position);
};

const removeGradientStop = (index: number) => {
  if (gradientStops.value.length > 2) {
    gradientStops.value.splice(index, 1);
  }
};

const updateStopPosition = (index: number, pos: number) => {
  gradientStops.value[index].position = pos;
  gradientStops.value.sort((a, b) => a.position - b.position);
};

const gradientCss = computed(() => {
  const stops = gradientStops.value
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');
  return `${gradientType.value}-gradient(${gradientType.value === 'linear' ? gradientAngle.value + 'deg' : 'circle'}, ${stops})`;
});

const gradientCode = computed(() => {
  return `background: ${gradientCss.value};`;
});

watch(selectedColor, (newColor) => {
  // 同步当前颜色到渐变
  if (gradientStops.value.length > 0) {
    gradientStops.value[gradientStops.value.length - 1].color = newColor;
  }
});
</script>

<template>
  <div class="color-picker">
    <div class="tool-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>颜色选择器</h2>
      <p>色相环、颜色 harmonies、渐变生成器</p>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'picker' }"
        @click="activeTab = 'picker'"
      >色相环</button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'harmonies' }"
        @click="activeTab = 'harmonies'"
      >色彩搭配</button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'gradient' }"
        @click="activeTab = 'gradient'"
      >渐变生成器</button>
    </div>

    <!-- 色相环 -->
    <div v-if="activeTab === 'picker'" class="picker-panel">
      <div class="picker-layout">
        <!-- 色相环 -->
        <div 
          ref="hueRingRef"
          class="hue-ring"
          @mousedown="handleHueMouseDown"
          @mousemove="handleHueMouseMove"
          @mouseup="handleHueMouseUp"
          @mouseleave="handleHueMouseUp"
        >
          <div 
            class="hue-indicator"
            :style="{ 
              transform: `rotate(${currentHsl.h - 90}deg) translateY(-70px)` 
            }"
          ></div>
        </div>
        
        <!-- 饱和度/亮度 -->
        <div 
          ref="satLightRef"
          class="sat-light"
          :style="{ backgroundColor: `hsl(${currentHsl.h}, 100%, 50%)` }"
          @mousedown="handleSatLightMouseDown"
          @mousemove="handleSatLightMouseMove"
          @mouseup="handleSatLightMouseUp"
          @mouseleave="handleSatLightMouseUp"
        >
          <div 
            class="sat-light-indicator"
            :style="satLightPosition"
          ></div>
        </div>
      </div>

      <!-- 当前颜色 -->
      <div class="current-color">
        <div 
          class="color-preview" 
          :style="{ backgroundColor: selectedColor }"
        ></div>
        <div class="color-values">
          <div 
            v-for="(value, key) in colorInfo" 
            :key="key" 
            class="color-item"
            @click="handleCopy(value)"
          >
            <span class="color-label">{{ key }}</span>
            <span class="color-value">{{ value }}</span>
            <span class="copy-icon" :class="{ copied: copiedText === value }">
              <svg v-if="copiedText === value" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="color-input-section">
        <label>选择颜色</label>
        <div class="color-input-row">
          <input 
            type="color" 
            v-model="selectedColor" 
            class="color-input-native"
          />
          <input 
            type="text" 
            v-model="selectedColor" 
            class="color-input-text"
          />
        </div>
      </div>
    </div>

    <!-- 色彩搭配 -->
    <div v-if="activeTab === 'harmonies'" class="harmonies-panel">
      <div class="harmonies-current">
        <div 
          class="color-preview-large" 
          :style="{ backgroundColor: selectedColor }"
        ></div>
        <div class="harmonies-info">
          <h3>{{ colorInfo.HEX }}</h3>
          <p>{{ colorInfo.RGB }} / {{ colorInfo.HSL }}</p>
        </div>
      </div>
      
      <div 
        v-for="harmony in harmonyColors" 
        :key="harmony.type" 
        class="harmony-section"
      >
        <h4>{{ harmony.type }}</h4>
        <div class="harmony-colors">
          <div
            v-for="(color, idx) in harmony.colors"
            :key="idx"
            class="harmony-swatch"
            :style="{ backgroundColor: color }"
            @click="selectedColor = color; handleCopy(color)"
          >
            <span class="swatch-label">{{ color }}</span>
            <span class="swatch-copy">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 渐变生成器 -->
    <div v-if="activeTab === 'gradient'" class="gradient-panel">
      <div 
        class="gradient-preview"
        :style="{ background: gradientCss }"
      ></div>
      
      <div class="gradient-controls">
        <div class="control-row">
          <label>类型</label>
          <select v-model="gradientType">
            <option value="linear">线性渐变</option>
            <option value="radial">径向渐变</option>
          </select>
        </div>
        
        <div v-if="gradientType === 'linear'" class="control-row">
          <label>角度: {{ gradientAngle }}°</label>
          <input 
            type="range" 
            v-model="gradientAngle" 
            min="0" 
            max="360"
          />
        </div>
        
        <div class="control-row">
          <label>颜色节点</label>
          <button @click="addGradientStop" class="add-btn">+ 添加</button>
        </div>
        
        <div class="gradient-stops">
          <div 
            v-for="(stop, index) in gradientStops" 
            :key="index" 
            class="stop-item"
          >
            <input 
              type="color" 
              v-model="stop.color"
              class="stop-color"
            />
            <input 
              type="range" 
              :value="stop.position"
              @input="updateStopPosition(index, Number(($event.target as HTMLInputElement).value))"
              min="0" 
              max="100"
              class="stop-slider"
            />
            <span class="stop-value">{{ stop.position }}%</span>
            <button 
              @click="removeGradientStop(index)" 
              class="remove-btn"
              :disabled="gradientStops.length <= 2"
            >×</button>
          </div>
        </div>
      </div>
      
      <div class="gradient-code">
        <label>CSS 代码</label>
        <div class="code-block" @click="handleCopy(gradientCode)">
          <code>{{ gradientCode }}</code>
          <span class="copy-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
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
  text-decoration: none;
  font-size: 0.9rem;
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

/* 标签页 */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: var(--primary-color);
}

.tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* 色相环面板 */
.picker-panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.picker-layout {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.hue-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    red, yellow, lime, aqua, blue, magenta, red
  );
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.hue-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: white;
  border: 3px solid #333;
  border-radius: 50%;
  transform-origin: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.sat-light {
  width: 180px;
  height: 140px;
  border-radius: 8px;
  position: relative;
  cursor: crosshair;
  background-image: 
    linear-gradient(to bottom, transparent, black),
    linear-gradient(to right, white, transparent);
}

.sat-light-indicator {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(0,0,0,0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 当前颜色 */
.current-color {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.color-preview {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.color-values {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-color);
  border-radius: 6px;
  cursor: pointer;
}

.color-item:hover {
  background: var(--border-color);
}

.color-label {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 40px;
  color: var(--text-primary);
}

.color-value {
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.copy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.color-item:hover .copy-icon,
.code-block:hover .copy-icon {
  color: var(--primary-color);
}

.copy-icon.copied {
  color: #22c55e;
}

/* 输入框 */
.color-input-section {
  margin-top: 1rem;
}

.color-input-section label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.color-input-row {
  display: flex;
  gap: 0.75rem;
}

.color-input-native {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-input-text {
  flex: 1;
  padding: 0.6rem 0.75rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: monospace;
  font-size: 1rem;
  color: var(--text-primary);
}

/* 色彩搭配面板 */
.harmonies-panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.harmonies-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.color-preview-large {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.harmonies-info h3 {
  font-size: 1.25rem;
  font-family: monospace;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.harmonies-info p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.harmony-section {
  margin-bottom: 1.25rem;
}

.harmony-section h4 {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.harmony-colors {
  display: flex;
  gap: 0.5rem;
}

.harmony-swatch {
  flex: 1;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.5rem;
  transition: transform 0.15s;
  position: relative;
}

.harmony-swatch:hover {
  transform: scale(1.05);
}

.swatch-copy {
  position: absolute;
  top: 4px;
  right: 4px;
  color: rgba(255,255,255,0.7);
  opacity: 0;
  transition: opacity 0.2s;
}

.harmony-swatch:hover .swatch-copy {
  opacity: 1;
}

.swatch-label {
  font-size: 0.7rem;
  font-family: monospace;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* 渐变面板 */
.gradient-panel {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.gradient-preview {
  height: 150px;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.gradient-controls {
  margin-bottom: 1.5rem;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-row label {
  min-width: 80px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.control-row select {
  flex: 1;
  padding: 0.5rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
}

.control-row input[type="range"] {
  flex: 1;
}

.add-btn {
  padding: 0.4rem 0.8rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.gradient-stops {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stop-color {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.stop-slider {
  flex: 1;
}

.stop-value {
  min-width: 45px;
  text-align: right;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.remove-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
}

.remove-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.gradient-code label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.code-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}

.code-block code {
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--text-primary);
}

@media (max-width: 600px) {
  .picker-layout {
    flex-direction: column;
    align-items: center;
  }
  
  .sat-light {
    width: 100%;
  }
}
</style>
