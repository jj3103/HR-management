import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, Table, Typography, Alert, Space, Card, Select, Divider } from 'antd';
import { UserAddOutlined, UsergroupAddOutlined, UserOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const ManageAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [personnel, setPersonnel] = useState([]);
    const [serviceNumber, setServiceNumber] = useState('');
    const [role, setRole] = useState('admin');
    const [admins, setAdmins] = useState([]);
    const [active, setActive] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [names, setNames] = useState({});
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [deleteServiceNumber, setDeleteServiceNumber] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const storedRole = localStorage.getItem('role');
            if (!isLoggedIn) {
                navigate('/login');
            } else {
                setUserRole(storedRole);
            }
        };
        checkAccess();
    }, [navigate]);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get('/users/getadmins');
                setAdmins(response.data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        const fetchActiveAdmins = async () => {
            try {
                const response = await axios.get('/users/active');
                const activeAdmins = response.data;

                const namesData = await Promise.all(
                    activeAdmins.map(async (admin) => {
                        const nameResponse = await axios.get(`/api/getname/${admin.service_number}`);
                        return { service_number: admin.service_number, name: nameResponse.data[0] };
                    })
                );

                const namesMap = namesData.reduce((acc, item) => {
                    acc[item.service_number] = `${item.name.first_name} ${item.name.last_name}`;
                    return acc;
                }, {});

                setActive(activeAdmins);
                setNames(namesMap);
            } catch (error) {
                console.error('Error fetching active admins:', error);
            }
        };

        fetchAdmins();
        fetchActiveAdmins();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            axios.get(`/personnelsearch?searchTerm=${searchTerm}`)
                .then(response => {
                    setPersonnel(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the personnel data!', error);
                });
        } else {
            setPersonnel([]);
        }
    }, [searchTerm]);

    const handlePersonnelSelect = (selectedPersonnel) => {
        setServiceNumber(selectedPersonnel.service_number);
    };

    const handleCreateAdmin = async (values) => {
        const { email, password, confirmPassword } = values;

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('/users/register', { serviceNumber, email, password, role });
            toast.success('Admin created successfully!');
            setSearchTerm('');
            setPersonnel([]);
            setServiceNumber('');

            const updatedAdmins = await axios.get('/users/getadmins');
            setAdmins(updatedAdmins.data);

        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error('Failed to create admin');
        }
    };

    const handleDelete = (service_number) => {
        setDeleteServiceNumber(service_number);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/users/delete/${deleteServiceNumber}`);
            toast.success('Admin deleted successfully!');
            
            // Refresh the list after deletion
            const updatedAdmins = await axios.get('/users/getadmins');
            setAdmins(updatedAdmins.data);

        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Failed to delete admin');
        } finally {
            setIsDeleteModalVisible(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalVisible(false);
        setDeleteServiceNumber(null);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'service_number',
            key: 'name',
            render: (service_number) => (
                <span style={{ fontWeight: 'bold' }}>{names[service_number]}</span>
            ),
        },
        {
            title: 'Service Number',
            dataIndex: 'service_number',
            key: 'service_number',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span
                    style={{
                        backgroundColor: status === 'active' ? '#d4edda' : '#f8d7da',
                        color: status === 'active' ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        border: status === 'active' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {status === 'active' ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.service_number)}
                >
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <ToastContainer />
            <Title level={2}>Manage Admin</Title>
            {userRole !== 'superadmin' && (
                <Alert message="You do not have access to create admins." type="warning" showIcon />
            )}
            {userRole === 'superadmin' && (
                <Tabs defaultActiveKey="activeAdmins">
                    <TabPane
                        tab={
                            <span>
                                <UsergroupAddOutlined />
                                Active Admins
                            </span>
                        }
                        key="activeAdmins"
                    >
                        <Title level={3}>Active Admins</Title>
                        <Divider />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {active.map(admin => (
                                <Card
                                    key={admin.id}
                                    style={{ width: 300 }}
                                    actions={[<UserOutlined key="user" />]}
                                >
                                    <Card.Meta
                                        title={names[admin.service_number] || 'Loading...'}
                                        description={
                                            <Space direction="vertical">
                                                <Text type="secondary">Service Number: {admin.service_number}</Text>
                                                <Text type="secondary">Email: {admin.email}</Text>
                                            </Space>
                                        }
                                    />
                                </Card>
                            ))}
                        </div>
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <UserAddOutlined />
                                Create Admin
                            </span>
                        }
                        key="createAdmin"
                    >
                        <Title level={3}>Create Admin</Title>
                        <Form onFinish={handleCreateAdmin} layout="vertical">
                            <Form.Item label="Search Personnel">
                                <Input
                                    prefix={<SearchOutlined />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or service number"
                                />
                            </Form.Item>
                            <div style={{ marginBottom: '16px' }}>
                                {personnel.map((p) => (
                                    <div key={p.personnel_id} style={{ marginBottom: '8px' }}>
                                        <Radio
                                            name="selectedPersonnel"
                                            value={p.personnel_id}
                                            onChange={() => handlePersonnelSelect(p)}
                                            checked={serviceNumber === p.service_number}
                                        >
                                            <span>{p.first_name} {p.last_name}</span>
                                            <span style={{ marginLeft: '8px', color: '#888' }}>({p.service_number})</span>
                                        </Radio>
                                    </div>
                                ))}
                            </div>
                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input the email address!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'The input is not a valid email!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input the password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Confirm Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please confirm the password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item label="Role">
                                <Select value={role} onChange={(value) => setRole(value)}>
                                    <Option value="admin">Admin</Option>
                                    <Option value="superadmin">Super Admin</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Create Admin
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <UserAddOutlined />
                                Admins List
                            </span>
                        }
                        key="adminsList"
                    >
                        <Title level={3}>Admins List</Title>
                        <Table columns={columns} dataSource={admins} rowKey="id" />
                    </TabPane>
                </Tabs>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={isDeleteModalVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this admin?</p>
            </Modal>
        </div>
    );
};

export default ManageAdmin;
