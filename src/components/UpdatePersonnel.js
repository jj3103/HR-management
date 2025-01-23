import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Row, Col, Card, Spin, Typography } from 'antd';
import axios from 'axios';
import moment from 'moment';
import '../css/UpdatePersonnel.css'; // Import custom CSS for styles

const { Title } = Typography;

const UpdatePersonnel = ({ serviceNumber }) => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumns();
    fetchPersonnelData();
  }, [serviceNumber]);

  const fetchColumns = async () => {
    try {
      const response = await axios.get('/dynamic/personnel/combined/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
      message.error('Failed to fetch form structure');
    }
  };

  const fetchPersonnelData = async () => {
    try {
      const response = await axios.get(`/dynamic/personnel/combined/${serviceNumber}`);
      if (response.data) {
        // Format date fields to Moment.js
        const formattedData = { ...response.data };
        Object.keys(formattedData).forEach((key) => {
          if (formattedData[key] && (key.includes('date') || key.includes('Date'))) {
            formattedData[key] = moment(formattedData[key]).format('YYYY-MM-DD'); // Format as needed
          }
        });
        form.setFieldsValue(formattedData);
      }
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      message.error('Failed to fetch personnel data');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    console.log('Submitting values:', values);
    try {
      const response = await axios.put(`/dynamic/personnel/update/${serviceNumber}`, values);
      console.log('Server response:', response.data);
      message.success('Personnel updated successfully');
    } catch (error) {
      console.error('Error updating personnel:', error);
      console.error('Error response:', error.response?.data);
      message.error('Failed to update personnel');
    }
  };

  const renderFormItem = (column) => {
    const { Field, Type } = column;
    const normalizedType = Type.toLowerCase();

    switch (normalizedType) {
      case 'varchar':
      case 'text':
        return <Input placeholder={`Enter ${Field.replace(/_/g, ' ')}`} />;
      case 'int':
        return <InputNumber placeholder={`Enter ${Field.replace(/_/g, ' ')}`} />;
      case 'date':
        return (
          <input
            type="date"
            onChange={(e) => form.setFieldsValue({ [Field]: e.target.value })}
            className="custom-date-input"
          />
        );
      case 'datetime':
      case 'timestamp':
        return (
          <input
            type="datetime-local"
            onChange={(e) => form.setFieldsValue({ [Field]: e.target.value })}
            className="custom-date-input"
          />
        );
      case 'float':
      case 'double':
        return <InputNumber step={0.01} placeholder={`Enter ${Field.replace(/_/g, ' ')}`} />;
      case 'boolean':
      case 'tinyint':
        return <Switch />;
      default:
        return <Input placeholder={`Enter ${Field.replace(/_/g, ' ')}`} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading personnel data..." />
      </div>
    );
  }

  return (
    <Card title={<Title level={3}>Update Personnel</Title>} className="update-personnel-card">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Row gutter={16}>
          {columns.map((column) => (
            <Col span={12} key={column.Field}>
              <Form.Item
                name={column.Field}
                label={column.Field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                rules={[
                  {
                    required: column.Field === 'service_number',
                    message: `Please input ${column.Field.replace(/_/g, ' ')}!`,
                  },
                ]}
              >
                {renderFormItem(column)}
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="update-button">
            Update Personnel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdatePersonnel;
