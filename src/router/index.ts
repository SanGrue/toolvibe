import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

// 工具组件懒加载
const M3u8Player = () => import('../components/M3u8Player.vue');
const PdfSplitter = () => import('../components/PdfSplitter.vue');
const TimestampConverter = () => import('../components/TimestampConverter.vue');
const QRCode = () => import('../components/QRCode.vue');
const KeyboardMouseTest = () => import('../components/KeyboardMouseTest.vue');
const ColorPicker = () => import('../components/ColorPicker.vue');
const JsonFormatter = () => import('../components/JsonFormatter.vue');
const SqlFormatter = () => import('../components/SqlFormatter.vue');
const UuidGenerator = () => import('../components/UuidGenerator.vue');
const HashGenerator = () => import('../components/HashGenerator.vue');
const Base64Converter = () => import('../components/Base64Converter.vue');

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/json-formatter',
    name: 'json-formatter',
    component: JsonFormatter
  },
  {
    path: '/sql-formatter',
    name: 'sql-formatter',
    component: SqlFormatter
  },
  {
    path: '/uuid-generator',
    name: 'uuid-generator',
    component: UuidGenerator
  },
  {
    path: '/hash-generator',
    name: 'hash-generator',
    component: HashGenerator
  },
  {
    path: '/base64-converter',
    name: 'base64-converter',
    component: Base64Converter
  },
  {
    path: '/timestamp-converter',
    name: 'timestamp-converter',
    component: TimestampConverter
  },
  {
    path: '/color-picker',
    name: 'color-picker',
    component: ColorPicker
  },
  {
    path: '/pdf-splitter',
    name: 'pdf-splitter',
    component: PdfSplitter
  },
  {
    path: '/qrcode',
    name: 'qrcode',
    component: QRCode
  },
  {
    path: '/m3u8-player',
    name: 'm3u8-player',
    component: M3u8Player
  },
  {
    path: '/keyboard-mouse-test',
    name: 'keyboard-mouse-test',
    component: KeyboardMouseTest
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
