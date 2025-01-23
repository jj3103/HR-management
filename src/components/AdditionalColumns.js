import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, message, Card, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, ClearOutlined, EditOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/AdditionalColumns.css';

const { Option } = Select;

const DatabaseManagement = () => {
    const [columns, setColumns] = useState([]);
    const [deleteColumns, setDeleteColumns] = useState([]);
    const [selectedTableForDelete, setSelectedTableForDelete] = useState('');
    const [ranks, setRanks] = useState([]);
    const [action, setAction] = useState('add'); // New state for action

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            const response = await axios.get('/ranks');
            setRanks(response.data);
        } catch (error) {
            console.error('Error fetching ranks:', error);
            message.error('Error fetching ranks');
        }
    };

    const fetchColumns = async (tableName) => {
        try {
            const response = await axios.get(`/columns?tableName=${tableName}`);
            setDeleteColumns(response.data);
        } catch (error) {
            console.error('Error fetching columns:', error);
            message.error('Error fetching columns');
        }
    };

    const handleSubmit = async (values) => {
        const { columnName, dataType, tableName } = values;

        const sanitizedColumnName = columnName
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();

        const data = {
            columnName: sanitizedColumnName,
            dataType
        };

        let endpoint = '';
        switch (tableName) {
            case 'AdditionalPersonnel':
                endpoint = 'additional/add';
                break;
            case 'AdditionalWife':
                endpoint = 'additional/wife';
                break;
            case 'AdditionalChild':
                endpoint = 'additional/child';
                break;
            default:
                message.error('Invalid table name');
                return;
        }

        try {
            const response = await axios.post(endpoint, data);
            message.success(response.data.message);
            setColumns([...columns, { columnName: sanitizedColumnName, dataType }]);
        } catch (error) {
            console.error('There was an error adding the column:', error);
            message.error('Error adding column');
        }
    };

    const handleClear = () => {
        setColumns([]);
    };

    const handleDeleteTableChange = (value) => {
        setSelectedTableForDelete(value);
        fetchColumns(value);
    };

    const handleDeleteSubmit = async (values) => {
        const { deleteColumn, tableName } = values;

        try {
            const response = await axios.post('/delete-column', { columnName: deleteColumn, tableName });
            message.success(response.data.message);
            setDeleteColumns(deleteColumns.filter(col => col.Field !== deleteColumn));
        } catch (error) {
            console.error('Error deleting column:', error);
            message.error('Error deleting column');
        }
    };

    const handleRankSubmit = async (values) => {
        const { rankName, action, rankId } = values;

        try {
            let response;
            if (action === 'add') {
                response = await axios.post('/ranks', { rankName });
                message.success('Rank added successfully');
                setRanks([...ranks, response.data]);
            } else if (action === 'edit') {
                response = await axios.put(`/ranks/${rankId}`, { rankName });
                message.success('Rank updated successfully');
                setRanks(ranks.map(rank => rank.id === rankId ? { ...rank, rank_name: rankName } : rank));
            } else if (action === 'delete') {
                response = await axios.delete(`/ranks/${rankId}`);
                message.success('Rank deleted successfully');
                setRanks(ranks.filter(rank => rank.id !== rankId));
            }
        } catch (error) {
            console.error('Error managing rank:', error);
            message.error('Error managing rank');
        }
    };

    return (
        <div className="database-management-container container-fluid py-5 bg-light">
            <h1 className="text-center mb-5 text-primary">Manage Database</h1>
            <Row gutter={32}>
                <Col xs={24} lg={8}>
                    <Card 
                        title={<h2 className="text-success"><PlusOutlined /> Add Additional Columns</h2>}
                        className="mb-4 shadow-sm"
                        headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '2px solid #1890ff' }}
                    >
                        <Form layout="vertical" onFinish={handleSubmit} className="p-3">
                            <Form.Item
                                label={<span className="text-dark">Column Name</span>}
                                name="columnName"
                                rules={[{ required: true, message: 'Please input the column name!' }]}
                            >
                                <Input placeholder="Enter column name" className="rounded-pill" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-dark">Data Type</span>}
                                name="dataType"
                                rules={[{ required: true, message: 'Please select the data type!' }]}
                            >
                                <Select placeholder="Select data type" className="rounded-pill">
                                    <Option value="VARCHAR(255)">Text (VARCHAR)</Option>
                                    <Option value="INT">Number (INT)</Option>
                                    <Option value="DATE DEFAULT NULL">Date (DATE)</Option>
                                    <Option value="DATETIME">Date & Time (DATETIME)</Option>
                                    <Option value="TIMESTAMP">Timestamp (TIMESTAMP)</Option>
                                    <Option value="FLOAT">Decimal (FLOAT)</Option>
                                    <Option value="DOUBLE">Double Precision (DOUBLE)</Option>
                                    <Option value="DECIMAL">Exact Decimal (DECIMAL)</Option>
                                    <Option value="TEXT">Large Text (TEXT)</Option>
                                    <Option value="BOOLEAN">True/False (BOOLEAN)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-dark">Table Name</span>}
                                name="tableName"
                                rules={[{ required: true, message: 'Please select the table name!' }]}
                            >
                                <Select placeholder="Select table name" className="rounded-pill">
                                    <Option value="AdditionalPersonnel">Personnel</Option>
                                    <Option value="AdditionalWife">Wife Details</Option>
                                    <Option value="AdditionalChild">Child Details</Option>
                                </Select>
                            </Form.Item>

                            <Divider className="bg-primary" />

                            <Form.Item className="text-center">
                                <Button type="primary" htmlType="submit" className="me-2 rounded-pill">
                                    <PlusOutlined /> Create Column
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card 
                        title={<h2 className="text-danger"><DeleteOutlined /> Delete Existing Columns</h2>}
                        className="mb-4 shadow-sm"
                        headStyle={{ backgroundColor: '#fff0f0', borderBottom: '2px solid #ff4d4f' }}
                    >
                        <Form layout="vertical" onFinish={handleDeleteSubmit} className="p-3">
                            <Form.Item
                                label={<span className="text-dark">Select Table</span>}
                                name="tableName"
                                rules={[{ required: true, message: 'Please select the table name!' }]}
                            >
                                <Select placeholder="Select table name" onChange={handleDeleteTableChange} className="rounded-pill">
                                    <Option value="AdditionalPersonnel">Personnel</Option>
                                    <Option value="AdditionalWife">Wife Details</Option>
                                    <Option value="AdditionalChild">Child Details</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-dark">Select Column</span>}
                                name="deleteColumn"
                                rules={[{ required: true, message: 'Please select the column to delete!' }]}
                            >
                                <Select placeholder="Select a column to delete" className="rounded-pill">
                                    {deleteColumns.map((col, index) => (
                                        <Option key={index} value={col.Field}>
                                            {col.Field}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item className="text-center">
                                <Button type="danger" htmlType="submit" className="rounded-pill">
                                    <DeleteOutlined /> Delete Column
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <Divider className="my-5" />

            <Row gutter={32}>
                <Col xs={24} lg={12}>
                    <Card 
                        title={<h2 className="text-success"><EditOutlined /> Manage Ranks</h2>}
                        className="mb-4 shadow-sm"
                        headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '2px solid #1890ff' }}
                    >
                        <Form layout="vertical" onFinish={handleRankSubmit} className="p-3">
                            <Form.Item
                                label={<span className="text-dark">Action</span>}
                                name="action"
                                rules={[{ required: true, message: 'Please select an action!' }]}
                            >
                                <Select onChange={setAction} className="rounded-pill">
                                    <Option value="add">Add Rank</Option>
                                    <Option value="edit">Edit Rank</Option>
                                    <Option value="delete">Delete Rank</Option>
                                </Select>
                            </Form.Item>

                            {action !== 'delete' && (
                                <Form.Item
                                    label={<span className="text-dark">Rank Name</span>}
                                    name="rankName"
                                    rules={[{ required: action !== 'delete', message: 'Please input the rank name!' }]}
                                >
                                    <Input placeholder="Enter rank name" className="rounded-pill" />
                                </Form.Item>
                            )}

                            {action !== 'add' && (
                                <Form.Item
                                    label={<span className="text-dark">Select Rank to Edit/Delete</span>}
                                    name="rankId"
                                    rules={[{ required: action !== 'add', message: 'Please select a rank!' }]}
                                >
                                    <Select placeholder="Select rank" className="rounded-pill">
                                        {ranks.map(rank => (
                                            <Option key={rank.id} value={rank.id}>
                                                {rank.rank_name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            <Form.Item className="text-center">
                                <Button type="primary" htmlType="submit" className="rounded-pill">
                                    {action === 'add' ? <PlusOutlined /> : action === 'edit' ? <EditOutlined /> : <DeleteOutlined />} 
                                    {action.charAt(0).toUpperCase() + action.slice(1)} Rank
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DatabaseManagement;
