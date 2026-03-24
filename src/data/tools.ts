import type { Category } from '../types';

export const toolsData: Category[] = [
  {
    id: 'dev',
    name: '开发工具',
    tools: [
      { id: 'json-formatter', name: 'JSON 格式化', description: '美化和校验 JSON 数据', path: '/json-formatter' },
      { id: 'sql-formatter', name: 'SQL 格式化', description: '美化 SQL 语句', path: '/sql-formatter' },
      { id: 'uuid-generator', name: 'UUID 生成', description: '生成随机 UUID', path: '/uuid-generator' },
      { id: 'hash-generator', name: '哈希摘要', description: '计算 MD5, SHA 等哈希值', path: '/hash-generator' },
      { id: 'base64-converter', name: 'Base64 编解码', description: '文本和图片 base64 相互转换', path: '/base64-converter' },
      { id: 'timestamp-converter', name: '时间戳转换', description: 'Unix 时间戳及日期转换', path: '/timestamp-converter' },
      { id: 'color-picker', name: '颜色选择器', description: '点击颜色获取 HEX、RGB、HSL 值', path: '/color-picker' }
    ]
  },
  {
    id: 'media',
    name: '文档媒体',
    tools: [
      { id: 'pdf-splitter', name: 'PDF 工具', description: '在线拆分、提取或合并 PDF 文件', path: '/pdf-splitter' },
      { id: 'qrcode', name: '二维码', description: '生成和识别二维码', path: '/qrcode' },
      { id: 'm3u8-player', name: 'M3U8 播放器', description: '在线测试播放 M3U8 视频流 (HLS)', path: '/m3u8-player' }
    ]
  },
  {
    id: 'system',
    name: '系统测试',
    tools: [
      { id: 'keyboard-mouse-test', name: '键盘鼠标测试', description: '测试键盘按键和鼠标点击是否正常', path: '/keyboard-mouse-test' }
    ]
  }
];
