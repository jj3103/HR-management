import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Typography, Space, Spin, Card, Row, Col } from 'antd';
import { UserOutlined, NumberOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const { Title, Text } = Typography;

// Updated color palette to match CourseList
const colors = {
  primary: '#1C3879',     // Deep royal blue
  secondary: '#607D8B',   // Blue grey
  background: '#F0F4F8',  // Light blue-grey
  surface: '#FFFFFF',     // White
  text: '#37474F',        // Dark blue-grey
  accent: '#87CEEB',      // Sky blue (for special highlights)
  delete: '#D32F2F',      // Red for delete button
  edit: '#4B9F44',        // Green for edit button
  expand: '#4FC3F7',      // Light blue for expand button
};

const formatDate = (value, type) => {
  if (!value) return null;
  if (moment(value, moment.ISO_8601, true).isValid()) {
    switch (type.toLowerCase()) {
      case 'date':
        return moment(value).format('YYYY-MM-DD');
      case 'datetime':
      case 'timestamp':
        return moment(value).format('YYYY-MM-DDTHH:mm');
      default:
        return value;
    }
  }
  return value;
};

const UpdateWife = ({ serviceNumber }) => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dateValue, setDateValue] = useState(null); // State for date selection
  const [showCalendar, setShowCalendar] = useState(false); // State to toggle calendar visibility

  useEffect(() => {
    if (serviceNumber) {
      fetchColumns();
      fetchWifeData();
    }
  }, [serviceNumber]);

  const fetchColumns = async () => {
    try {
      const response = await axios.get('/dynamic/wife/combined/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
      message.error('Failed to fetch form structure');
    }
  };

  const fetchWifeData = async () => {
    try {
      const response = await axios.get(`/dynamic/wife/combined/${serviceNumber}`);
      if (response.data) {
        const formattedData = { ...response.data };
        columns.forEach((column) => {
          const { Field, Type } = column;
          if (formattedData[Field]) {
            formattedData[Field] = formatDate(formattedData[Field], Type);
          }
        });
        form.setFieldsValue(formattedData);
      } else {
        message.warning('No data found for this service number');
      }
    } catch (error) {
      console.error('Error fetching wife data:', error);
      message.error('Failed to fetch wife data');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = { ...values };
      columns.forEach((column) => {
        const { Field, Type } = column;
        if (formattedValues[Field] && moment.isMoment(formattedValues[Field])) {
          if (Type.toLowerCase() === 'date') {
            formattedValues[Field] = formattedValues[Field].format('YYYY-MM-DD');
          } else if (['datetime', 'timestamp'].includes(Type.toLowerCase())) {
            formattedValues[Field] = formattedValues[Field].format('YYYY-MM-DD HH:mm:ss');
          }
        }
      });

      await axios.put(`/dynamic/wife/update/${serviceNumber}`, formattedValues);
      message.success('Wife data updated successfully');
    } catch (error) {
      console.error('Error updating wife:', error);
      message.error('Failed to update wife');
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
      case 'datetime':
      case 'timestamp':
        return (
          <div>
            {/* Additional datetime handling can be implemented similarly */}
            {showCalendar ? (
              <>
                <Calendar
                  onChange={(date) => {
                    setDateValue(date);
                    form.setFieldsValue({ [Field]: moment(date).format('YYYY-MM-DD HH:mm:ss') });
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
                {moment(form.getFieldValue(Field)).format('YYYY-MM-DD HH:mm:ss') || 'Select a date and time'}
              </Text>
            )}
          </div>
        );
      case 'float':
      case 'double':
        return <InputNumber step={0.01} prefix={<NumberOutlined />} style={{ width: '100%' }} />;
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
        Update Wife Information
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
            <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateWife;
