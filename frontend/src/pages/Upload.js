import React, { useContext } from 'react';
import FileUpload from '../components/FileUpload';
import { DataContext } from '../contexts/DataContext';

const Upload = () => {
    const {
        handleFileUpload
    } = useContext(DataContext);

    return <FileUpload onFileUpload={handleFileUpload} />;
};

export default Upload;
