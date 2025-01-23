import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, Row, Col, Divider, message } from 'antd';
import axios from 'axios';
import '../css/SearchDropdown.css';

const BankDetailsForm = () => {
    const [personnel, setPersonnel] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [form] = Form.useForm();

    useEffect(() => {
        if (searchTerm) {
            axios.get(`/personnelsearch?searchTerm=${searchTerm}`)
                .then(response => {
                    setPersonnel(response.data.slice(0, 5));
                })
                .catch(error => {
                    console.error('Error fetching personnel data:', error);
                });
        } else {
            setPersonnel([]);
        }
    }, [searchTerm]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) =>
                prevIndex < personnel.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            selectPersonnel(personnel[highlightedIndex]);
        }
    };
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

    const selectPersonnel = (person) => {
        form.setFieldsValue({
            service_number: `${person.service_number}`,
            name: `${person.first_name} ${person.last_name}`,
            personnel_id: person.personnel_id,
        });
        setSearchTerm(`${person.service_number}`);
        setPersonnel([]);
        setHighlightedIndex(-1);
    };

    const onFinish = async (values) => {
        try {
            const response = await axios.post('/bank/bank-details', values);
            message.success(response.data.message);
        } catch (error) {
            message.error('Error adding bank details');
        }
    };

    return (
        <Form
            form={form}
            name="bank_details"
            layout="vertical"
            onFinish={onFinish}
            style={{
                maxWidth: 800,
                margin: '0 auto',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
        >
            <Divider 
  className="divider" 
  style={{ 
    color: colors.primary, 
    textAlign: 'center', 
    marginBottom: '50px', 
    fontWeight: 'bold', 
    fontSize: '24px', // Font size
    borderColor: colors.primary, // Matches text color
    borderWidth: '2px', // Thicker border
    padding: '10px 0', // Vertical padding for better spacing
    textTransform: 'uppercase', // Make the text uppercase for emphasis
  }}
>Add Bank Details</Divider>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        label="Service Number"
                        name="service_number"
                        rules={[{ required: true, message: 'Please input your service number!' }]}
                    >
                        <div className="bank-details-form__search-container">
                            <Input
                                placeholder="Search by name or service number"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {personnel.length > 0 && (
                                <div className="bank-details-form__dropdown">
                                    {personnel.map((p, index) => (
                                        <div
                                            key={p.personnel_id}
                                            className={`bank-details-form__dropdown-item ${index === highlightedIndex ? 'bank-details-form__dropdown-item--highlighted' : ''}`}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            onClick={() => selectPersonnel(p)}
                                        >
                                            <div className="bank-details-form__dropdown-content">
                                                <span className="bank-details-form__dropdown-name">
                                                    {p.first_name} {p.last_name}
                                                </span>
                                                <span className="bank-details-form__dropdown-service-number">
                                                    ({p.service_number})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="personnel_id" hidden={true}>
                <Input type="hidden" />
            </Form.Item>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input placeholder="Enter Name" maxLength={255} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Single Account Number"
                        name="single_ac_no"
                        rules={[{ required: true, message: 'Please input your single account number!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="Enter Single Account Number" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Single Account Bank Name"
                        name="single_ac_bank_name"
                        rules={[{ required: true, message: 'Please input your single account bank name!' }]}
                    >
                        <Input placeholder="Enter Single Account Bank Name" maxLength={255} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Joint Account Number"
                        name="joint_ac_no"
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="Enter Joint Account Number (optional)" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Joint Account Bank Name"
                        name="joint_ac_bank_name"
                    >
                        <Input placeholder="Enter Joint Account Bank Name (optional)" maxLength={255} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Button type="default" htmlType="reset" style={{ width: '100%' }}>
                        Cancel
                    </Button>
                </Col>
                <Col span={12}>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Submit
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default BankDetailsForm;
