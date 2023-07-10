import React, { KeyboardEventHandler ,useEffect} from 'react';

import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';

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

export default function RePurpose({value, setValue}){
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (event) => {
    const elementId = generateRandomId();
    const inputLength = value.length;
    if (inputLength >= 3) {
      toast.error('You can only add 3 blogs');
      return;
    }
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setValue((prev) => [...prev, createOption(inputValue,elementId, inputLength+1)]);
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
    className=""
      components={components}
      inputValue={inputValue}
      isClearable
      isMulti
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
