import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Input, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const PromotionRequirementsTable = () => {
    const [promotionRequirements, setPromotionRequirements] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchPromotionRequirements();
    }, []);

    const fetchPromotionRequirements = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/promotion/requirements/all');
            setPromotionRequirements(response.data);
            setFilteredData(response.data); // Initialize with full data
        } catch (error) {
            message.error('Error To fetch Data');
        }
        finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this promotion requirement?')) {
            axios.delete(`/api/promotion/requirements/${id}`)
                .then(() => {
                    alert('Promotion requirement deleted successfully');
                    fetchPromotionRequirements(); // Refresh the data after deletion
                })
                .catch(error => console.error('Error deleting promotion requirement:', error));
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = promotionRequirements.filter((requirement) =>
            requirement.rank.toLowerCase().includes(value) ||
            requirement.years_of_experience.toString().toLowerCase().includes(value) || // Convert number to string
            requirement.current_rank.toLowerCase().includes(value) ||
            requirement.qualifications.toLowerCase().includes(value) ||
            requirement.courses.toLowerCase().includes(value) ||
            requirement.remarks.toLowerCase().includes(value)
        );
        setFilteredData(filtered);
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
            title: <span style={titleStyle}>Rank</span>,
            dataIndex: 'rank',
            key: 'rank',
        },
        {
            title: <span style={titleStyle}>Years of Experience</span>,
            dataIndex: 'years_of_experience',
            key: 'years_of_experience',
        },
        {
            title: <span style={titleStyle}>Current Rank</span>,
            dataIndex: 'current_rank',
            key: 'current_rank',
        },
        {
            title: <span style={titleStyle}>Qualifications</span>,
            dataIndex: 'qualifications',
            key: 'qualifications',
        },
        {
            title: <span style={titleStyle}>Courses</span>,
            dataIndex: 'courses',
            key: 'courses',
        },
        {
            title: <span style={titleStyle}>Remarks</span>,
            dataIndex: 'remarks',
            key: 'remarks',
        },
        {
            title: <span style={titleStyle}>Actions</span>,
            key: 'actions',
            render: (text, record) => (
                <Button type="primary" danger onClick={() => handleDelete(record.promotion_id)}>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div className="PromotionRequirementsTable">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
  <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Promotion Requirements</h1>
</div>

            <Space style={{ marginBottom: 16 }}>
                <Input
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search"
                    style={{ width: 300 }}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredData.map((requirement) => ({ ...requirement, key: requirement.promotion_id }))}
                pagination={{ pageSize: 10 }}
                loading={loading}
            />
        </div>
    );
};

export default PromotionRequirementsTable;
