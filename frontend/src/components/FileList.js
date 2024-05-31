import React, { useState, useContext } from 'react';
import { ListGroup, Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSave, FaLock, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { DataContext } from '../contexts/DataContext';
import Select from 'react-select';
import { toast } from 'react-toastify';

const options = [
    { value: 'private', label: <span className="text-danger"><FaLock /> Private</span> },
    { value: 'public', label: <span className="text-success"><FaGlobe /> Public</span> }
];

const FileList = ({ files }) => {
    const { handleFileUpdate, handleFileDelete, handleFileDownload, fetchUploadedFiles } = useContext(DataContext);
    const [editingFileId, setEditingFileId] = useState(null);
    const [editedFileData, setEditedFileData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    const handleEditClick = (file) => {
        setEditingFileId(file._id);
        setEditedFileData({
            name: file.name,
            description: file.description,
            visibility: options.find(option => option.value === file.visibility),
        });
    };

    const handleCancelClick = () => {
        setEditingFileId(null);
        setEditedFileData({});
    };

    const handleSaveClick = async (file) => {
        try {
            await handleFileUpdate(file._id, {
                ...editedFileData,
                visibility: editedFileData.visibility.value,
            });
            setEditingFileId(null);
            toast.success(`${file.name} updated successfully!`);
        } catch (error) {
            toast.error(`Failed to update ${file.name}`);
        }
    };

    const handleChange = (field, value) => {
        setEditedFileData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await handleFileDelete(fileToDelete._id);
            await fetchUploadedFiles();
            toast.success(`${fileToDelete.name} deleted successfully!`);
        } catch (error) {
            toast.error(`Failed to delete ${fileToDelete.name}`);
        }
        setShowDeleteModal(false);
        setFileToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setFileToDelete(null);
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="8">
                    <h3>Manage Uploaded Files</h3>
                    {files.length === 0 ? (
                        <p className="text-center">
                            No files uploaded yet. Here you can manage your uploaded files by editing or deleting them.
                            To start uploading, navigate to the <Link to="/upload">upload page</Link>.
                        </p>
                    ) : (
                        <ListGroup>
                            {files.map((file) => (
                                <ListGroup.Item key={file._id}>
                                    {editingFileId === file._id ? (
                                        <div>
                                            <Form>
                                                <Form.Group controlId="formFileName">
                                                    <Form.Label>Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={editedFileData.name}
                                                        onChange={(e) => handleChange('name', e.target.value)}
                                                    />
                                                </Form.Group>
                                                <Form.Group controlId="formFileDescription" className="mt-2">
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={editedFileData.description}
                                                        onChange={(e) => handleChange('description', e.target.value)}
                                                    />
                                                </Form.Group>
                                                <Form.Group controlId="formFileVisibility" className="mt-2">
                                                    <Form.Label>Visibility</Form.Label>
                                                    <Select
                                                        value={editedFileData.visibility}
                                                        onChange={(option) => handleChange('visibility', option)}
                                                        options={options}
                                                    />
                                                </Form.Group>
                                                <div className="d-flex justify-content-end mt-3">
                                                    <Button variant="primary" onClick={() => handleSaveClick(file)}><FaSave /> Save</Button>
                                                    <Button variant="secondary" className="ms-2" onClick={handleCancelClick}>Cancel</Button>
                                                </div>
                                            </Form>
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <a href="#" onClick={() => handleFileDownload(file._id, file.name)}>{file.name}</a> - {file.size} KB - {new Date(file.uploadDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <Button variant="link" className="text-primary" onClick={() => handleEditClick(file)}><FaEdit /></Button>
                                                <Button variant="link" className="text-danger" onClick={() => handleDeleteClick(file)}><FaTrash /></Button>
                                            </div>
                                        </div>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}

                    <Modal show={showDeleteModal} onHide={handleCancelDelete}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Delete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to permanently delete this file?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default FileList;
