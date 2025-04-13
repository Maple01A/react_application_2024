import { EventEmitter } from 'events';

// イベントバスのシングルトンインスタンス
const eventBus = new EventEmitter();

// イベント名の定数
export const EVENT_TYPES = {
  EVENT_STATUS_CHANGED: 'event_status_changed',
  EVENT_ADDED: 'event_added',
  EVENT_DELETED: 'event_deleted'
};

export default eventBus;