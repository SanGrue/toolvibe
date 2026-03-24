<script setup lang="ts">
import { ref, onUnmounted, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import Hls from 'hls.js';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const videoRef = shallowRef<HTMLVideoElement | null>(null);
const url = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'); // Default test stream
const errorMsg = ref('');
let hls: Hls | null = null;

const playVideo = () => {
  errorMsg.value = '';
  if (!videoRef.value) return;

  const video = videoRef.value;

  if (Hls.isSupported()) {
    if (hls) {
      hls.destroy();
    }
    hls = new Hls();
    hls.loadSource(url.value);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(e => console.error('Play prevented', e));
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        errorMsg.value = 'HLS Error: ' + data.type + ' / ' + data.details;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            hls?.destroy();
            break;
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url.value;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(e => console.error('Play prevented', e));
    });
  } else {
    errorMsg.value = '此浏览器不支持 HLS 播放。请使用 Chrome, Firefox 或 Safari。';
  }
};

onUnmounted(() => {
  if (hls) {
    hls.destroy();
  }
});
</script>

<template>
  <div class="m3u8-player">
    <div class="player-header">
      <a @click="goHome" class="back-link">← 返回主页</a>
      <h2>M3U8 在线播放器</h2>
      <p>在下方输入 .m3u8 视频流地址进行测试播放</p>
    </div>

    <div class="player-controls">
      <input type="text" v-model="url" placeholder="输入 m3u8 URL..." class="url-input" />
      <button @click="playVideo" class="play-btn">播放</button>
    </div>
    
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="video-container">
      <video ref="videoRef" controls class="video-element"></video>
    </div>
  </div>
</template>

<style scoped>
.m3u8-player {
  max-width: 800px;
  margin: 0 auto;
}

.player-header {
  margin-bottom: 2rem;
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

.player-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.player-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.player-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.url-input {
  flex: 1;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--surface-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.url-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.play-btn {
  padding: 0.85rem 1.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.play-btn:hover {
  background-color: #2563eb;
}

.play-btn:active {
  transform: scale(0.98);
}

.error-msg {
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #f87171;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .error-msg {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
}

.video-container {
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  aspect-ratio: 16 / 9;
}

.video-element {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
