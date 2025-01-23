import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, notification, Button, Typography, Modal, Form, Select, Space, Divider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Trash2, Edit2, RefreshCw, UserPlus, Award } from 'lucide-react';
import 'antd/dist/reset.css';

const { Title } = Typography;
const { Option } = Select;

const PersonnelQualificationTable = () => {
  const [personnelQualifications, setPersonnelQualifications] = useState([]);
  const [filteredQualifications, setFilteredQualifications] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPersonnelQualifications();
    fetchQualifications();
  }, []);

  const fetchPersonnelQualifications = () => {
    axios.get('/api/qualifications/personnel')
      .then(response => {
        setLoading(false);
        const data = response.data;
        const groupedQualifications = data.reduce((acc, pq) => {
          const qualificationsArray = Array.isArray(pq.qualifications) ? pq.qualifications : [pq.qualifications];

          if (!acc[pq.service_number]) {
            acc[pq.service_number] = {
              key: pq.id,
              personnel_id: pq.personnel_id,
              name: pq.name,
              service_number: pq.service_number,
              qualifications: qualificationsArray,
            };
          } else {
            acc[pq.service_number].qualifications.push(...qualificationsArray);
          }
          return acc;
        }, {});

        const qualificationsData = Object.values(groupedQualifications);
        setPersonnelQualifications(qualificationsData);
        setFilteredQualifications(qualificationsData);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error fetching personnel qualifications:', error);
        notification.error({
          message: 'Error',
          description: `Error fetching personnel qualifications: ${error.message}`,
        });
      });
  };

  const fetchQualifications = () => {
    axios.get('/api/qualifications')
      .then(response => {
        setQualifications(response.data);
      })
      .catch(error => {
        console.error('Error fetching qualifications:', error);
        notification.error({
          message: 'Error',
          description: `Error fetching qualifications: ${error.message}`,
        });
      });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const searchLower = value.toLowerCase();

    const filtered = personnelQualifications.filter(pq => 
      pq.name.toLowerCase().includes(searchLower) ||
      pq.service_number.toLowerCase().includes(searchLower) ||
      pq.qualifications.some(q => q.toLowerCase().includes(searchLower))
    );

    setFilteredQualifications(filtered);
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


  const handleDelete = (personnel_id) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this qualification?',
      onOk: () => {
        axios.delete(`/api/qualifications/delete/${personnel_id}`)
          .then(() => {
            notification.success({ message: 'Qualification deleted successfully' });
            fetchPersonnelQualifications(); // Refresh data
          })
          .catch(error => {
            console.error('Error deleting qualification:', error);
            notification.error({
              message: 'Error',
              description: `Error deleting qualification: ${error.message}`,
            });
          });
      },
    });
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
      title: <span style={titleStyle}>Service Number</span>,
      dataIndex: 'service_number',
      key: 'service_number',
      sorter: (a, b) => a.service_number.localeCompare(b.service_number),
    },
    {
      title: <span style={titleStyle}>Qualifications</span>,
      dataIndex: 'qualifications',
      key: 'qualifications',
      render: (qualifications) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {qualifications.map((qual, index) => (
            <span key={index} style={{
              padding: '2px 8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1890ff',
              backgroundColor: '#e6f7ff',
              borderRadius: '12px',
            }}>
              {qual}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: <span style={titleStyle}>Actions</span>,
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button
            onClick={() => handleDelete(record.personnel_id)} // Use personnel_id here
            icon={<Trash2 size={16} />}
            style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
          />
        </Space>
      ),
    }
        
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
  <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Personnel Qualifications</h1>
</div>

      <Input
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name, service number, or qualification"
        style={{ marginBottom: '16px' }}
      />
      <Table
        columns={columns}
        dataSource={filteredQualifications}
        pagination={{ pageSize: 30 }}
        loading={loading}
        style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
      />
    </div>
  );
};

export default PersonnelQualificationTable;