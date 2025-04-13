import React from 'react';
import { List, Typography, Button, Space, Popconfirm } from 'antd';
import { CalendarOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

// イベントの型定義
interface Event {
    id: string;
    title: string;
    date: string;
    description?: string;
    status: 'upcoming' | 'in_progress' | 'completed';
}

interface EventCardProps {
    event: Event;
    onDelete: (id: string) => void;
    onChangeStatus?: (id: string, newStatus: 'upcoming' | 'in_progress' | 'completed') => void;
    showStatusChangeButton?: boolean;
    nextStatus?: 'in_progress' | 'completed';
    nextStatusButtonText?: string;
    nextStatusButtonIcon?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    onDelete,
    onChangeStatus,
    showStatusChangeButton = true,
    nextStatus,
    nextStatusButtonText,
    nextStatusButtonIcon = <CheckOutlined />
}) => {
    return (
        <List.Item
            actions={[
                // ステータス変更ボタン（設定されている場合のみ表示）
                showStatusChangeButton && nextStatus && onChangeStatus && (
                    <Button
                        type="primary"
                        icon={nextStatusButtonIcon}
                        size="small"
                        shape="circle"  // 円形のボタンに変更
                        onClick={() => onChangeStatus(event.id, nextStatus)}
                        title={nextStatusButtonText || "完了"} // ツールチップとしてテキストを表示
                    />
                ),
                // 削除ボタン
                <Popconfirm
                    title="このイベントを削除しますか？"
                    onConfirm={() => onDelete(event.id)}
                    okText="はい"
                    cancelText="いいえ"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        shape="circle"  // 円形のボタンに変更
                        title="削除"  // ツールチップを追加
                    />
                </Popconfirm>
            ].filter(Boolean)} // nullやundefinedを除去
        >
            <List.Item.Meta
                title={event.title}
                description={
                    <Space direction="vertical" size={0}>
                        <Typography.Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {event.date}
                        </Typography.Text>
                        {event.description && (
                            <Typography.Text type="secondary">
                                {event.description}
                            </Typography.Text>
                        )}
                    </Space>
                }
            />
        </List.Item>
    );
};

export default EventCard;