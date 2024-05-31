import React, { createContext, useState } from 'react';
import api from '../services/apiService';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
        const response = await api.get('/files/uploaded');
        setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching shared files:', error);
    }
  };

  const fetchRecentDownloads = async () => {
    try {
        const response = await api.get('files/downloaded');
        setRecentDownloads(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

   const handleFileUpload = async (file, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description);
        formData.append('accessPermission', metadata.accessPermission.value);

        try {
            const response = await api.post('/files/upload', formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const handleFileDownload = async (id, filename) => {
        try {
            const response = await api.get(`/files/${id}`, { responseType: 'blob' });
            console.log(response.headers)
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            a.download = filename; // Use extracted filename for downloading

            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    };


    const handleFileUpdate = async (id, updatedData) => {
        try {
            const response = await api.put(`/files/${id}`, updatedData);
            // Update state or handle response as needed
            console.log('File updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating file:', error);
        }
    };

    const handleFileDelete = async (id) => {
        try {
            await api.delete(`/files/${id}`);
            // Update state or handle response as needed
            console.log('File deleted successfully');
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

  return (
    <DataContext.Provider
      value={{
              files,
              fetchFiles,
              fetchUploadedFiles,
              fetchRecentDownloads,
              recentDownloads,
              uploadedFiles,
              handleFileUpload,
              handleFileDownload,
              handleFileUpdate,
              handleFileDelete
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
