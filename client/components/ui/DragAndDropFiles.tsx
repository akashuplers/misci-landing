// components/FileUploader.js

import { allowedFormats, allowedFormatsString, createBlogLink, maxFileSize } from '@/helpers/utils';
import {useBlogLinkStore, useFileUploadStore, useRepurposeFileStore} from '@/store/appState';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';
import { addFilesToTheSearch, wait } from '@/store/appHelpers';
import useStore from '@/store/store';

export const REPURPOSE_MAX_SIZE_MB = 7;
export const REPURPOSE_MAX_SIZE = maxFileSize( REPURPOSE_MAX_SIZE_MB );

const isUserAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const DragAndDropFiles = ({onClickHereButtonClick}:{
  onClickHereButtonClick:()=>void
} ) => {
  // const [selectedFiles, setSelectedFiles] = useState([]);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const addMultipleSelectedFiles = useRepurposeFileStore((state) => state.addMultipleSelectedFiles);
  const addSelectedFile = useRepurposeFileStore((state) => state.addSelectedFile);
  const [errors, setErrors] = useState<string[]>([]);
  // useBlogLinkStore
  const blogLinks = useBlogLinkStore((state) => state.blogLinks);
  const setBlogLinks = useBlogLinkStore((state) => state.setBlogLinks);
  const addBlogLink = useBlogLinkStore((state) => state.addBlogLink);
  const removeBlogLink = useBlogLinkStore((state) => state.removeBlogLink);
  const { setShowFileStatus, setFileConfig}= useFileUploadStore()

  const onDrop = async (acceptedFiles: File[]) => {

     if (!isUserAuthenticated()) {
    if (acceptedFiles.length > 1) {
      setErrors(["Guest user can add only 1 File, to add multiple files please sign up"]);
      return;
    }
    // If the code reaches here, only one file was uploaded and you can proceed with that one.
    acceptedFiles = acceptedFiles.slice(0, 1); // Keep only the first file
  }

    const prevFiles = [...selectedFiles];
    setShowFileStatus(true);
    const initialFiles = acceptedFiles.map((file) => ({
      name: file.name,
      size: String(file.size),
      percentage: 0,
      id: '',
    }));
    setFileConfig(initialFiles);
    await wait(1000);
    const newFilesNames = acceptedFiles.map((file) => file.name);
    const fileObj = newFilesNames.map((file, index) => createBlogLink(file, 'file', prevFiles.length + index + 1));
    const dataOfLinks = [...blogLinks];
    const { data, errors, files } = addFilesToTheSearch(fileObj, dataOfLinks, acceptedFiles, REPURPOSE_MAX_SIZE, 6,isAuthenticated);
    const uniquieSetOfErrors = Array.from(new Set([...errors]));
    setErrors(uniquieSetOfErrors);
    if (uniquieSetOfErrors.length > 0) {
      uniquieSetOfErrors.forEach((error) => {
        // toast.error(error);
      });
      setShowFileStatus(false);
      return;
    }
    const halfProcessedFiles = files?.map((file, index) => ({
      name: file.name,
      size: String(file.size),
      percentage: 50,
      id: data.filter((link) => link.label === file.name)[0].id,
    }));
    halfProcessedFiles && setFileConfig(halfProcessedFiles);
  
    files?.forEach((file) => {
      addSelectedFile({
        file: file,
        id: file.name,
      });
    });
    await wait(2000); 
    setBlogLinks(data);
    const fullyProcessedFiles = files?.map((file) => ({
      name: file.name,
      size: String(file.size),
      percentage: 100,
      id: data.filter((link) => link.label === file.name)[0].id,
    }));
    fullyProcessedFiles && setFileConfig(fullyProcessedFiles);
  
    setShowFileStatus(false);
    toast.success('File added successfully', {
      autoClose: 2000,
    });
  };
  

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      '.docx': [],
      '.txt': [],
      'text/plain': [],
      'text/rtf': [],
    },
    maxFiles: isUserAuthenticated() ? REPURPOSE_MAX_SIZE : 1,
    multiple: isUserAuthenticated(),
  });

  return (
    <div {...getRootProps()} className="p-4 border-none rounded-md relative ">
          <div   className={`w-full h-28 cursor-pointer flex items-center justify-center scale-105 transition-transform transform-cpu ease-in-out ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'} rounded-[10px] border border-dotted border-gray-300`}>
              <div className={`self-stretch justify-start items-center gap-3 inline-flex `}>
                  <img className="w-[33.14px] h-[33.14px]" src={'icons/foldericon.png'} />
                  <div className="justify-start items-center gap-3 flex">
                      <span className={`text-center text-slate-600 text-base font-normal`}>Drag and Drop files or </span>
                     <Tooltip content={`Select file formats like PDF, DOCX, TXT (size <${REPURPOSE_MAX_SIZE_MB}MB)`} direction="top">
                     <button className="px-2.5 py-[9px] rounded-lg border border-indigo-600 flex-col justify-start items-start gap-2.5 inline-flex">
                          <div className="justify-center items-center gap-2 inline-flex">
                          <CloudArrowUpIcon className='h-6 w-6 text-indigo-600' />
                              <div className="text-indigo-600 text-sm font-normal">Upload file</div>
                              <input {...getInputProps()} multiple accept={"application/pdf, .docx, .txt, text/plain, text/rtf"} />    
                          </div>
                      </button>
                      </Tooltip>
                  </div>
              </div>
          </div>
          <div className='flex items-center mt-2 justify-between'>
          <div className="flex flex-col ">
              {errors.map((error, index) => (
                  <div key={index} className="text-red-500 text-left text-sm font-normal">{error}</div>
              ))}
            </div>
          <div className="text-right text-sm font-normal flex justify-end gap-2 flex-wrap">
            <h1>Max file size: 7MB. If you have more than 7MB</h1>
            <button onClick={onClickHereButtonClick} >
              <strong className="text-indigo-500">Click here</strong>
            </button>
          </div>
          </div>
          
    </div>
  );
};

export default DragAndDropFiles;