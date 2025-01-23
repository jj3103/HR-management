// src/components/LeaveData.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Typography, List, Divider, Row, Col } from 'antd';
import '../css/LeaveData.css';  // Ensure this CSS file is created for custom styles

const { Title, Text } = Typography;

const LeaveData = ({ personnelId }) => {
    const [rank, setRank] = useState(null);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [daysSinceLastLeave, setDaysSinceLastLeave] = useState(null);
    const [leaveTypeCounts, setLeaveTypeCounts] = useState([]);
    const [currentlyOnLeave, setCurrentlyOnLeave] = useState('No');

    useEffect(() => {
        if (personnelId) {
            axios.get(`/leavemanagement/leavedata?personnelId=${personnelId}`)
                .then(response => {
                    const data = response.data;
                    setRank(data.rank);
                    setLeaveTypes(data.leaveTypes);
                    setDaysSinceLastLeave(data.daysSinceLastLeave);
                    setLeaveTypeCounts(data.leaveTypeCounts);
                    setCurrentlyOnLeave(data.currentlyOnLeave);
                })
                .catch(error => {
                    console.error('Error fetching leave data:', error);
                });
        }
    }, [personnelId]);

    return (
        <Card title="Leave Data" className="leave-data-card">
            <Row gutter={16}>
                <Col span={24}>
                    {rank && <Title level={4} className="data-title">Rank: <Text strong>{rank}</Text></Title>}
                    <Title level={5} className="data-info">Currently on Leave: <Text>{currentlyOnLeave}</Text></Title>
                    <Title level={5} className="data-info">Days Since Last Leave: <Text>{daysSinceLastLeave}</Text></Title>
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Leave Types" className="inner-card">
                        <List
                            itemLayout="horizontal"
                            dataSource={leaveTypes}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={`${item.leave_type}: ${item.leave_count}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Leave Counts by Type (Current Year)" className="inner-card">
                        <List
                            itemLayout="horizontal"
                            dataSource={leaveTypeCounts}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={`${item.leave_type}: ${item.leave_count}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default LeaveData;
