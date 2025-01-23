import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const LeaveUpdateModal = ({ visible, onCancel, onOk, selectedLeave, onFormFieldChange }) => {
  return (
    <Modal
      title="Edit Leave Record"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
    >
      {selectedLeave && (
        <Form
          layout="vertical"
          initialValues={{
            ...selectedLeave,
            start_date: selectedLeave.start_date ? moment(selectedLeave.start_date).format('YYYY-MM-DD') : '',
            end_date: selectedLeave.end_date ? moment(selectedLeave.end_date).format('YYYY-MM-DD') : '',
            prefix_on: selectedLeave.prefix_on ? moment(selectedLeave.prefix_on).format('YYYY-MM-DD') : '',
            suffix_on: selectedLeave.suffix_on ? moment(selectedLeave.suffix_on).format('YYYY-MM-DD') : '',
            reporting_date: selectedLeave.reporting_date ? moment(selectedLeave.reporting_date).format('YYYY-MM-DD') : '',
            reported_back: selectedLeave.reported_back || 'no', // Initialize with 'no' if not provided
          }}
          onValuesChange={onFormFieldChange}
        >
          <Form.Item label="Service Number" name="service_number">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Start Date" name="start_date">
            <Input
              type="date"
              onChange={e => onFormFieldChange({ start_date: moment(e.target.value).toISOString() })}
            />
          </Form.Item>
          <Form.Item label="End Date" name="end_date">
            <Input
              type="date"
              onChange={e => onFormFieldChange({ end_date: moment(e.target.value).toISOString() })}
            />
          </Form.Item>
          <Form.Item label="Prefix On" name="prefix_on">
            <Input
              type="date"
              onChange={e => onFormFieldChange({ prefix_on: moment(e.target.value).toISOString() })}
            />
          </Form.Item>
          <Form.Item label="Suffix On" name="suffix_on">
            <Input
              type="date"
              onChange={e => onFormFieldChange({ suffix_on: moment(e.target.value).toISOString() })}
            />
          </Form.Item>
          <Form.Item label="No of Days" name="no_of_days">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Leave Type" name="leave_type">
            <Select>
              <Option value="CL1">CL1</Option>
              <Option value="CL2">CL2</Option>
              <Option value="CL3">CL3</Option>
              <Option value="PAL">PAL</Option>
              <Option value="AL">AL</Option>
              <Option value="BAL">BAL</Option>
              <Option value="AAL">AAL</Option>
              <Option value="SICK LEAVE">SICK LEAVE</Option>
              <Option value="FUR LEAVE">FUR LEAVE</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="absent">Absent</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Reporting Date" name="reporting_date">
            <Input
              type="date"
              onChange={e => onFormFieldChange({ reporting_date: moment(e.target.value).toISOString() })}
            />
          </Form.Item>
          {/* New Reported Back Field */}
          <Form.Item label="Reported Back" name="reported_back">
            <Select>
              <Option value="yes">Yes</Option>
              <Option value="no">No</Option>
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default LeaveUpdateModal;
