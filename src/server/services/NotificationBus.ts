import "server-only";
import { EventEmitter } from "node:events";

export interface NotificationBus {
  publish(userId: string, payload: unknown): void;
  subscribe(userId: string, cb: (payload: unknown) => void): () => void;
}

class InProcessBus implements NotificationBus {
  private emitter = new EventEmitter();
  publish(userId: string, payload: unknown) {
    this.emitter.emit(userId, payload);
  }
  subscribe(userId: string, cb: (payload: unknown) => void) {
    this.emitter.on(userId, cb);
    return () => this.emitter.off(userId, cb);
  }
}

export const notificationBus: NotificationBus = new InProcessBus();