import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Typography, Spin, Card, Row, Col } from 'antd';
import { UserOutlined, NumberOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import moment from 'moment';

const { Title, Text } = Typography;

// Updated color palette to match UpdateWife
const colors = {
  primary: '#1C3879',     // Deep royal blue
  secondary: '#607D8B',   // Blue grey
  background: '#F0F4F8',  // Light blue-grey
  surface: '#FFFFFF',     // White
  text: '#37474F',        // Dark blue-grey
  accent: '#87CEEB',      // Sky blue (for special highlights)
};

const UpdateChild = ({ childId }) => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateValue, setDateValue] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false); // State to control calendar visibility

  useEffect(() => {
    fetchColumns();
    fetchChildData();
  }, [childId]);

  const fetchColumns = async () => {
    try {
      const response = await axios.get('/dynamic/child/combined/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
      message.error('Failed to fetch form structure');
    }
  };

  const fetchChildData = async () => {
    try {
      const response = await axios.get(`/dynamic/child/combined/${childId}`);
      if (response.data) {
        const formattedData = { ...response.data };
        columns.forEach((column) => {
          const { Field, Type } = column;
          if (formattedData[Field]) {
            if (Type.toLowerCase() === 'date') {
              formattedData[Field] = moment(formattedData[Field]).toDate(); // Convert to Date object
            } else if (['datetime', 'timestamp'].includes(Type.toLowerCase())) {
              formattedData[Field] = moment(formattedData[Field]).toDate(); // Convert to Date object
            }
          }
        });
        form.setFieldsValue(formattedData);
      } else {
        message.warning('No data found for this child ID');
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      message.error('Failed to fetch child data');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = { ...values };
      formattedValues['child_date'] = moment(dateValue).format('YYYY-MM-DD'); // Add date from calendar

      await axios.put(`/dynamic/child/update/${childId}`, formattedValues);
      message.success('Child data updated successfully');
    } catch (error) {
      console.error('Error updating child:', error);
      message.error('Failed to update child');
    }
  };

  const renderFormItem = (column) => {
    const { Field, Type } = column;
    const normalizedType = Type.toLowerCase();

    switch (normalizedType) {
      case 'varchar':
      case 'text':
        return <Input prefix={<UserOutlined />} />;
      case 'int':
        return <InputNumber prefix={<NumberOutlined />} style={{ width: '100%' }} />;
      case 'date':
        return (
          <div>
            {showCalendar ? (
              <>
                <Calendar
                  onChange={(date) => {
                    setDateValue(date);
                    form.setFieldsValue({ [Field]: moment(date).format('YYYY-MM-DD') });
                    setShowCalendar(false);
                  }}
                  value={dateValue || moment(form.getFieldValue(Field)).toDate()}
                />
                <Button
                  onClick={() => setShowCalendar(false)}
                  style={{ marginTop: '10px' }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Text
                style={{ cursor: 'pointer', display: 'inline-block' }}
                onClick={() => {
                  setDateValue(moment(form.getFieldValue(Field)).toDate());
                  setShowCalendar(true);
                }}
              >
                {moment(form.getFieldValue(Field)).format('YYYY-MM-DD') || 'Select a date'}
              </Text>
            )}
          </div>
        );
      case 'boolean':
      case 'tinyint':
        return <Switch />;
      default:
        return <Input />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: colors.background,
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <Title level={2} style={{ color: colors.primary, marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
        Update Child Information
      </Title>
      <Card
        hoverable
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          backgroundColor: colors.surface,
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{}}
        >
          <Row gutter={16}>
            {columns.map((column) => (
              <Col xs={24} sm={12} key={column.Field}>
                <Form.Item
                  name={column.Field}
                  label={<Text strong style={{ color: colors.text }}>{column.Field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>}
                  rules={[
                    {
                      required: column.Field === 'child_id',
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
            <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateChild;
