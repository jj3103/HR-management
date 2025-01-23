import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AutoComplete, Button, Card, Checkbox, Form, Input, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import '../css/QualificationForm.css';

const QualificationForm = () => {
  const [personnel, setPersonnel] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [show, setShow] = useState(false);
  const [newQualification, setNewQualification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [qualificationSearchTerm, setQualificationSearchTerm] = useState('');
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [filteredQualifications, setFilteredQualifications] = useState([]);

  useEffect(() => {
    // Debounce personnel search
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        axios.get(`/personnelsearch?searchTerm=${searchTerm}`)
          .then(response => {
            setPersonnel(response.data);
          })
          .catch(error => {
            setPersonnel([]); // Reset personnel on error
            console.error('There was an error fetching the personnel data!', error);
          });
      } else {
        setPersonnel([]);
      }
    }, 500); // Adjust the debounce time as necessary

    return () => clearTimeout(delayDebounceFn); // Cleanup
  }, [searchTerm]);

  // Fetch qualifications data
  useEffect(() => {
    axios.get('/api/qualifications')
      .then(response => {
        setQualifications(response.data);
        setFilteredQualifications(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the qualifications data!', error);
      });
  }, []);

  useEffect(() => {
    // Filter qualifications based on search term
    const filtered = qualifications.filter(q => 
      q.name.toLowerCase().includes(qualificationSearchTerm.toLowerCase())
    );
    setFilteredQualifications(filtered);
  }, [qualificationSearchTerm, qualifications]);

  const handlePersonnelSelect = (value) => {
    const selected = personnel.find(p => p.service_number === value);
    setSelectedPersonnel(selected);
  };

  const handleQualificationChange = (selectedValues) => {
    setSelectedQualifications(selectedValues);
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

  const handleSubmit = () => {
    if (!selectedPersonnel) {
      message.error('Please select a personnel');
      return;
    }
    if (selectedQualifications.length === 0) {
      message.error('Please select at least one qualification');
      return;
    }
    setConfirmModalShow(true);
  };

  const handleConfirmSubmit = () => {
    const data = {
      personnel_id: selectedPersonnel.personnel_id,
      service_number: selectedPersonnel.service_number,
      qualifications: selectedQualifications
    };

    axios.post('/api/qualifications/assign', data)
      .then(response => {
        message.success('Qualifications assigned successfully!');
        setConfirmModalShow(false);
        setShow(false); // Auto-close add qualification modal if open
      })
      .catch(error => {
        console.error('There was an error assigning the qualifications!', error);
        message.error(`Error assigning qualifications: ${error.message}`);
        setConfirmModalShow(false);
      });
  };

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleNewQualificationSubmit = (e) => {
    e.preventDefault();
    axios.post('/qualifications', { name: newQualification })
      .then(response => {
        setQualifications([...qualifications, response.data]);
        setFilteredQualifications([...qualifications, response.data]);
        setNewQualification('');
        handleClose();
      })
      .catch(error => {
        console.error('There was an error adding the qualification!', error);
        message.error(`Error adding qualification: ${error.message}`);
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      <Card title={<h2 className="text-2xl font-semibold text-gray-800"
       style={{ 
        color: colors.primary, 
        textAlign: 'center', 
        marginBottom: '50px', 
        fontWeight: 'bold', 
        fontSize: '30px', // Font size
        borderColor: colors.primary, // Matches text color
        borderWidth: '2px', // Thicker border
        padding: '10px 0', // Vertical padding for better spacing
        textTransform: 'uppercase', // Make the text uppercase for emphasis
      }}
      >Assign Qualifications</h2>} className="shadow-lg rounded-lg">
        <Form onFinish={handleSubmit} layout="vertical" className="space-y-6">
          <Form.Item
            name="service_number"
            label={<span className="text-lg font-medium text-gray-700">Search Personnel</span>}
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
              className="w-full"
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
            >
              <Input prefix={<SearchOutlined className="text-gray-400" />} className="rounded-md" />
            </AutoComplete>
          </Form.Item>

          <Form.Item
            label={<span className="text-lg font-medium text-gray-700">Qualifications</span>}
          >
            <Input
              placeholder="Search qualifications"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={qualificationSearchTerm}
              onChange={(e) => setQualificationSearchTerm(e.target.value)}
              className="mb-4 rounded-md"
            />
            <div className="qualification-list max-h-60 overflow-y-auto p-4 bg-white border border-gray-200 rounded-md">
              <Checkbox.Group
                options={filteredQualifications.map(q => ({
                  label: q.name,
                  value: q.id.toString(),
                }))}
                value={selectedQualifications}
                onChange={handleQualificationChange}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <div className="flex space-x-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                disabled={!selectedPersonnel || selectedQualifications.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition duration-300"
              >
                Assign Qualifications
              </Button>
              <Button
                onClick={handleShow}
                icon={<PlusOutlined />}
                size="large"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md transition duration-300"
              >
                Add New Qualification
              </Button>
            </div>
          </Form.Item>
        </Form>

        {/* New Qualification Modal */}
        <Modal
          title={<h3 className="text-xl font-semibold text-gray-800">Add New Qualification</h3>}
          visible={show}
          onCancel={handleClose}
          footer={null}
          className="rounded-lg"
        >
          <Form onFinish={handleNewQualificationSubmit} className="space-y-4">
            <Form.Item
              label={<span className="text-lg font-medium text-gray-700">Qualification Name</span>}
              name="qualification"
              rules={[{ required: true, message: 'Please input the qualification name!' }]}
            >
              <Input
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                className="rounded-md"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition duration-300">
                Add Qualification
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          title={<h3 className="text-xl font-semibold text-gray-800">Confirm Qualification Assignment</h3>}
          visible={confirmModalShow}
          onCancel={() => setConfirmModalShow(false)}
          footer={[
            <Button key="back" onClick={() => setConfirmModalShow(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-md transition duration-300">
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleConfirmSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition duration-300">
              Confirm
            </Button>
          ]}
          className="rounded-lg"
        >
          <p className="text-gray-600">Confirm assignment of qualifications to:</p>
          {selectedPersonnel && (
            <p className="font-semibold text-gray-800">{selectedPersonnel.first_name} {selectedPersonnel.last_name} ({selectedPersonnel.service_number})</p>
          )}
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            {selectedQualifications.map(q => (
              <li key={q}>{filteredQualifications.find(qual => qual.id === parseInt(q))?.name}</li>
            ))}
          </ul>
        </Modal>
      </Card>
    </div>
  );
};

export default QualificationForm;
