import React, { KeyboardEventHandler ,useEffect} from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import classNames from 'classnames';

const components = {
  DropdownIndicator: null,
};
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
const createOption = (label, id,index) => ({
  label,
  value: label,
  selected: false,
  id: id,
  index: index
});

export default function RePurpose({value, setValue, setShowRepourposeError}){
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
  
      setValue((prev) => [
        ...prev,
        createOption(inputValue, elementId, inputLength + 1)
      ]);
  
      setInputValue('');
      event.preventDefault();
    }
  };

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto' ,
    }}
    >
      <CreatableSelect
      components={components}
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
        setValue((prev) => [...prev, createOption(inputValue, elementId, inputLength + 1)]);
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
