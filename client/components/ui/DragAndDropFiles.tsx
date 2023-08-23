// components/FileUploader.js

import { allowedFormats, allowedFormatsString, createBlogLink, maxFileSize } from '@/helpers/utils';
import {useBlogLinkStore, useFileUploadStore, useRepurposeFileStore} from '@/store/appState';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';
import { addFilesToTheSearch, wait } from '@/store/appHelpers';

export const REPURPOSE_MAX_SIZE_MB = 7;
export const REPURPOSE_MAX_SIZE = maxFileSize( REPURPOSE_MAX_SIZE_MB );

const DragAndDropFiles = () => {
  // const [selectedFiles, setSelectedFiles] = useState([]);
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const addMultipleSelectedFiles = useRepurposeFileStore((state) => state.addMultipleSelectedFiles);
  const addSelectedFile = useRepurposeFileStore((state) => state.addSelectedFile);
  // useBlogLinkStore
  const blogLinks = useBlogLinkStore((state) => state.blogLinks);
  const setBlogLinks = useBlogLinkStore((state) => state.setBlogLinks);
  const addBlogLink = useBlogLinkStore((state) => state.addBlogLink);
  const removeBlogLink = useBlogLinkStore((state) => state.removeBlogLink);
  const { setShowFileStatus, setFileConfig}= useFileUploadStore()

  function filesInputValidation(files:File[]){
    if (files.length === 0) {
      toast.warn("Please select at least one file.");
      return;
    }
    if((files.length + blogLinks.length)> 6){
      toast.warn("You can add max 6 files or URLs");
      return;
    }
    if(files.length > 6){
      console.log("IFLES LENGHT", files.length)
      toast.warn("You can add max 6 files");
      return;
    }
    if (blogLinks.length > 6) {
      toast.error('You can add max 6 files or URLs');
      return;
    }
    // Check for New Files.
    let fileFormatError = false;
    let fileSizeError = false;
    Array.from(files).forEach((file) => {
      // Check file format
      if (!allowedFormats.includes(file.type)) {
        toast.error(`File format not allowed for ${file.name}.`);
        // Reset file input to clear selected files
        fileFormatError = true;
        return;
      }
  
      // Check file size
      if (file.size > REPURPOSE_MAX_SIZE) {
        toast.error(`File size exceeds the limit for ${file.name}. Maximum size allowed is ${REPURPOSE_MAX_SIZE_MB} MB.`);
        fileSizeError = true;
        return;
      }
    });
    if (fileFormatError || fileSizeError) {
      return null;
    }
    // check if files are unique
    console.log('BLOG LINKS');
    console.log(blogLinks);
    const currentFiles = blogLinks.filter((link) => link.type === 'file');
    const selectedFilesByUser = files.map((file, index) => (createBlogLink(file.name,'file', currentFiles.length + index + 1)));
    let isFileExists = false;
    selectedFilesByUser.forEach((file) => {
      const doesFileExist = currentFiles.find((currentFile) => currentFile.id === file.id);
      if (doesFileExist) {
        isFileExists = true;
        toast.error(`File ${file.label} already exists`);
        return;
      }
    }
    );
    if (isFileExists) {
      return null;
    }
    console.log('SELECTED FILES');
    console.log(selectedFiles);
    return files;
  }
  const onDrop = async (acceptedFiles: File[]) => {
    const prevFiles = [...selectedFiles];
    setShowFileStatus(true);
  
    // Step 1: Initialize files with 0% progress
    const initialFiles = acceptedFiles.map((file) => ({
      name: file.name,
      size: String(file.size),
      percentage: 0,
      id: '',
    }));
    setFileConfig(initialFiles);
  
    // Pause for user visibility
    await wait(1000); // Adjust the pause time as needed
  
    // Step 2: Create file links and perform additional processing
    const newFilesNames = acceptedFiles.map((file) => file.name);
    const fileObj = newFilesNames.map((file, index) => createBlogLink(file, 'file', prevFiles.length + index + 1));
    const dataOfLinks = [...blogLinks];
    const { data, errors, files } = addFilesToTheSearch(fileObj, dataOfLinks, acceptedFiles, REPURPOSE_MAX_SIZE, 6);
  
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error);
      });
      setShowFileStatus(false);
      return;
    }
  
    // Step 3: Update files with 50% progress
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
  
    // Pause for user visibility
    await wait(2000); // Adjust the pause time as needed
  
    // Step 4: Update files with 100% progress
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
    // accept: 'application/pdf,..docx, .txt, text/plain, text/rtf',
    accept: {
      'application/pdf': [],
      '.docx': [],
      '.txt': [],
      'text/plain': [],
      'text/rtf': [],
    }
    ,
    maxFiles: REPURPOSE_MAX_SIZE,
    multiple: true,
  });

  return (
    <div {...getRootProps()} className="p-4 border-none rounded-md ">
          <div   className={`w-full h-28 cursor-pointer flex items-center justify-center scale-105 transition-transform transform-cpu ease-in-out ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'} rounded-[10px] border border-dotted border-gray-300`}>
              <div className={`self-stretch justify-start items-center gap-3 inline-flex `}>
                  <img className="w-[33.14px] h-[33.14px]" src={'icons/foldericon.png'} />
                  <div className="justify-start items-center gap-3 flex">
                      <span className={`text-center text-slate-600 text-base font-normal`}>Drag or Drop files or </span>
                     <Tooltip content={`Select file formats like PDF, DOCX, TXT (size <${REPURPOSE_MAX_SIZE_MB}MB)`} direction="top">
                     <button className="px-2.5 py-[9px] rounded-lg border border-indigo-600 flex-col justify-start items-start gap-2.5 inline-flex">
                          <div className="justify-center items-center gap-2 inline-flex">
                          <CloudArrowUpIcon className='h-6 w-6 text-indigo-600' />
                              <div className="text-indigo-600 text-sm font-normal">Upload files</div>
                              <input {...getInputProps()} accept={"application/pdf, .docx, .txt, text/plain, text/rtf"} />    
                          </div>
                      </button>
                      </Tooltip>
                  </div>
              </div>
          </div>
    </div>
  );
};

export default DragAndDropFiles;