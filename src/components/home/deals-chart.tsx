import React, { useState, useEffect } from 'react';
import { Card, List, message } from 'antd';
import { ClockCircleOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import EventCard from '../event/event-card';
import { UpcomingEventsSkeleton } from '..//layout//loading-animation';
import eventBus, { EVENT_TYPES } from '../../utils/event-bus';

// イベントの型定義
interface Event {
    id: string;
    title: string;
    date: string;
    description?: string;
    status: 'upcoming' | 'in_progress' | 'completed';
}

// APIクライアント
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

const InProgressEvents = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);

    // データ取得
    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const data = await api.getEvents();
            
            // 取り込み中のイベントのみフィルタリング
            const formattedEvents = data
                .filter((event: any) => event.status === 'in_progress')
                .map((event: any) => ({
                    id: event.id.toString(),
                    title: event.title,
                    date: dayjs(event.date).format('YYYY-MM-DD HH:mm'),
                    description: event.description,
                    status: event.status
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
        eventBus.on(EVENT_TYPES.EVENT_ADDED, fetchEvents);
        
        // クリーンアップ関数
        return () => {
            eventBus.off(EVENT_TYPES.EVENT_STATUS_CHANGED, fetchEvents);
            eventBus.off(EVENT_TYPES.EVENT_DELETED, fetchEvents);
            eventBus.off(EVENT_TYPES.EVENT_ADDED, fetchEvents);
        };
    }, []);

    // イベントステータス変更処理
    const handleChangeStatus = async (id: string, newStatus: 'upcoming' | 'in_progress' | 'completed') => {
        try {
            setIsLoading(true);
            await api.updateEventStatus(id, newStatus);
            
            // ステータスが変更されたイベントをリストから削除
            setEvents(events.filter(event => event.id !== id));
            message.success('イベントを完了済みに移動しました');
            
            // ステータス変更を通知
            eventBus.emit(EVENT_TYPES.EVENT_STATUS_CHANGED);
        } catch (error) {
            console.error('イベントステータス変更エラー:', error);
            message.error('イベントの状態変更に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // イベント削除処理
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
                    <ClockCircleOutlined />
                    <span>取り込み中</span>
                </div>
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
                    locale={{ emptyText: '取り込み中のイベントがありません' }}
                    renderItem={event => (
                        <EventCard
                            event={event}
                            onDelete={handleDeleteEvent}
                            onChangeStatus={handleChangeStatus}
                            nextStatus="completed"
                            nextStatusButtonText=""  // テキストを空に
                            nextStatusButtonIcon={<CheckOutlined />}  // チェックマークアイコンのみ
                        />
                    )}
                />
            )}
        </Card>
    );
};

export default InProgressEvents;