/**
 * IframeClient - 带握手 + namespace 的 iframe 通信库
 *
 * 特性：
 * ✅ 握手协议（READY / ACK）
 * ✅ namespace 隔离（防冲突）
 * ✅ source + origin 双重安全校验
 * ✅ 类型安全结构
 */

export interface MessageData {
  __iframe_client__: true;
  namespace: string;
  type: string;
  payload?: any;
}

const INTERNAL_TYPE = {
  READY: '__READY__',
  ACK: '__ACK__'
};

export interface IframeClientConfig {
  type: 'parent' | 'child';
  iframe?: HTMLIFrameElement;
  targetWindow?: Window;
  targetOrigin?: string;

  /** 🔥 命名空间（强烈建议必填） */
  namespace: string;

  onConnect?: () => void;
  onError?: (error: Error) => void;
}

type MessageHandler<T = any> = (payload: T, event: MessageEvent) => void;

export class IframeClient {
  private targetWindow: Window | null = null;
  private targetOrigin: string;
  private namespace: string;

  private messageHandlers = new Map<string, MessageHandler[]>();
  private connected = false;
  private readySent = false;

  private messageListener: (event: MessageEvent) => void;

  public onConnect?: () => void;
  public onError?: (error: Error) => void;

  constructor(config: IframeClientConfig) {
    if (!config.namespace) {
      throw new Error('namespace is required');
    }

    this.namespace = config.namespace;
    this.targetOrigin = config.targetOrigin ?? '*';

    if (config.type === 'parent') {
      if (!config.iframe) throw new Error('iframe required');
      this.targetWindow = config.iframe.contentWindow;
    } else {
      if (!config.targetWindow) throw new Error('targetWindow required');
      this.targetWindow = config.targetWindow;
    }

    if (!this.targetWindow) {
      throw new Error('targetWindow not found');
    }

    this.onConnect = config.onConnect;
    this.onError = config.onError;

    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageListener);

    this.initHandshake(config);
  }

  /**
   * 初始化握手
   */
  private initHandshake(config: IframeClientConfig) {
    if (config.type === 'parent' && config.iframe) {
      config.iframe.addEventListener('load', () => {
        this.sendReady();
      });
    } else {
      this.sendReady();
    }
  }

  /**
   * 构造标准消息结构
   */
  private createMessage(type: string, payload?: any): MessageData {
    return {
      __iframe_client__: true,
      namespace: this.namespace,
      type,
      payload
    };
  }

  /**
   * 发送 READY
   */
  private sendReady() {
    if (this.readySent || !this.targetWindow) return;

    this.readySent = true;

    this.targetWindow.postMessage(
        this.createMessage(INTERNAL_TYPE.READY),
        this.targetOrigin
    );
  }

  /**
   * 发送 ACK
   */
  private sendAck() {
    if (!this.targetWindow) return;

    this.targetWindow.postMessage(
        this.createMessage(INTERNAL_TYPE.ACK),
        this.targetOrigin
    );
  }

  /**
   * 处理消息
   */
  private handleMessage(event: MessageEvent) {
    // ✅ 校验 window
    if (event.source !== this.targetWindow) return;

    // ✅ 校验 origin
    if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) return;

    const data = event.data as MessageData;

    // ✅ 校验是否是本库消息
    if (!data || data.__iframe_client__ !== true) return;

    // ✅ 校验 namespace
    if (data.namespace !== this.namespace) return;

    // ===== 握手 =====
    if (data.type === INTERNAL_TYPE.READY) {
      this.sendAck();
      return;
    }

    if (data.type === INTERNAL_TYPE.ACK) {
      if (!this.connected) {
        this.connected = true;
        this.onConnect?.();
      }
      return;
    }

    // ===== 业务消息 =====
    const handlers = this.messageHandlers.get(data.type);
    handlers?.forEach(h => {
      try {
        h(data.payload, event);
      } catch (err) {
        this.onError?.(
            err instanceof Error ? err : new Error('handler error')
        );
      }
    });
  }

  /**
   * 发送消息
   */
  public sendMessage(type: string, payload?: any) {
    if (!this.targetWindow) {
      this.onError?.(new Error('targetWindow not available'));
      return;
    }

    if (!this.connected) {
      console.warn('[IframeClient] send before connected');
    }

    try {
      this.targetWindow.postMessage(
          this.createMessage(type, payload),
          this.targetOrigin
      );
    } catch (error) {
      this.onError?.(
          error instanceof Error ? error : new Error('postMessage failed')
      );
    }
  }

  /**
   * 注册监听
   */
  public on<T = any>(type: string, handler: MessageHandler<T>) {
    const list = this.messageHandlers.get(type) || [];
    list.push(handler);
    this.messageHandlers.set(type, list);
  }

  /**
   * 取消监听
   */
  public off(type: string, handler: MessageHandler) {
    const list = this.messageHandlers.get(type);
    if (!list) return;

    this.messageHandlers.set(
        type,
        list.filter(h => h !== handler)
    );
  }

  /**
   * 是否已连接
   */
  public isConnected() {
    return this.connected;
  }

  /**
   * 销毁
   */
  public destroy() {
    window.removeEventListener('message', this.messageListener);
    this.messageHandlers.clear();
    this.targetWindow = null;
    this.connected = false;
  }
}