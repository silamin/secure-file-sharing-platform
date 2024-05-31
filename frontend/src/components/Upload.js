import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { FaLock, FaGlobe, FaTrash } from 'react-icons/fa';
import { DataContext } from '../contexts/DataContext';
import { toast } from 'react-toastify';

const options = [
    { value: 'private', label: <span className="text-danger"><FaLock /> Private</span> },
    { value: 'public', label: <span className="text-success"><FaGlobe /> Public</span> }
];

const UploadPage = () => {
    const { handleFileUpload } = useContext(DataContext);

    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).map(file => ({
            file,
            title: '',
            description: '',
            accessPermission: options[0],
            fileSize: (file.size / 1024).toFixed(2) + ' KB',
            fileExtension: file.name.split('.').pop(),
            uploading: false
        }));
        setFiles(selectedFiles);
    };

    const handleMetadataChange = (index, field, value) => {
        const updatedFiles = files.map((file, i) =>
            i === index ? { ...file, [field]: value } : file
        );
        setFiles(updatedFiles);
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
    };

    const startUpload = (index) => {
        const updatedFiles = [...files];
        updatedFiles[index].uploading = true;
        setFiles(updatedFiles);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const filesToUpload = files.filter(file => file.file && !file.uploading);
        for (const [index, file] of filesToUpload.entries()) {
            try {
                startUpload(index);
                await handleFileUpload(file.file, {
                    title: file.title,
                    description: file.description,
                    accessPermission: file.accessPermission
                });
                toast.success(`${file.file.name} uploaded successfully!`);
                const remainingFiles = files.filter((_, i) => i !== index);
                setFiles(remainingFiles);
            } catch (error) {
                toast.error(`Failed to upload ${file.file.name}`);
                const updatedFiles = [...files];
                updatedFiles[index].uploading = false;
                setFiles(updatedFiles);
            }
        }
    };

    return (
        <Container>
            <h2 className="mt-3">Upload Page</h2>
            <Form onSubmit={handleUpload}>
                <Form.Group controlId="formFiles" className="mb-3">
                    <Form.Label>Files</Form.Label>
                    <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />
                </Form.Group>
                {files.map((fileData, index) => (
                    !fileData.uploading && (
                        <div key={index} className="mb-4">
                            <Row className="align-items-center">
                                <Col>
                                    <h5>{fileData.file.name}</h5>
                                </Col>
                                <Col className="text-end">
                                    <Button variant="danger" onClick={() => handleRemoveFile(index)}>
                                        <FaTrash /> Remove
                                    </Button>
                                </Col>
                            </Row>

                            <Form.Group controlId={`formDescription${index}`} className="mt-2">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter description"
                                    value={fileData.description}
                                    onChange={(e) => handleMetadataChange(index, 'description', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId={`formAccessPermission${index}`} className="mt-2">
                                <Form.Label>Access Permission</Form.Label>
                                <Select
                                    value={fileData.accessPermission}
                                    onChange={(option) => handleMetadataChange(index, 'accessPermission', option)}
                                    options={options}
                                />
                            </Form.Group>
                            <div className="mt-2">
                                <p><strong>File Size:</strong> {fileData.fileSize}</p>
                            </div>
                        </div>
                    )
                ))}
                <Button
                    variant="primary"
                    type="submit"
                    disabled={files.length === 0 || files.some(file => file.uploading)}
                    className="w-100 mt-3 mb-4"
                >
                    Upload
                </Button>
            </Form>
        </Container>
    );
};

export default UploadPage;
