import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Tabs, Input, Select, Space, message } from 'antd';
import 'antd/dist/reset.css';
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

// Color scheme for a professional look
const colors = {
    primary: '#1C3879',     // Deep royal blue
    secondary: '#607D8B',   // Blue grey
    background: '#F0F4F8',  // Light blue-grey
    surface: '#FFFFFF',     // White
    text: '#37474F',        // Dark blue-grey
    accent: '#87CEEB',      // Light blue
    delete: '#D32F2F',      // Red for delete button
    edit: '#4B9F44',        // Green for edit button
};

const DisciplinaryTable = () => {
    const [disciplinaryActions, setDisciplinaryActions] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [textSearch, setTextSearch] = useState('');
    const [dateSearch, setDateSearch] = useState(null);
    const [filter, setFilter] = useState('all'); // Default to 'all'
    const [sorter, setSorter] = useState({ field: '', order: '' });

    useEffect(() => {
        axios.get('/api/disciplinary_action')
            .then(response => {
                setDisciplinaryActions(response.data);
            })
            .catch(error => {
                console.error('Error fetching disciplinary actions:', error);
                alert(`Error fetching disciplinary actions: ${error.message}`);
            });
    }, []);

    const handleShow = (action) => {
        setSelectedAction(action);
        setShow(true);
    };

    const handleDelete = (action_id, name, city, action_date, resolved_date) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the disciplinary action taken on ${name} on ${action_date}${resolved_date ? ` resolved on ${resolved_date}` : ''}?`
        );

        if (confirmDelete) {
            axios.delete(`/api/disciplinary_action/delete/${action_id}`)
                .then(response => {
                    setDisciplinaryActions(prev => prev.filter(action => action.action_id !== action_id));
                    message.success('Disciplinary action deleted successfully.'); // Show success message
                })
                .catch(error => {
                    console.error('Error deleting disciplinary action:', error);
                    message.error(`Error deleting disciplinary action: ${error.message}`); // Show error message
                });
        }
    };

    const handleClose = () => setShow(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedAction({
            ...selectedAction,
            [name]: value
        });
    };

    const handleUpdate = () => {
        const formattedAction = {
            ...selectedAction,
            action_date: selectedAction.action_date.split('T')[0],
            resolved_date: selectedAction.resolved_date ? selectedAction.resolved_date.split('T')[0] : null
        };

        axios.put(`/api/disciplinary_action/${selectedAction.action_id}`, formattedAction)
            .then(response => {
                setDisciplinaryActions(disciplinaryActions.map(action => (action.action_id === selectedAction.action_id ? formattedAction : action)));
                setShow(false);
                message.success('Disciplinary action updated successfully.'); // Show success message
            })
            .catch(error => {
                console.error('Error updating disciplinary action:', error);
                alert(`Error updating disciplinary action: ${error.message}`);
            });
    };

    const handleTextSearchChange = (e) => {
        setTextSearch(e.target.value);
    };

    const handleDateSearchChange = (date, dateString) => {
        setDateSearch(dateString);
    };

    const handleTabChange = (key) => {
        setFilter(key); // Update filter state when tab changes
    };

    const handleSortChange = (field) => {
        setSorter({
            field: field,
            order: sorter.order === 'ascend' ? 'descend' : 'ascend'
        });
    };

    const filteredData = disciplinaryActions
        .filter(action => filter === 'all' || action.status === filter)
        .filter(action => 
            action.first_name?.toLowerCase().includes(textSearch.toLowerCase()) ||
            action.last_name?.toLowerCase().includes(textSearch.toLowerCase()) ||
            action.action_type?.toLowerCase().includes(textSearch.toLowerCase()) ||
            action.description?.toLowerCase().includes(textSearch.toLowerCase()) ||
            action.remarks?.toLowerCase().includes(textSearch.toLowerCase())
        )
        .filter(action => !dateSearch || action.action_date.split('T')[0] === dateSearch)
        .sort((a, b) => {
            if (!sorter.field) return 0;
            const aValue = a[sorter.field] ?? '';
            const bValue = b[sorter.field] ?? '';
            if (aValue === null || aValue === undefined) return sorter.order === 'ascend' ? 1 : -1;
            if (bValue === null || bValue === undefined) return sorter.order === 'ascend' ? -1 : 1;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sorter.order === 'ascend'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return sorter.order === 'ascend'
                ? (aValue > bValue ? 1 : -1)
                : (aValue < bValue ? 1 : -1);
        })
        .map(action => ({
            key: action.action_id,
            personnel_id: action.personnel_id,
            name: `${action.first_name ?? ''} ${action.last_name ?? ''}`, // Combine first and last name with fallback
            action_date: action.action_date.split('T')[0],
            action_type: action.action_type ?? '',
            description: action.description ?? '',
            status: action.status ?? '',
            resolved_date: action.resolved_date ? action.resolved_date.split('T')[0] : '',
            remarks: action.remarks ?? '',
            actions: (
                <Space>
                    <Button type="primary" onClick={() => handleShow(action)} style={{ backgroundColor: colors.edit, borderColor: colors.edit }}>
                        <EditOutlined />
                    </Button>
                    <Button 
                        danger 
                        onClick={() => handleDelete(
                            action.action_id, 
                            `${action.first_name} ${action.last_name}`, 
                            action.city, 
                            action.action_date.split('T')[0], 
                            action.resolved_date ? action.resolved_date.split('T')[0] : null
                        )}
                        style={{ backgroundColor: colors.delete, borderColor: colors.delete }}
                    >
                        <DeleteOutlined />
                    </Button>
                </Space>
            )
        }));

        const titleStyle = {
            color: colors.primary,
            fontWeight: 'bold',
            fontSize: '16px', // Adjust the font size as needed
            letterSpacing: '0.5px', // Adds space between letters for better readability
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
            textTransform: 'uppercase', // Makes the text uppercase for a strong effect
        };
        
        const columns = [
            {
                title: <span style={titleStyle}>Personnel ID</span>,
                dataIndex: 'personnel_id',
                key: 'personnel_id',
                sorter: (a, b) => a.personnel_id - b.personnel_id,
            },
            {
                title: <span style={titleStyle}>Name</span>,
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => a.name.localeCompare(b.name),
            },
            {
                title: <span style={titleStyle}>Action Date</span>,
                dataIndex: 'action_date',
                key: 'action_date',
                sorter: (a, b) => new Date(a.action_date) - new Date(b.action_date),
            },
            {
                title: <span style={titleStyle}>Action Type</span>,
                dataIndex: 'action_type',
                key: 'action_type',
                sorter: (a, b) => a.action_type.localeCompare(b.action_type),
            },
            {
                title: <span style={titleStyle}>Description</span>,
                dataIndex: 'description',
                key: 'description',
                sorter: (a, b) => a.description.localeCompare(b.description),
            },
            {
                title: <span style={titleStyle}>Status</span>,
                dataIndex: 'status',
                key: 'status',
                sorter: (a, b) => a.status.localeCompare(b.status),
            },
            {
                title: <span style={titleStyle}>Resolved Date</span>,
                dataIndex: 'resolved_date',
                key: 'resolved_date',
                sorter: (a, b) => new Date(a.resolved_date) - new Date(b.resolved_date),
            },
            {
                title: <span style={titleStyle}>Remarks</span>,
                dataIndex: 'remarks',
                key: 'remarks',
                sorter: (a, b) => a.remarks.localeCompare(b.remarks),
            },
            {
                title: <span style={titleStyle}>Actions</span>,
                dataIndex: 'actions',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button
                            onClick={() => handleShow(record)}
                            icon={<EditOutlined />}
                            style={{ backgroundColor: colors.edit, color: colors.surface }} // Set background color for the edit button
                        />
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id, record.name, record.posted_to, record.start_date, record.end_date)}
                            style={{ backgroundColor: colors.delete, color: colors.surface }} // Set background color for the delete button
                        />
                    </Space>
                ),
            },
        ].map(col => ({
            ...col,
            title: (
                <div>
                    {col.title}
                    <Space>
                        <Button onClick={() => handleSortChange(col.dataIndex)} icon={sorter.order === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />} />
                    </Space>
                </div>
            ),
        }));
        

    return (
        <div style={{ padding: '20px', backgroundColor: colors.background }}>
            <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Disciplinary Action Details</h1>
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by text"
                    value={textSearch}
                    onChange={handleTextSearchChange}
                    style={{ marginRight: 16 }}
                    prefix={<SearchOutlined />}
                />
            </div>
            <Tabs
                defaultActiveKey="all"
                type="card"
                onChange={handleTabChange}
                style={{ marginBottom: 20 }}
            >
                <TabPane 
                    tab={<span style={{ fontSize: '16px', fontWeight: filter === 'all' ? 'bold' : 'normal' }}>All</span>} 
                    key="all" 
                    style={filter === 'all' ? { backgroundColor: colors.primary, color: colors.surface } : {}}
                />
                <TabPane 
                    tab={<span style={{ fontSize: '16px', fontWeight: filter === 'Resolved' ? 'bold' : 'normal' }}>Resolved</span>} 
                    key="Resolved" 
                    style={filter === 'Resolved' ? { backgroundColor: colors.primary, color: colors.surface } : {}}
                />
                <TabPane 
                    tab={<span style={{ fontSize: '16px', fontWeight: filter === 'Unresolved' ? 'bold' : 'normal' }}>Unresolved</span>} 
                    key="Unresolved" 
                    style={filter === 'Unresolved' ? { backgroundColor: colors.primary, color: colors.surface } : {}}
                />
            </Tabs>
            <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 50 }} />

            <Modal
                title={<span style={{ backgroundColor: colors.primary, color: colors.surface }}>{`Update Disciplinary Action`}</span>}
                visible={show}
                onOk={handleUpdate}
                onCancel={handleClose}
                footer={[
                    <Button key="cancel" onClick={handleClose}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleUpdate} style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
                        Update
                    </Button>
                ]}
            >
                {selectedAction && (
                    <Form layout="vertical">
                        <Form.Item label="Action Date" required>
                            <Input 
                                type="date" 
                                name="action_date" 
                                value={selectedAction.action_date.split('T')[0]} 
                                onChange={handleChange} 
                            />
                        </Form.Item>
                        <Form.Item label="Action Type" required>
                            <Input 
                                type="text" 
                                name="action_type" 
                                value={selectedAction.action_type} 
                                onChange={handleChange} 
                                placeholder="Enter action type"
                            />
                        </Form.Item>
                        <Form.Item label="Description" required>
                            <Input 
                                type="text" 
                                name="description" 
                                value={selectedAction.description} 
                                onChange={handleChange} 
                                placeholder="Enter description"
                            />
                        </Form.Item>
                        <Form.Item label="Status" required>
                            <Select 
                                name="status" 
                                value={selectedAction.status} 
                                onChange={(value) => setSelectedAction({ ...selectedAction, status: value })}
                            >
                                <Option value="Resolved">Resolved</Option>
                                <Option value="Unresolved">Unresolved</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Resolved Date">
                            <Input 
                                type="date" 
                                name="resolved_date" 
                                value={selectedAction.resolved_date ? selectedAction.resolved_date.split('T')[0] : ''} 
                                onChange={handleChange} 
                            />
                        </Form.Item>
                        <Form.Item label="Remarks">
                            <Input 
                                type="text" 
                                name="remarks" 
                                value={selectedAction.remarks} 
                                onChange={handleChange} 
                                placeholder="Enter remarks"
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default DisciplinaryTable;
