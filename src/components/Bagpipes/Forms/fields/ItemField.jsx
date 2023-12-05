import React, { useState } from 'react';
import { Collapse, Button, Input } from 'antd';
import { CustomExpandIcon } from './CustomExpandIcon';
import 'antd/dist/antd.css';
import './Fields.scss';
import { CloseIcon } from '../../../Icons/icons';

const ItemField = ({ title, item, onItemChange, onDelete, fieldTypes }) => {
  const [selectedFieldType, setSelectedFieldType] = useState('text');

  const handleFieldTypeChange = (value) => {
    setSelectedFieldType(value);
  };

  const header = (
    <div className='flex justify-between'>
      <div>{title}</div>
      <div onClick={() => onDelete(item)}>
        <CloseIcon className='h-3 w-3 m-1 hover:text-red-800' fillColor='gray' />
      </div>
    </div>
  );
  
return (
  <div className='item-container relative'>
    <Collapse className='custom-collapse' accordion defaultActiveKey={['1']} expandIcon={({ isActive }) => CustomExpandIcon({ isActive })}>
      <Collapse.Panel className='text-xs' header={header} key="1">
        {fieldTypes && (
          <Select className='w-full' value={selectedFieldType} onChange={handleFieldTypeChange}>
            {fieldTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        )}
        {(!fieldTypes || selectedFieldType === 'text') && (
          <div className='flex flex-col'>
            <div className='mb-2'>
              <Input className='custom-input' placeholder="Key" value={item.key} onChange={(e) => onItemChange(e.target.value, item.value)} />
            </div>
            <div>
              <Input className='custom-input' placeholder="Value" value={item.value} onChange={(e) => onItemChange(item.key, e.target.value)} />
            </div>
          </div>
        )}
        {selectedFieldType === 'file' && (
          <div className='flex flex-col'>
            {/* File type fields */}
          </div>
        )}
      </Collapse.Panel>
    </Collapse>
  </div>
);

    };

export default ItemField;
