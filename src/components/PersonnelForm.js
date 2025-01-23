import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, Form, Input, InputNumber, Checkbox, Typography, DatePicker, Upload, Divider, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import '../css/PersonnelForm.css';

const { Panel } = Collapse;
const { Title } = Typography;
const { Option } = Select; // Import Select component

const PersonnelForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    rank: '',
    contact_info: '',
    service_number: '',
    enlistment_date: '',
    discharge_date: '',
    married: false,
    has_children: false,
    aadhaar_number: '',
    pancard_number: '',
    address: '',
    email_id: '',
    blood_group: '',
    gender: '',
    coy: '',
    id_card_no: '',
    honour_and_award: '',
    caste: ''
  });

  const [wifeFormData, setWifeFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    marriedSince: '1111-11-11',
    children: 0
  });

  const [childrenData, setChildrenData] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [jointPhoto, setjointPhoto] = useState(null);
  const [extraCol, setExtraCol] = useState([]);
  const [extraWifeCol, setExtraWifeCol] = useState([]);
  const [extraChildCol, setExtraChildCol] = useState([]);
  const [extraData, setExtraData] = useState({});
  const [extraWifeData, setExtraWifeData] = useState({});
  const [extraChildData, setExtraChildData] = useState({});
  const [extraBool, setExtraBool] = useState(false);
  const [wifeBool, setWifeBool] = useState(false);
  const [childBool, setChildBool] = useState(false);
  const [ranks, setRanks] = useState([]); // State for ranks

  useEffect(() => {
    fetchRanks(); // Fetch ranks when component mounts
    fetchExtraColumn();
    fetchExtraWifeColumn();
    fetchExtraChildColumn();
  }, []);
  
  // Fetch ranks from the API
  const fetchRanks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ranks');
      setRanks(response.data); // Set fetched ranks to state
    } catch (error) {
      console.error('Error fetching ranks:', error);
    }
  };

  const fetchExtraColumn = async () => {
    try {
      const response = await axios.get('http://localhost:5000/additional/getcolumn');
      const columnsDetails = (response.data || []).filter(col => col.Field !== 'id' && col.Field !== 'service_number');
      if (columnsDetails.length === 0) {
        setExtraBool(true);
      }
      setExtraCol(columnsDetails);
      setExtraData(response.data.reduce((acc, col) => ({ ...acc, [col.Field]: '' }), {}));
    } catch (error) {
      console.error('Error fetching extra columns:', error);
    }
  };

  const fetchExtraWifeColumn = async () => {
    try {
      const response = await axios.get('http://localhost:5000/additional/getwifecolumn');
      const columnsDetails = (response.data || []).filter(col => col.Field !== 'id' && col.Field !== 'wife_id');
      if (columnsDetails.length === 0) {
        setWifeBool(true);
      }
      setExtraWifeCol(columnsDetails);
      setExtraWifeData(response.data.reduce((acc, col) => ({ ...acc, [col.Field]: '' }), {}));
    } catch (error) {
      console.error('Error fetching wife extra columns:', error);
    }
  };

  const fetchExtraChildColumn = async () => {
    try {
      const response = await axios.get('http://localhost:5000/additional/getchildcolumn');
      const columnsDetails = (response.data || []).filter(col => col.Field !== 'id' && col.Field !== 'child_id');
      if (columnsDetails.length === 0) {
        setChildBool(true);
      }
      setExtraChildCol(columnsDetails);
      setExtraChildData(response.data.reduce((acc, col) => ({ ...acc, [col.Field]: '' }), {}));
    } catch (error) {
      console.error('Error fetching extra columns:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleRankChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      rank: value, // Set the selected rank value
    }));
  };

  const handleWifeChange = (e) => {
    const { name, value } = e.target;
    setWifeFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChildChange = (index, name, value) => {
    setChildrenData(prevChildren => {
      const updatedChildren = [...prevChildren];
      updatedChildren[index] = {
        ...updatedChildren[index],
        [name]: value,
      };
      return updatedChildren;
    });
  };

  const addChildForm = () => {
    setChildrenData(prevChildren => [...prevChildren, { name: '', age: '', gender: '' }]);
  };

  const removeChildForm = (index) => {
    setChildrenData(prevChildren => prevChildren.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (info) => {
    if (info.fileList.length > 0) {
      setPhoto(info.fileList[0].originFileObj);
    }
  };

  const handlejointPhotoChange = (info) => {
    if (info.fileList.length > 0) {
      setjointPhoto(info.fileList[0].originFileObj);
    }
  }
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
  const handleSubmit = async (values) => {
    try {
        const formDataWithFile = new FormData();

        // Append main form data without modifying empty date fields
        Object.keys(formData).forEach(key => {
            if (key !== 'marriedSince') { // Skip 'marriedSince'
                formDataWithFile.append(key, formData[key]);
            }
        });

        if (photo) formDataWithFile.append('photo', photo);

        const personnelResponse = await axios.post('http://localhost:5000/personnel', formDataWithFile, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const personnelId = personnelResponse.data.insertId;
        const serviceNumber = formData.service_number;

        // Handle additional personnel details if necessary
        if (!extraBool) {
            const additionalPersonnel = { ...extraData, service_number: serviceNumber };
            await axios.post('http://localhost:5000/additional/insert', additionalPersonnel);
        }

        // Handle notifications
        const notificationData = {
            name: formData.first_name,
            message: 'Personal Data inserted',
            type: 'data entry',
            status: 'unread',
            personnelId: personnelId
        };
        await axios.post('http://localhost:5000/api/notifications', notificationData);

        // Handle wife's details if married
        if (formData.married) {
            const wifeDetails = new FormData();
            Object.keys(wifeFormData).forEach(key => wifeDetails.append(key, wifeFormData[key]));
            wifeDetails.append('personnel_id', personnelId);
            wifeDetails.append('service_number', serviceNumber);
            if (jointPhoto) wifeDetails.append('jointphoto', jointPhoto);

            const wifeResponse = await axios.post('http://localhost:5000/personnel/wife', wifeDetails, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const wifeId = wifeResponse.data.insertId;

            if (!wifeBool) {
                const wifeData = { ...extraWifeData, wife_id: wifeId };
                await axios.post('http://localhost:5000/additional/insertwife', wifeData);
            }
        }

        // Handle children's details if applicable
        if (formData.has_children) {
            for (const child of childrenData) {
                const childDetails = { ...child, personnel_id: personnelId, service_number: serviceNumber };
                const childResponse = await axios.post('http://localhost:5000/personnel/child', childDetails);
                const childId = childResponse.data.insertId;

                if (!childBool) {
                    const childData = { ...extraChildData, child_id: childId };
                    await axios.post('http://localhost:5000/additional/insertchild', childData);
                }
            }
        }

        // Clear form data
        setFormData({
            first_name: '',
            last_name: '',
            date_of_birth: '',
            rank: '',
            contact_info: '',
            service_number: '',
            enlistment_date: '',
            discharge_date: '',
            married: false,
            has_children: false,
            aadhaar_number: '',
            pancard_number: '',
            address: '',
            email_id: '',
            blood_group: '',
            gender: '',
            coy: '',
            id_card_no: '',
            honour_and_award: '',
            caste: ''
        });
        setWifeFormData({
            name: '',
            age: '',
            occupation: '',
            marriedSince: '',
            children: 0
        });
        setChildrenData([]);
        setPhoto(null);

        message.success('Personnel and family details added successfully!');
    } catch (error) {
        message.error('Failed to add personnel or family details:', error);
    }
};


  const handleExtraChange = (name, value) => {
    setExtraData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExtraWifeChange = (name, value) => {
    setExtraWifeData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExtraChildChange = (name, value) => {
    setExtraChildData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  const renderInput = (column, formData, handleChange) => {
    const { Field, Type } = column;
    const value = formData[Field];

    if (Type.includes('varchar') || Type.includes('text')) {
        return (
            <Input 
                name={Field}
                value={value}
                placeholder={`Enter text (e.g., Description of ${Field})`}
                onChange={(e) => handleChange(Field, e.target.value)}
            />
        );
    } 
    // Handle standard integers but exclude tinyint/boolean
    else if (Type.includes('int') && !Type.includes('tinyint')) {
        return (
            <InputNumber 
                name={Field}
                value={value}
                placeholder="Enter integer value (e.g., 123)"
                onChange={(newValue) => handleChange(Field, newValue)}
            />
        );
    } 
    // Handle float, double, decimal types
    else if (Type.includes('float') || Type.includes('double') || Type.includes('decimal')) {
        return (
            <InputNumber 
                name={Field}
                value={value}
                placeholder="Enter decimal value (e.g., 123.45)"
                step="0.01"
                onChange={(newValue) => handleChange(Field, newValue)}
            />
        );
    } 
    // Handle date and timestamp types
    else if (Type.includes('date') || Type.includes('timestamp')) {
        return (
            <Input 
                type="date"
                style={{ width: '100%' }}
                name={Field}
                value={value}
                placeholder="Select a date"
                onChange={(e) => handleChange(Field, e.target.value)}
            />
        );
    } 
    // Handle boolean and tinyint(1) types
    else if (Type.includes('boolean') || Type.includes('tinyint(1)')) {
        return (
            <Checkbox 
                name={Field}
                checked={!!value}
                onChange={(e) => handleChange(Field, e.target.checked)}
            >
                {`Check if ${Field}`}
            </Checkbox>
        );
    } 
    // Default input for other field types
    else {
        return (
            <Input 
                name={Field}
                value={value}
                placeholder={`Enter value for ${Field}`}
                onChange={(e) => handleChange(Field, e.target.value)}
            />
        );
    }
};


  return (
    <div className="personnel-form">
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
>
  Add Personnel
</Divider>


      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: 'Please enter first name!' }]}
        >
          <Input name="first_name" value={formData.first_name} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: 'Please enter last name!' }]}
        >
          <Input name="last_name" value={formData.last_name} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Date of Birth"
          name="date_of_birth"
          rules={[{ required: true, message: 'Please select date of birth!' }]}
        >
          <Input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item
        label="Rank"
        name="rank"
        rules={[{ required: true, message: 'Please select rank!' }]} // Update message for selection
      >
        <Select
          placeholder="Select a rank"
          value={formData.rank}
          onChange={handleRankChange} // Handle rank selection
        >
          {ranks.map(rank => (
            <Option key={rank.id} value={rank.rank_name}>
              {rank.rank_name}
            </Option>
          ))}
        </Select>
      </Form.Item>

        <Form.Item
          label="Contact Info"
          name="contact_info"
          rules={[{ required: true, message: 'Please enter contact info!' }]}
        >
          <Input name="contact_info" value={formData.contact_info} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Service Number"
          name="service_number"
          rules={[{ required: true, message: 'Please enter service number!' }]}
        >
          <Input name="service_number" value={formData.service_number} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Enlistment Date"
          name="enlistment_date"
          rules={[{ required: true, message: 'Please select enlistment date!' }]}
        >
          <Input
            type="date"
            name="enlistment_date"
            value={formData.enlistment_date}
            onChange={handleChange}
            style={{ width: '100%' }} // Ensure full-width for consistency
          />
        </Form.Item>


        <Form.Item
          label="Discharge Date"
          name="discharge_date"
        >
          <Input
            type="date"
            name="discharge_date"
            value={formData.discharge_date}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Aadhaar Number"
          name="aadhaar_number"
        >
          <Input name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="PAN Card Number"
          name="pancard_number"
          rules={[
            { required: true, message: 'Please enter PAN card number!' }
          ]}
        >
          <Input name="pancard_number" value={formData.pancard_number} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please enter address!' }]}
        >
          <Input.TextArea name="address" value={formData.address} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Email ID"
          name="email_id"
          rules={[
            { required: true, message: 'Please enter email ID!' },
            { type: 'email', message: 'Please enter a valid email address!' }
          ]}
        >
          <Input name="email_id" value={formData.email_id} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Blood Group"
          name="blood_group"
          rules={[{ required: true, message: 'Please enter blood group!' }]}
        >
          <Input name="blood_group" value={formData.blood_group} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: 'Please enter gender!' }]}
        >
          <Input name="gender" value={formData.gender} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Coy"
          name="coy"
          rules={[{ required: true, message: 'Please enter Coy!' }]}
        >
          <Input name="coy" value={formData.coy} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="ID Card Number"
          name="id_card_no"
          rules={[{ required: true, message: 'Please enter ID card number!' }]}
        >
          <Input name="id_card_no" value={formData.id_card_no} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Honour and Award"
          name="honour_and_award"
        >
          <Input name="honour_and_award" value={formData.honour_and_award} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Caste"
          name="caste"
        >
          <Input name="caste" value={formData.caste} onChange={handleChange} />
        </Form.Item>

        <Form.Item
          label="Upload Photo"
          name="photo"
          rules={[{ required: true, message: 'Please upload a photo!' }]}
        >
          <Upload listType="picture" maxCount={1} onChange={handlePhotoChange}>
            <Button>Upload</Button>
          </Upload>
        </Form.Item>

        {!extraBool && extraCol.map((column) => (
        <Form.Item key={column.Field} label={column.Field}>
          {renderInput(column, extraData, handleExtraChange)}
        </Form.Item>
      ))}


        <Form.Item
          label="Married"
          name="married"
          valuePropName="checked"
        >
          <Checkbox name="married" checked={formData.married} onChange={handleChange} />
        </Form.Item>

        {formData.married && (
          <Collapse className='dk-collapse'>
            <Panel header="Wife Details" key="wife">
              <Form.Item
                label="Wife's Name"
                name="wife_name"
                rules={[{ required: true, message: 'Please enter wife\'s name!' }]}
              >
                <Input name="name" value={wifeFormData.name} onChange={handleWifeChange} />
              </Form.Item>
              <Form.Item
                label="Wife's Age"
                name="wife_age"
                rules={[
                  { required: true, message: 'Please enter wife\'s age!' },
                  
                ]}
              >
                <Input name="age" value={wifeFormData.age} onChange={handleWifeChange} />
              </Form.Item>
              <Form.Item
                label="Wife's Occupation"
                name="wife_occupation"
                rules={[{ required: true, message: 'Please enter wife\'s occupation!' }]}
              >
                <Input name="occupation" value={wifeFormData.occupation} onChange={handleWifeChange} />
              </Form.Item>
              <Form.Item
                label="Married Since"
                name="marriedSince"
                rules={[{ required: true, message: 'Please select married since date!' }]}
              >
                <Input
                  type="date"
                  name="marriedSince"
                  value={wifeFormData.marriedSince}
                  onChange={handleChange}

                />
              </Form.Item>
              <Form.Item
                label="Number of Children"
                name="children"
                rules={[
                  { required: true, message: 'Please enter number of children!' },
                  { type: 'number', min: 0, message: 'Number of children must be a positive number!' }
                ]}
              >
                <InputNumber name="children" value={wifeFormData.children} onChange={(value) => setWifeFormData(prev => ({ ...prev, children: value }))} />
              </Form.Item>

              <Form.Item
                label="Upload Joint Photo"
                name="jointphoto"
                rules={[{ required: true, message: 'Please upload a photo!' }]}
              >
                <Upload listType="picture" maxCount={1} onChange={handlejointPhotoChange}>
                  <Button>Upload</Button>
                </Upload>
              </Form.Item>

              
      {!wifeBool && extraWifeCol.map((column) => (
        <Form.Item key={column.Field} label={column.Field}>
          {renderInput(column, extraWifeData, handleExtraWifeChange)}
        </Form.Item>
      ))}
            </Panel>
          </Collapse>
        )}

        <Form.Item
          label="Has Children"
          name="has_children"
          valuePropName="checked"
        >
          <Checkbox name="has_children" checked={formData.has_children} onChange={handleChange} />
        </Form.Item>

        {formData.has_children && (
          <Collapse className='dk-collapse'>
            <Panel header="Children Details" key="children">
              {childrenData.map((child, index) => (
                <div key={index} className="child-form">
                  <Form.Item
                    label="Child's Name"
                    name={`child_name_${index}`}
                    rules={[{ required: true, message: `Please enter child's name for child ${index + 1}!` }]}
                  >
                    <Input name="name" value={child.name} onChange={(e) => handleChildChange(index, 'name', e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label="Child's Age"
                    name={`child_age_${index}`}
                  >
                    <Input name="age" value={child.age} onChange={(e) => handleChildChange(index, 'age', e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label="Child's Gender"
                    name={`child_gender_${index}`}
                    rules={[{ required: true, message: `Please enter child's gender for child ${index + 1}!` }]}
                  >
                    <Input name="gender" value={child.gender} onChange={(e) => handleChildChange(index, 'gender', e.target.value)} />
                  </Form.Item>
                  {!childBool && extraChildCol.map((column) => (
        <Form.Item key={column.Field} label={column.Field}>
          {renderInput(column, extraChildData, handleExtraChildChange)}
        </Form.Item>
      ))}

                  <Button type="dashed" className='dk-remove' onClick={() => removeChildForm(index)} icon={<MinusOutlined />}>Remove Child</Button>
                </div>
              ))}
              <Button type="dashed" onClick={addChildForm} icon={<PlusOutlined />}>
                Add Child
              </Button>
            </Panel>
          </Collapse>
        )}


        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>

      </Form>
    </div>
  );
};

export default PersonnelForm;