import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


const QualifiedPersonnelTable = () => {
  const [qualifiedPersonnel, setQualifiedPersonnel] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQualifiedPersonnel();
  }, []);

  const fetchQualifiedPersonnel = () => {
    axios.get('/api/promotion/qualified-personnel')
      .then(response => {
        setQualifiedPersonnel(response.data);
        setFilteredData(response.data);
      })
      .catch(error => console.error('Error fetching qualified personnel:', error));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = qualifiedPersonnel.filter(personnel =>
      personnel.name.toLowerCase().includes(value) ||
      personnel.current_rank.toLowerCase().includes(value) ||
      personnel.promotion_rank.toLowerCase().includes(value) ||
      personnel.remarks.toLowerCase().includes(value)
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
        title: <span style={titleStyle}>Name</span>,
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: <span style={titleStyle}>Current Rank</span>,
        dataIndex: 'current_rank',
        key: 'current_rank',
    },
    {
        title: <span style={titleStyle}>Promotion Rank</span>,
        dataIndex: 'promotion_rank',
        key: 'promotion_rank',
    },
    {
        title: <span style={titleStyle}>Years of Experience</span>,
        dataIndex: 'years_of_experience',
        key: 'years_of_experience',
    },
    {
        title: <span style={titleStyle}>Remarks</span>,
        dataIndex: 'remarks',
        key: 'remarks',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
  <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '20px',fontWeight: 'bold' }}>Qualified Personnel</h1>
</div>
      {/* Search Input */}
      <Input
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search"
        style={{margin:'10px'}}
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData.map((personnel, index) => ({ ...personnel, key: index }))}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default QualifiedPersonnelTable;
