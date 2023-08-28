import React, { KeyboardEventHandler ,useEffect} from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import Select, {
  components,
  ControlProps,
  Props,
  IndicatorSeparatorProps,
  MultiValueRemoveProps,
  StylesConfig,
} from 'react-select';
import Tooltip from '../ui/Tooltip';
import { DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ObjType, addObjectToSearchStore, validateIfURL } from '@/store/appHelpers';
import useStore from '@/store/store';

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
export const createOption = (label: string, id: string, index: number, type:
  ObjType
) => ({
  label,
  value: label,
  selected: false,
  id: id,
  index: index,
  type: type
});

 interface RePurPoseProps{
  setAllInput : any;
  allInputs: any;
  value: any;
  setValue: any;
  setShowRepourposeError: any;
  placeholder?: string;
  removeFile: (id: string) => void;
 }
 
export default function RePurpose({setAllInput ,allInputs, value, setValue, setShowRepourposeError, removeFile ,placeholder} : RePurPoseProps) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const handleKeyDown = (event: any) => {
    console.log(inputValue);
    const elementId = generateRandomId();
    const inputLength = value.length;
    if(inputValue===''){
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
      if (!inputValue) return;
      const validateType = 'url';
      console.log(validateType);
      const creatableOption = createOption(inputValue, elementId, inputLength, validateType);
      const {data: newBlogLinks, errors} = addObjectToSearchStore(creatableOption, value, isAuthenticated);
      console.log(newBlogLinks, errors);
      const setOfErrors = new Set(errors);
      const setOfErrorsArray = Array.from(setOfErrors);
      setErrors(setOfErrorsArray);
      console.log(setOfErrorsArray);
      if(setOfErrorsArray.length > 0){
        setOfErrorsArray.forEach((error: any) => {
          // toast.error(error);
        });
        return;
      }
      setValue(newBlogLinks);
      event.preventDefault();
    }
  };
  useEffect(() => {
    console.log(value);
  }, [value]);
  const MultiValueRemove = (props: MultiValueRemoveProps<any>) => {
    function handleClick(){
      const typeOfData = props.data.type
      if(typeOfData ==='file'){
        removeFile(props.data.id);
      }
      const newValues = value.filter((item :any) => item.id !== props.data.id);
      setValue(newValues);
    }
    return (
        <components.MultiValueRemove {...props} >
          <XCircleIcon className="h-6 w-6 text-gray-500" onClick={handleClick}/>
        </components.MultiValueRemove>
    );
  };  
  function MultiValueLabel(props: any) {
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
  const Separator = () => {
    return <></>;
  };
  const indicatorSeparatorStyle = {
    alignSelf: 'stretch',
    marginBottom: 8,
    marginTop: 8,
    width: 1,
    
  };
  
  const DropdownIndicator = () => {
    return null; // Return null to hide the default separator
  };
  const ClearIndicator = (props : any) => {
    return null; // Return null to hide the default separator
  };

const addNewURL = () => {
  if (inputValue === '') return;

  const elementId = generateRandomId();
  const inputLength = value.length;
  const validateType = 'url';
  const creatableOption = createOption(inputValue, elementId, inputLength, validateType);
  const { data: newBlogLinks, errors } = addObjectToSearchStore(creatableOption, value, isAuthenticated);
  
  if (errors.length > 0) {
    // Do not remove the inputValue if errors exist
    errors.forEach((error: any) => {
      // toast.error(error);
    });
    return;
  }
  
  // Reset inputValue after successfully adding the URL.
  setInputValue(''); 
  setValue(newBlogLinks);
};


  return (
    <div className="relative w-full ">
    <div className="flex items-center min-h-[60px] bg-white rounded-[10px]  border border-indigo-600 py-2.5 flex-col md:flex-row px-2  gap-2.5 relative ">
    <div style={{
      width: '100%',
      overflowX: 'auto' ,
    }}
    >
      <CreatableSelect
      components={{DropdownIndicator , MultiValueRemove, ClearIndicator, MultiValueLabel, IndicatorSeparator : () => <Separator />}}
      inputValue={inputValue}
      classNamePrefix="react-select"      
      styles={{
         
        multiValue: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: 'transparent',
          borderRadius: '1rem',
          border: '1px solid #C6CED6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.25rem',
          minWidth: 'auto',
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
          overflowX: 'auto',
          className: 'custom-scrollbar'
        }),
        control: (base, state) => ({
          
          ...base,
          border: 'none',
          "*": {
            boxShadow: "none !important",
          },
        }),
        placeholder: (baseStyles, state)=>({
          ...baseStyles, 
          textAlign: 'left'
        }),
      }}
      // isClearable
      isMulti
      onBlur={() => {
       addNewURL();
      }}
      isOptionDisabled={() => value.length >=6}
      menuIsOpen={false}
      onChange={(newValue) => setValue(newValue)}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? 'Give me a Prompt, URLs'}
      value={
        value.filter((item: any) => item.type === 'url')
      }
    />
   
    </div>
    </div>
     {/* errors */}
     <div className="flex flex-wrap gap-2 mt-2"> 
        {errors.map((error, index) => (
          <div key={index} className="text-red-500 text-left text-sm font-normal">{error}</div>
        ))}
    </div>
    </div>
  );
};
