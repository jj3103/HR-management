import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Select, InputNumber, Modal, notification, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../css/LeaveManagement.css'; // Custom CSS file for additional styling

const { Option } = Select;

const LeaveManagement = () => {
  const [form] = Form.useForm();
  const [leaves, setLeaves] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchLeaves(), fetchRanks()]);
      } catch (error) {
        notification.error({
          message: 'Data Fetch Error',
          description: 'There was an error fetching data. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leave_types');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await axios.get('/api/promotion/posts');
      setRanks(response.data);
    } catch (error) {
      console.error('Error fetching ranks:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingRecord) {
        await axios.put(`/api/leave_types/${editingRecord.id}`, values);
        notification.success({
          message: 'Leave Updated',
          description: 'Leave type updated successfully.',
        });
        setEditingRecord(null);
      } else {
        await axios.post('/api/leave_types', values);
        notification.success({
          message: 'Leave Added',
          description: 'New leave type added successfully.',
        });
      }
      fetchLeaves(); // Refresh leave data after submitting
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Submission Error',
        description: 'There was an error submitting the form. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      rank: record.rank,
      leave_type: record.leave_type,
      leave_count: record.leave_count,
    });
    setEditingRecord(record);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/leave_types/${deleteRecordId}`);
      notification.success({
        message: 'Leave Deleted',
        description: 'Leave type deleted successfully.',
      });
      fetchLeaves(); // Refresh leave data after deletion
      setDeleteVisible(false);
      setDeleteRecordId(null);
    } catch (error) {
      notification.error({
        message: 'Deletion Error',
        description: 'There was an error deleting the leave type. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
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

  const handleCancelEdit = () => {
    form.resetFields();
    setEditingRecord(null); // Reset editing record state
  };

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leave_type',
      key: 'leave_type',
    },
    {
      title: 'Leave Count',
      dataIndex: 'leave_count',
      key: 'leave_count',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            onClick={() => handleEdit(record)} 
            type="primary" 
            icon={<EditOutlined />} 
            style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', color: '#fff', marginRight: 8 }} // Green for edit
          >
            
          </Button>
          <Button 
            type="danger" 
            icon={<DeleteOutlined />} 
            onClick={() => {
              setDeleteVisible(true);
              setDeleteRecordId(record.id);
            }}
            style={{ backgroundColor: '#f44336', borderColor: '#f44336', color: '#fff' }} // Red for delete
          >
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" tip="Loading..." />;
  }

  return (
    
    <div className="leave-management-container" style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
       <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '50px',fontWeight: 'bold' }}>Leave Management</h1>
       
      <Form form={form} onFinish={onFinish} layout="inline" style={{ marginBottom: '20px' }}>
        <Form.Item name="rank" label="Rank" rules={[{ required: true, message: 'Please select a rank' }]}>
          <Select placeholder="Select a rank" style={{ width: 200 }}>
            {ranks.map(rank => (
              <Option key={rank.id} value={rank.rank_name} style={{ backgroundColor: '#e0f7fa' }}>
                {rank.rank_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="leave_type" label="Leave Type" rules={[{ required: true, message: 'Please select a leave type' }]}>
          <Select placeholder="Select a leave type" style={{ width: 200 }}>
            <Option value="CL1">CL1</Option>
            <Option value="CL2">CL2</Option>
            <Option value="CL3">CL3</Option>
            <Option value="PAL">PAL</Option>
            <Option value="AL">AL</Option>
            <Option value="BAL">BAL</Option>
            <Option value="AAL">AAL</Option>
            <Option value="SICK LEAVE">SICK LEAVE</Option>
            <Option value="FUR LEAVE">FUR LEAVE</Option>
          </Select>
        </Form.Item>

        <Form.Item name="leave_count" label="Leave Count" rules={[{ required: true, message: 'Please enter leave count' }]}>
          <InputNumber min={0} style={{ width: 200, borderColor: '#2196F3' }} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            style={{ backgroundColor: '#2196F3', borderColor: '#2196F3', color: '#fff', marginRight: 8 }} // Blue for submit
          >
            {editingRecord ? (
              <>
                 Update Leave
              </>
            ) : (
              'Add Leave'
            )}
          </Button>
          {editingRecord && (
            <Button 
              type="default" 
              onClick={handleCancelEdit} 
              style={{ backgroundColor: '#FFC107', borderColor: '#FFC107', color: '#fff' }} // Yellow for cancel
            >
              <CloseOutlined style={{ marginRight: 4 }} />
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>

      <Table dataSource={leaves} columns={columns} rowKey="id" />

      {/* Confirmation Modal for Deleting */}
      <Modal
        title="Confirm Deletion"
        visible={deleteVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteVisible(false)}
        okText="Yes, Delete"
        cancelText="No, Cancel"
        okButtonProps={{ style: { backgroundColor: '#f44336', borderColor: '#f44336' } }} // Red color for the delete button
      >
        <p>Are you sure you want to delete this leave type?</p>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
