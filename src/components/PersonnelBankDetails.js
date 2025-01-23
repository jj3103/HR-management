import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message, Image, Form, Input } from 'antd';
import axios from 'axios';
import { EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const PersonnelBankDetails = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get('/bank/bank-details');
      const data = response.data;

      const bankDetailsData = await Promise.all(
        data.map(async (e) => {
          try {
            const photoResponse = await axios.get(`/personnel/photo/${e.service_number}`);
            const photo = photoResponse.data.photo || null;
            return { ...e, photo }; // Assign the photo from the response
          } catch (photoError) {
            console.error(`Error fetching photo for service number ${e.service_number}:`, photoError);
            return { ...e, photo: null }; // Handle error by setting photo to null
          }
        })
      );

      setBankDetails(bankDetailsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      message.error('Failed to fetch bank details');
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/bank/bank-details/${id}`);
      message.success('Bank detail deleted successfully');
      fetchBankDetails();
    } catch (error) {
      console.error('Error deleting bank detail:', error);
      message.error('Failed to delete bank detail');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRecord(null);
    form.resetFields();
  };

  const handleUpdate = async (values) => {
    try {
      await axios.put(`/bank/bank-details/${selectedRecord.bank_id}`, values);
      message.success('Bank detail updated successfully');
      fetchBankDetails();
      handleModalCancel();
    } catch (error) {
      console.error('Error updating bank detail:', error);
      message.error('Failed to update bank detail');
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

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
        title: <span style={titleStyle}>Photo</span>,
        dataIndex: 'photo',
        key: 'photo',
        render: (photo) => (
            photo ? (
                <Image
                    src={`http://localhost:5000/uploads/${photo}`}
                    alt="Personnel"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ""; // Clear src if image fails to load
                    }}
                />
            ) : (
                <UserOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
            )
        ),
    },
    {
        title: <span style={titleStyle}>Service Number</span>,
        dataIndex: 'service_number',
        key: 'service_number',
        sorter: (a, b) => a.service_number.localeCompare(b.service_number),
        ...getColumnSearchProps('service_number'),
    },
    {
        title: <span style={titleStyle}>Name</span>,
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps('name'),
    },
    {
        title: <span style={titleStyle}>Single Account Number</span>,
        dataIndex: 'single_ac_no',
        key: 'single_ac_no',
        sorter: (a, b) => a.single_ac_no - b.single_ac_no, // Numerical comparison
    },
    {
        title: <span style={titleStyle}>Single Account Bank Name</span>,
        dataIndex: 'single_ac_bank_name',
        key: 'single_ac_bank_name',
        sorter: (a, b) => a.single_ac_bank_name.localeCompare(b.single_ac_bank_name),
        ...getColumnSearchProps('single_ac_bank_name'),
    },
    {
        title: <span style={titleStyle}>Joint Account Number</span>,
        dataIndex: 'joint_ac_no',
        key: 'joint_ac_no',
        sorter: (a, b) => (a.joint_ac_no || 0) - (b.joint_ac_no || 0), // Handle undefined or null as 0
    },
    {
        title: <span style={titleStyle}>Joint Account Bank Name</span>,
        dataIndex: 'joint_ac_bank_name',
        key: 'joint_ac_bank_name',
        sorter: (a, b) => a.joint_ac_bank_name.localeCompare(b.joint_ac_bank_name),
        ...getColumnSearchProps('joint_ac_bank_name'),
    },
    {
        title: <span style={titleStyle}>Actions</span>,
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.bank_id)} danger />
            </Space>
        ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
  <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Bank Details</h1>
</div>
      <Table
        columns={columns}
        dataSource={bankDetails}
        rowKey="bank_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Edit Bank Details"
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Save
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Service Number"
            name="service_number"
            rules={[{ required: true, message: 'Please input the service number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Single Account Number"
            name="single_ac_no"
            rules={[{ required: true, message: 'Please input the single account number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Single Account Bank Name"
            name="single_ac_bank_name"
            rules={[{ required: true, message: 'Please input the single account bank name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Joint Account Number"
            name="joint_ac_no"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Joint Account Bank Name"
            name="joint_ac_bank_name"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonnelBankDetails;
