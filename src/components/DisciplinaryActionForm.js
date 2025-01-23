import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, AutoComplete, message, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../css/DisciplinaryActionForm.css';

const { TextArea } = Input;
const { Option } = Select;

const DisciplinaryActionForm = () => {
    const [personnel, setPersonnel] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [form] = Form.useForm();
    const [errors, setErrors] = useState({});

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

    const handlePersonnelSelect = (value) => {
        const selectedPersonnel = personnel.find(p => p.service_number === value);
        if (selectedPersonnel) {
            form.setFieldsValue({
                personnel_id: selectedPersonnel.personnel_id,
                service_number: selectedPersonnel.service_number
            });
        }
    };

    const validateForm = () => {
        const values = form.getFieldsValue();
        let formErrors = {};

        if (!values.personnel_id) formErrors.personnel_id = 'Personnel must be selected';
        if (!values.service_number) formErrors.service_number = 'Service number is required';
        if (!values.action_date) formErrors.action_date = 'Action date is required';
        if (!values.action_type) formErrors.action_type = 'Action type is required';
        if (!values.status) formErrors.status = 'Status is required';

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = async (values) => {
        if (validateForm()) {
            try {
                await axios.post('/api/disciplinary_action', values);
                message.success('Disciplinary action saved successfully!');
                form.resetFields();
            } catch (error) {
                console.error('There was an error saving the disciplinary action!', error);
                message.error('Failed to save disciplinary action. Please try again.');
            }
        } else {
            message.error('Please fix the errors in the form');
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

    return (
        <div className="disciplinary-action-form-container">
           <Card
  title={
    <div style={{ 
        color: colors.primary, 
        textAlign: 'center', 
        marginBottom: '30px', 
        fontWeight: 'bold', 
        fontSize: '24px', // Font size
        borderColor: colors.primary, // Matches text color
        borderWidth: '2px', // Thicker border
        padding: '10px 0', // Vertical padding for better spacing
        textTransform: 'uppercase', // Make the text uppercase for emphasis
      }}>
      Disciplinary Action Form
    </div>
  }
  bordered={false}
  style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="service_number"
                        label="Search Personnel"
                        rules={[{ required: true, message: 'Please select a personnel' }]}
                    >
                        <AutoComplete
                            options={personnel.map(p => ({
                                value: p.service_number,
                                label: `${p.first_name} ${p.last_name} (${p.service_number})`
                            }))}
                            onSelect={handlePersonnelSelect}
                            onSearch={setSearchTerm}
                            placeholder="Search by name or service number"
                            className="search-autocomplete"
                        >
                            <Input prefix={<SearchOutlined />} />
                        </AutoComplete>
                    </Form.Item>

                    <Form.Item name="personnel_id" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Action Date"
                        name="action_date"
                        rules={[{ required: true, message: 'Action date is required' }]}
                    >
                        <Input type="date" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Action Type"
                        name="action_type"
                        rules={[{ required: true, message: 'Action type is required' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                        rules={[{ required: true, message: 'Status is required' }]}
                    >
                        <Select>
                            <Option value="Unresolved">Unresolved</Option>
                            <Option value="Resolved">Resolved</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Resolved Date"
                        name="resolved_date"
                    >
                        <Input type="date" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Remarks"
                        name="remarks"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default DisciplinaryActionForm;
