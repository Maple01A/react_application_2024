import { Col, Row } from 'antd';
import { DealsChart, UpcomingEvents, OverEvents } from '../../components';
import React from 'react';


export const Home = () => {
    return (
        <div>
            <Row
                gutter={[32, 32]}
                style={{
                    marginTop: '32px',
                    marginLeft: '32px',
                    marginRight: '32px',
                    marginBottom: '32px',
                }}>
                <Col
                    xs={24}
                    sm={24}
                    xl={8}
                    style={{
                        height: '460px',
                    }}>
                    <UpcomingEvents />
                </Col>
                <Col
                    xs={24}
                    sm={24}
                    xl={8}
                    style={{
                        height: '460px',
                    }}>
                    <DealsChart />
                </Col>
                <Col
                    xs={24}
                    sm={24}
                    xl={8}
                    style={{
                        height: '460px',
                    }}>
                    <OverEvents/>
                </Col>
            </Row>
        </div>

    )
}