# 🚀 ToolVibe - 开箱即用的在线开发者工具箱

[![Deploy to GitHub Pages](https://github.com/SanGrue/toolvibe/actions/workflows/build.yml/badge.svg)](https://github.com/SanGrue/toolvibe/actions/workflows/build.yml)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

**ToolVibe** 是一个轻量、纯粹、全在本地浏览器端无缝运行的聚合开发者工具箱。致力于提供日常开发最常用、最顺手的实用功能组件集合。

👉 **[在线立即体验 (Live Demo)](https://sangrue.github.io/toolvibe/)** 

---

## ✨ 已包含的常驻功能库 (Features)

目前 **ToolVibe** 内置了十多款高效的纯前端环境独立工具（完全离线化，隐私极其安全）：

- 🕒 **时间戳转换** (Timestamp): 针对开发者习惯的秒/毫秒时间格式无缝处理。
- 📑 **PDF 离线拆合** (PdfSplitter): 无需把私密文件上传到远端后台，直接在你本机利用 CPU 性能做 PDF 提取、拆分和批量合并。
- 📱 **二维码工具** (QRCode): 海报/链接在线转化，以及针对未知二维码上传图片后的极速逆向解码。
- 🔤 **JSON 格式化** (JSON Formatter): API 调试必备，对象美化校验与折叠。
- 📊 **SQL 格式化** (SQL Formatter): 任意杂乱 SQL 代码一键排版美化。
- 🎫 **UUID 生成器** (UUID Generator): 内置底层核心支持的高兼容可溯批生成 V4 标准工具。
- 🔐 **Base64 转换** (Base64 Converter): 便捷的字符全集编/解码。
- 🔑 **Hash 生成器** (Hash Generator): 加密串计算生成。
- 🎨 **调色板提取** (Color picker): HEX、RGB 和透明度调整器。
- 💻 **键盘与鼠标事件拦截** (Keyboard / Mouse Test): 捕捉与按键回显。
- 🎬 **M3U8 播放器验证** (M3U8 Player)。

## 🛠️ 技术栈与底层驱动 (Tech Stack)

该项目基于当今顶级现代前端生态重构：
- [Vue 3](https://vuejs.org/) - 前端视口核心架构 (全量使用 `<script setup>`)
- [Vite](https://vitejs.dev/) - 次世代超极速代码与包构建工具
- [TypeScript](https://www.typescriptlang.org/) - 确保所有原生 API 与事件具备精准的方法约束
- [Vue Router](https://router.vuejs.org/) - 保障全站路由在 History 模式下零加载流转切换

---

## 💻 本地极速开发 (Local Development)

想在本地调试或者在此基础上扩展更多独立新组件？

```bash
# 1. 克隆代码仓库
git clone https://github.com/SanGrue/toolvibe.git

# 2. 进入项目源码
cd toolvibe

# 3. 安装所需依赖
npm install

# 4. 唤起本地监听与开发服务（即刻体验极速热重启 HMR）
npm run dev

# 5. 生成线上发布压缩包（纯属测试，上线请依赖后面的 CI 自动流水线）
npm run build
```

## 🚀 一键云端部署持续集成 (CI/CD Deployment)

项目已经为您打造了一条终极轻量的**全自动化流水线**。这一切依赖于 **GitHub Actions**。

无论你在何地、甚至只利用网页版修改项目源码，只要变更了 `main` 分支的内容：
1. 部署流水线会被立即智能触发生效
2. 从安装环境到打包 `dist` 全部在云端沙盒闭环走完
3. 所有前端路由(SPA Fallback)已被注入兼容程序 
4. **最终页面将被秒速更新到您的 GitHub Pages 公开网站上**！
