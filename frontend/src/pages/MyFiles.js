import React from 'react';
import FileList from '../components/FileList';
import { DataContext } from '../contexts/DataContext';
import { useContext, useEffect } from 'react';

const MyFiles = () => {

    const {
        uploadedFiles,
        fetchUploadedFiles,
    } = useContext(DataContext);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUploadedFiles();
        };
        fetchData();
    }, []);

    return <FileList files={uploadedFiles} />;
};

export default MyFiles;
