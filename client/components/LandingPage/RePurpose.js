import React, { KeyboardEventHandler ,useEffect} from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import Select, {
  components,
  ControlProps,
  Props,
  MultiValueRemoveProps,
  StylesConfig,
} from 'react-select';
import Tooltip from '../ui/Tooltip';
import { Chip } from '@/pages';
import { DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline';

function generateRandomId() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8; // Adjust the length as desired
  let randomId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters[randomIndex];
  }

  return randomId;
}
export const createOption = (label, id,index) => ({
  label,
  value: label,
  selected: false,
  id: id,
  index: index,
  type: 'url'
});

export default function RePurpose({value, setValue, setShowRepourposeError, removeFile}){
  const [inputValue, setInputValue] = React.useState('');
  const handleKeyDown = (event) => {
    const elementId = generateRandomId();
    const inputLength = value.length;
  
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
      if (inputLength >= 3) {
        setShowRepourposeError(true);
        return;
      } else {
        setShowRepourposeError(false);
      }
  
      if (!inputValue) return;
  
      const newBlogLinks = [...value, createOption(inputValue, elementId, inputLength + 1)];
      setValue(newBlogLinks);
      setInputValue('');
      event.preventDefault();
    }
  };
  const MultiValueRemove = (props) => {
    function handleClick(){
      const typeOfData = props.data.type;
      if(typeOfData ==='file'){
        removeFile(props.data.id);
      }
      const newValues = value.filter((item) => item.id !== props.data.id);
      setValue(newValues);
    }
    return (
        <components.MultiValueRemove {...props} >
          <XCircleIcon className="h-6 w-6 text-gray-500" onClick={handleClick}/>
        </components.MultiValueRemove>
    );
  };  
  function MultiValueLabel(props) {
    // check for .type
    return (
      <components.MultiValueLabel {...props}>
        <div className="flex items-center rounded-full">
        {
          props.data.type === 'file' ? <DocumentIcon className="h-6 w-6 text-gray-500" /> : null
        }
        <span>{props.data.label}</span>
        </div>
        </components.MultiValueLabel>
    )
  }


  const DropdownIndicator = () => {
    return null; // Return null to hide the default separator
  };
  const ClearIndicator = (props) => {
    return null; // Return null to hide the default separator
  };

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto' ,
    }}
    >
      <CreatableSelect
      components={{DropdownIndicator , MultiValueRemove, ClearIndicator, MultiValueLabel}}
      inputValue={inputValue}
      
      styles={{
        multiValue: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: 'transparent',
          borderRadius: '1rem',
          border: '1px solid #C6CED6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.25rem'
        }), 
        
        multiValueRemove: (baseStyles, state) => ({
          ...baseStyles,
          borderColor: state.isFocused ? 'grey' : 'red',
            height: '24px',
            width: '24px',
            padding: '4px',
            backgroundColor: '#C6CED6',
            color: '#00000',
            borderRadius: '1rem',
        }),
        valueContainer: (baseStyles, state)=>({
          ...baseStyles, 
          gap: '0.75rem',
          flexWrap: 'nowrap',
        }),
        control: (baseStyles, state)=>({
          ...baseStyles, 
          border: 'unset'
        }),
        placeholder: (baseStyles, state)=>({
          ...baseStyles, 
          textAlign: 'left'
        })
      }}
      isClearable
      isMulti
      onBlur={(event) => {
        const elementId = generateRandomId();
        const inputLength = value.length;
        if (inputLength > 2) {
          // toast.error('You can only add 3 blogs');
          setShowRepourposeError(true);
          return;
        } else {
          setShowRepourposeError(false);
        }
        if (!inputValue) return;
        const newBlogLinks = [...value, createOption(inputValue, elementId, inputLength + 1)];
        setValue(newBlogLinks);
        setInputValue('');
        event.preventDefault();
      }}
      menuIsOpen={false}
      onChange={(newValue) => setValue(newValue)}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder="Enter URL of blog..."
      value={value}
    />
    </div>
  );
};
