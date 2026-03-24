<script setup lang="ts">
import { toolsData } from '../data/tools';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="home">
    <div class="categories">
      <div 
        v-for="category in toolsData" 
        :key="category.id" 
        class="category"
      >
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="tools-grid">
          <div
            v-for="tool in category.tools"
            :key="tool.id"
            class="tool-card"
            @click="navigateTo(tool.path)"
          >
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.hero p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.tool-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
