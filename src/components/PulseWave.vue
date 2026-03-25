<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let animationId: number;
let ctx: CanvasRenderingContext2D | null = null;

// 多条波浪的参数定义
const waves = [
  { frequency: 0.008, amplitude: 0.15, speed: 0.015, opacity: 0.12, phase: 0 },
  { frequency: 0.012, amplitude: 0.10, speed: -0.02, phase: 2 },
  { frequency: 0.018, amplitude: 0.08, speed: 0.025, opacity: 0.08, phase: 4 },
];

// 点击激活
let boost = 0;

const onInteraction = () => {
  boost = 1.0;
};

const resizeCanvas = () => {
  if (!canvas.value) return;
  const parent = canvas.value.parentElement;
  if (!parent) return;
  canvas.value.width = parent.clientWidth;
  canvas.value.height = parent.clientHeight;
};

let time = 0;

const draw = () => {
  if (!ctx || !canvas.value) return;
  const w = canvas.value.width;
  const h = canvas.value.height;
  const midY = h / 2;

  time += 1;

  // boost 衰减
  boost *= 0.97;
  if (boost < 0.005) boost = 0;

  ctx.clearRect(0, 0, w, h);

  for (const wave of waves) {
    const baseAmp = wave.amplitude * h;
    // 点击后振幅放大
    const amp = baseAmp * (1 + boost * 3);
    const opacity = (wave.opacity || 0.1) + boost * 0.15;

    ctx.beginPath();
    ctx.moveTo(0, h); // 从左下角开始

    for (let x = 0; x <= w; x += 2) {
      const y = midY
        + Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * amp
        + Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.3) * amp * 0.3;
      ctx.lineTo(x, y);
    }

    // 闭合路径形成填充区域
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
    ctx.fill();
  }

  animationId = requestAnimationFrame(draw);
};

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');
  resizeCanvas();
  draw();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('click', onInteraction);
  window.addEventListener('keydown', onInteraction);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('click', onInteraction);
  window.removeEventListener('keydown', onInteraction);
});
</script>

<template>
  <canvas ref="canvas" class="pulse-canvas"></canvas>
</template>

<style scoped>
.pulse-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
