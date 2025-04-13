import React from 'react';

export const UpcomingEventsSkeleton = () => {
    return (
        <div style={{ width: '100%' }}>
            <div style={{ width: '60%', height: 20, background: '#f5f5f5', marginBottom: 8 }} />
            <div style={{ width: '40%', height: 16, background: '#f9f9f9', marginBottom: 4 }} />
            <div style={{ width: '70%', height: 16, background: '#f9f9f9' }} />
        </div>
    );
};