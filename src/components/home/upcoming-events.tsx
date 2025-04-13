import React, { useState, useEffect } from 'react';
import { Card, List, Button, Form, Input, DatePicker, message, Modal } from 'antd';
import { CalendarOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import EventCard from '../event/event-card';
import eventBus, { EVENT_TYPES } from '../../utils/event-bus';
import { UpcomingEventsSkeleton } from '../layout//loading-animation';

// axios のデバッグインターセプター
axios.interceptors.request.use(request => {
  console.log('リクエスト:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('レスポンス:', response);
    return response;
  },
  error => {
    console.log('エラー:', error);
    return Promise.reject(error);
  }
);

// Rails のCSRF対策に対応するコード
// CSRFトークンを取得する関数
const getCSRFToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    if (tokenElement) {
        return tokenElement.getAttribute('content');
    }
    return null;
};

// Axiosのデフォルト設定にCSRFトークンを追加
axios.defaults.headers.common['X-CSRF-Token'] = getCSRFToken();

// APIクライアントの修正
const api = {
    getEvents: async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/events');
            return response.data;
        } catch (error) {
            console.error('イベント取得エラー:', error);
            throw error;
        }
    },

    addEvent: async (eventData: any) => {
        try {
            const response = await axios.post('http://localhost:3000/api/events', eventData);
            return response.data;
        } catch (error) {
            console.error('イベント追加エラー:', error);
            throw error;
        }
    },

    updateEventStatus: async (id: string, status: string) => {
        try {
            const response = await axios.patch(`http://localhost:3000/api/events/${id}`, {
                event: { status }
            });
            return response.data;
        } catch (error) {
            console.error('イベントステータス更新エラー:', error);
            throw error;
        }
    },

    deleteEvent: async (id: string) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/events/${id}`);
            return response.data;
        } catch (error) {
            console.error('イベント削除エラー:', error);
            throw error;
        }
    }
};

// イベントの型定義
interface Event {
    id: string;
    title: string;
    date: string;
    description?: string;
    status: 'upcoming' | 'in_progress' | 'completed';
}


const UpcomingEvents = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // データ取得
    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const data = await api.getEvents();
            
            // データ形式の変換とフィルタリング（statusが'upcoming'のイベントのみ）
            const formattedEvents = data
                .filter((event: any) => event.status === 'upcoming' || !event.status)
                .map((event: any) => ({
                    id: event.id.toString(),
                    title: event.title,
                    date: dayjs(event.date).format('YYYY-MM-DD HH:mm'),
                    description: event.description,
                    status: event.status || 'upcoming'
                }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('イベント取得エラー:', error);
            message.error('イベントの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // コンポーネントマウント時にデータを取得し、イベントリスナーを設定
    useEffect(() => {
        fetchEvents();
        
        // イベントリスナーを追加
        eventBus.on(EVENT_TYPES.EVENT_STATUS_CHANGED, fetchEvents);
        eventBus.on(EVENT_TYPES.EVENT_DELETED, fetchEvents);
        
        // クリーンアップ関数
        return () => {
            eventBus.off(EVENT_TYPES.EVENT_STATUS_CHANGED, fetchEvents);
            eventBus.off(EVENT_TYPES.EVENT_DELETED, fetchEvents);
        };
    }, []);

    // イベント追加処理
    const handleAddEvent = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    // モーダル送信処理の修正（イベント追加時にも通知）
    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();

            const eventData = {
                event: {
                    title: values.title,
                    date: values.date.format(),
                    description: values.description || '',
                    status: 'upcoming'  // デフォルトは「次の予定」
                }
            };

            setIsLoading(true);
            const newEvent = await api.addEvent(eventData);

            // 新しいイベントをリストに追加
            setEvents([...events, {
                id: newEvent.id.toString(),
                title: newEvent.title,
                date: dayjs(newEvent.date).format('YYYY-MM-DD HH:mm'),
                description: newEvent.description,
                status: newEvent.status || 'upcoming'
            }]);

            message.success('イベントを追加しました');
            form.resetFields();
            setIsModalVisible(false);
            
            // イベント追加を通知
            eventBus.emit(EVENT_TYPES.EVENT_ADDED);
        } catch (error) {
            console.error('イベント追加エラー:', error);
            message.error('イベントの追加に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // イベントステータス変更処理の修正
    const handleChangeStatus = async (id: string, newStatus: 'upcoming' | 'in_progress' | 'completed') => {
        try {
            setIsLoading(true);
            await api.updateEventStatus(id, newStatus);
            
            // ステータスが変更されたイベントをリストから削除
            setEvents(events.filter(event => event.id !== id));
            message.success('イベントを取り込み中に移動しました');
            
            // ステータス変更を通知
            eventBus.emit(EVENT_TYPES.EVENT_STATUS_CHANGED);
        } catch (error) {
            console.error('イベントステータス変更エラー:', error);
            message.error('イベントの状態変更に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // イベント削除処理の修正
    const handleDeleteEvent = async (id: string) => {
        try {
            setIsLoading(true);
            await api.deleteEvent(id);
            setEvents(events.filter(event => event.id !== id));
            message.success('イベントを削除しました');
            
            // 削除を通知
            eventBus.emit(EVENT_TYPES.EVENT_DELETED);
        } catch (error) {
            console.error('イベント削除エラー:', error);
            message.error('イベントの削除に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            style={{ height: '100%' }}
            headStyle={{ padding: '8px 16px' }}
            bodyStyle={{ padding: '0 1rem', overflowY: 'auto', maxHeight: 'calc(100% - 56px)' }}
            title={
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <CalendarOutlined />
                    <span>次の予定</span>
                </div>
            }
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddEvent}
                    size="small"
                    style={{
                        padding: '12px 5px',
                        borderRadius: '8px',
                    }}
                >
                    追加
                </Button>
            }
        >
            {isLoading ? (
                <List
                    itemLayout="horizontal"
                    dataSource={Array.from({ length: 3 }).map((_, i) => i)}
                    renderItem={() => (
                        <List.Item>
                            <UpcomingEventsSkeleton />
                        </List.Item>
                    )}
                />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={events}
                    locale={{ emptyText: 'イベントがありません' }}
                    renderItem={event => (
                        <EventCard
                            event={event}
                            onDelete={handleDeleteEvent}
                            onChangeStatus={handleChangeStatus}
                            nextStatus="in_progress"
                            nextStatusButtonText=""  // テキストを空に
                            nextStatusButtonIcon={<CheckOutlined />}  // チェックマークアイコンのみ
                        />
                    )}
                />
            )}

            {/* イベント追加モーダル */}
            <Modal
                title="イベントを追加"
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText="保存"
                cancelText="キャンセル"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="イベント名"
                        rules={[{ required: true, message: 'イベント名を入力してください' }]}
                    >
                        <Input placeholder="イベント名を入力" />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="日時"
                        rules={[{ required: true, message: '日時を選択してください' }]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="日時を選択"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="説明"
                    >
                        <Input.TextArea rows={3} placeholder="説明を入力（任意）" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UpcomingEvents;