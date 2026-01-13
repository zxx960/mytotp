# TOTP 验证码生成器

本地运行的 Google Authenticator 兼容 TOTP（基于时间的一次性密码）生成器。

## 功能

- 输入 Base32 格式的 2FA Secret，实时生成 6 位验证码
- 每 30 秒自动刷新，显示剩余时间倒计时
- 兼容 Google Authenticator、Microsoft Authenticator 等主流 2FA 应用
- 前端调用本地服务端计算验证码

## 快速开始

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

浏览器访问 http://localhost:3000

## 技术实现

- 算法：HMAC-SHA1（RFC 6238 TOTP 标准）
- 后端：Node.js + Express
- 前端：原生 HTML/CSS/JavaScript

## 使用说明

1. 从需要绑定 2FA 的网站获取 Secret 密钥（通常在设置安全选项时显示）
2. 将 Secret 粘贴到输入框
3. 点击「开始生成」获取验证码

## 安全提示

⚠️ Secret 是你的 2FA 密钥，请妥善保管：
- 仅在可信设备上使用
- 避免截图、录屏或复制到剪贴板
- 不要将 Secret 分享给他人
