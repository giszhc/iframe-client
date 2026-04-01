# Iframe Client

一个 **简单、轻量、专注通信** 的 JavaScript / TypeScript 库，用于 **iframe 跨域消息传递**。

本库专注于 **纯通信功能**，不包含 iframe 创建和管理。用户需要自行创建 iframe，只需传入 window 对象即可开始通信。

---

## ✨ 特性

* 🚀 **轻量无依赖** - 仅专注于 postMessage 通信
* 🔌 **即插即用** - 支持传入 iframe DOM 或 window 对象
* 🛡️ **类型安全** - 完整的 TypeScript 类型支持
* 💬 **双向通信** - 父页面与子页面自由对话
* 🎯 **安全验证** - 支持 origin + source 校验
* 🤝 **握手协议** - 内置 READY / ACK，确保通信可靠
* 🧩 **命名空间隔离** - 避免多实例/多应用消息冲突
* 📦 **简单易用** - API 简洁直观

---

## 在线示例

我们提供了一个功能完整的在线演示页面，您可以直接在浏览器中体验所有功能：

**🌐 立即体验：** [点击访问在线演示](https://giszhc.github.io/iframe-client/example/parent.html)

---

## 安装

```bash
pnpm install @giszhc/iframe-client
# 或
npm install @giszhc/iframe-client
yarn add @giszhc/iframe-client
```

---

## ⚠️ 通信机制（重要）

本库内置 **握手协议（Handshake）**，确保双方建立连接后再通信。

### 握手流程

```
child  → READY
parent → ACK
→ connected = true
```

### 使用原则

❗ **必须在 onConnect 后发送消息**

```ts
const client = new IframeClient({
  type: 'parent',
  iframe,
  namespace: 'my-app:demo:v1',
  onConnect: () => {
    // ✅ 正确
    client.sendMessage('INIT', {});
  }
});
```

---

## 📦 消息结构

所有消息会被统一封装为：

```ts
{
  __iframe_client__: true,
  namespace: string,
  type: string,
  payload?: any
}
```

---

## 🚀 快速开始

### 父页面

```ts
import { IframeClient } from '@giszhc/iframe-client';

// 获取 iframe DOM 元素
const iframe = document.getElementById('myIframe') as HTMLIFrameElement;

const client = new IframeClient({
  type: 'parent',              // 指定当前角色为父页面
  iframe,                      // 传入 iframe DOM 元素
  targetOrigin: 'http://localhost:3001',  // 子页面的目标源地址（生产环境请指定具体域名）
  namespace: 'my-app:demo:v1', // 命名空间，用于消息隔离（格式建议：应用名：功能：版本）

  // 连接成功后的回调函数（握手完成后触发）
  onConnect: () => {
    console.log('✅ 已连接 iframe');

    // 发送初始化消息，包含用户 ID
    client.sendMessage('INIT', { id: 123 });
  }
});

// 监听来自子页面的 RESPONSE 类型消息
client.on('RESPONSE', (data) => {
  console.log('收到响应:', data);
});
```

---

### 子页面（iframe 内）

```ts
import { IframeClient } from '@giszhc/iframe-client';

const client = new IframeClient({
  type: 'child',               // 指定当前角色为子页面（iframe 内）
  targetWindow: window.parent, // 指定目标窗口为父窗口
  targetOrigin: 'http://localhost:3000',  // 父页面的源地址（生产环境请指定具体域名）
  namespace: 'my-app:demo:v1', // 命名空间，必须与父页面保持一致

  // 连接成功后的回调函数（握手完成后触发）
  onConnect: () => {
    console.log('✅ 已连接父页面');
  }
});

// 监听来自父页面的 INIT 类型消息
client.on('INIT', (data) => {
  console.log('收到:', data);

  // 发送响应消息给父页面
  client.sendMessage('RESPONSE', { ok: true });
});
```

---

## API

### 配置

```ts
interface IframeClientConfig {
  type: 'parent' | 'child';
  iframe?: HTMLIFrameElement;
  targetWindow?: Window;
  targetOrigin?: string;
  namespace: string;
  onConnect?: () => void;
  onError?: (error: Error) => void;
}
```

---

### sendMessage

```ts
client.sendMessage('EVENT', { data: 1 });
```

---

### on

```ts
client.on('EVENT', (data, event) => {
  console.log(data);
});
```

---

### off

```ts
client.off('EVENT', handler);
```

---

### destroy

```ts
client.destroy();
```

---

### isConnected

```ts
client.isConnected();
```

---

## 🔁 通信流程示例

```
【握手阶段】
child  → READY
parent → ACK

【业务通信】
parent → INIT
child  → RESPONSE
```

---

## ⚠️ 注意事项

### 1️⃣ 必须使用 namespace

```ts
// ❌ 错误
namespace: 'a'
namespace: 'b'

// ✅ 正确
namespace: 'my-app:demo:v1'
```

---

### 2️⃣ 不要提前发送消息

```ts
// ❌ 错误
client.sendMessage('INIT');

// ✅ 正确
onConnect: () => {
  client.sendMessage('INIT');
}
```

---

### 3️⃣ 必须传正确参数

```ts
// parent
new IframeClient({
  type: 'parent',
  iframe,
  namespace: 'xxx'
});

// child
new IframeClient({
  type: 'child',
  targetWindow: window.parent,
  namespace: 'xxx'
});
```

---

### 4️⃣ 生产环境不要用 '*'

```ts
targetOrigin: 'https://your-domain.com'
```

---

### 5️⃣ 记得销毁

```ts
client.destroy();
```

---

## 🔐 安全机制

* origin 校验
* source 校验
* namespace 隔离
* 内部消息标识过滤

---

## ❌ 常见错误

### 提前发送消息（会丢）

```ts
const client = new IframeClient({ ... });

client.sendMessage('INIT'); // ❌
```

---

### namespace 不一致

👉 直接无法通信

---

## FAQ

### Q: onConnect 什么时候触发？

A: 在握手完成后触发（READY / ACK 完成）。

---

### Q: payload 支持什么类型？

支持所有 **结构化克隆数据**：

* ✅ Object / Array
* ✅ Map / Set
* ✅ ArrayBuffer
* ❌ Function / DOM

---

### Q: 可以不用这个库吗？

可以，用原生：

```ts
window.postMessage(...)
window.addEventListener('message', ...)
```

但你需要自己处理：

* 握手
* 安全校验
* 消息管理

---

## 📄 License

MIT

---

❤️ Made with ❤️

---
