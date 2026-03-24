<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { toolsData } from './data/tools';

const route = useRoute();
const showBackToTop = ref(false);

const onScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

const isHome = computed(() => route.path === '/' || route.path === '');
const isToolPage = computed(() => !isHome.value);

// 获取当前工具名称
const currentToolName = computed(() => {
  const path = route.path;
  for (const category of toolsData) {
    const tool = category.tools.find(t => t.path === path);
    if (tool) return tool.name;
  }
  return '';
});
</script>

<template>
  <div class="layout">
    <header class="header" :class="{ compact: isToolPage }">
      <div class="header-container">
        <template v-if="isHome">
          <h1>ToolVibe</h1>
          <p>开箱即用的开发工具箱</p>
        </template>
        <template v-else>
          <div class="header-compact">
            <router-link to="/" class="header-home-link">
              <h1>ToolVibe</h1>
            </router-link>
            <span class="header-divider">|</span>
            <span class="header-tool-name">{{ currentToolName }}</span>
          </div>
        </template>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2026 ToolVibe. All rights reserved.</p>
      </div>
    </footer>

    <!-- Back to Top Button -->
    <button 
      v-show="showBackToTop" 
      @click="scrollToTop" 
      class="back-to-top"
      aria-label="回到顶部"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.header {
  transition: all 0.3s ease;
}

.header.compact {
  padding: 0.75rem 0;
}

.header.compact h1 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.header-home-link {
  text-decoration: none;
  color: inherit;
}

.header-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.header-divider {
  color: var(--text-secondary);
}

.header-tool-name {
  color: var(--text-secondary);
  font-size: 1rem;
}

.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, background-color 0.2s, opacity 0.3s;
  z-index: 50;
}

.back-to-top:hover {
  background-color: #2563eb;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.back-to-top:active {
  transform: translateY(0);
}
</style>
