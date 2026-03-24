<script lang="ts">
// 显示声明组件名称，供自带树状递归调用
export default {
  name: 'JsonTreeNode'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  data: any;
  nameKey: string | number | null;
  isLast?: boolean;
}>();

const expanded = ref(true);

const isObject = computed(() => props.data !== null && typeof props.data === 'object' && !Array.isArray(props.data));
const isArray = computed(() => Array.isArray(props.data));
const isComplex = computed(() => isObject.value || isArray.value);

const childrenKeys = computed(() => {
  if (isObject.value) return Object.keys(props.data);
  if (isArray.value) return Array.from({ length: props.data.length }, (_, i) => i);
  return [];
});

const size = computed(() => childrenKeys.value.length);

const toggle = () => {
  if (isComplex.value) {
    expanded.value = !expanded.value;
  }
};

const valueClass = computed(() => {
  if (props.data === null) return 'type-null';
  if (typeof props.data === 'string') return 'type-string';
  if (typeof props.data === 'number') return 'type-number';
  if (typeof props.data === 'boolean') return 'type-boolean';
  return '';
});

const formatValue = computed(() => {
  if (props.data === null) return 'null';
  if (typeof props.data === 'string') return `"${props.data}"`;
  return String(props.data);
});
</script>

<template>
  <div class="json-node" :class="{ 'complex': isComplex }">
    <div class="node-line" @click="toggle" :class="{ 'clickable': isComplex }">
      <span v-if="isComplex" class="toggle-icon">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="toggle-placeholder"></span>

      <!-- 渲染键名 -->
      <span v-if="nameKey !== null" class="key">"{{ nameKey }}"</span>
      <span v-if="nameKey !== null" class="colon">:</span>

      <!-- 如果是对象或数组 -->
      <template v-if="isComplex">
        <span class="bracket">{{ isArray ? '[' : '{' }}</span>
        <!-- 折叠状态展示元素数量 -->
        <span v-if="!expanded" class="collapsed-text">{{ ` ... ${size} items ` }}</span>
        <span v-if="!expanded" class="bracket">{{ isArray ? ']' : '}' }}<span class="comma" v-if="!isLast">,</span></span>
      </template>

      <!-- 如果是基本类型 -->
      <template v-else>
        <span class="value" :class="valueClass">{{ formatValue }}</span>
        <span class="comma" v-if="!isLast">,</span>
      </template>
    </div>

    <!-- 递归展开子元素 -->
    <div v-if="isComplex && expanded" class="children" style="padding-left: 20px;">
      <JsonTreeNode
        v-for="(childKey, index) in childrenKeys"
        :key="childKey"
        :nameKey="isArray ? null : childKey"
        :data="data[childKey]"
        :isLast="index === childrenKeys.length - 1"
      />
    </div>

    <!-- 闭合括号 -->
    <div v-if="isComplex && expanded" class="node-line bracket-line">
      <span class="toggle-placeholder"></span>
      <span class="bracket">{{ isArray ? ']' : '}' }}</span>
      <span class="comma" v-if="!isLast">,</span>
    </div>
  </div>
</template>

<style scoped>
.json-node {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

.node-line {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap; /* 适配长的值 */
  word-break: break-all;
}

.clickable {
  cursor: pointer;
  border-radius: 4px;
}

.clickable:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.toggle-icon {
  display: inline-block;
  width: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 10px;
  user-select: none;
  margin-right: 4px;
  margin-top: 3px;
}

.toggle-placeholder {
  display: inline-block;
  width: 20px;
}

.key {
  color: #e06c75;
}

.colon {
  margin-right: 6px;
  color: var(--text-primary);
}

.value.type-string {
  color: #98c379;
}
.value.type-number {
  color: #d19a66;
}
.value.type-boolean {
  color: #56b6c2;
}
.value.type-null {
  color: #c678dd;
  font-weight: bold;
}

.bracket {
  color: var(--text-secondary);
  font-weight: bold;
}

.comma {
  color: var(--text-primary);
}

.collapsed-text {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 12px;
  margin: 0 4px;
}

@media (prefers-color-scheme: light) {
  .key { color: #d14; }
  .value.type-string { color: #098658; }
  .value.type-number { color: #268bd2; }
  .value.type-boolean { color: #0000ff; }
  .value.type-null { color: #0000ff; }
}
</style>
