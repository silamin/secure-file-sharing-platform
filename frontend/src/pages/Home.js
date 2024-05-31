import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, FormControl, Dropdown, DropdownButton, Pagination } from 'react-bootstrap';
import { FaShareAlt, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { toast } from 'react-toastify';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const { files, recentDownloads, fetchFiles, fetchRecentDownloads, handleFileDownload } = useContext(DataContext);

    useEffect(() => {
        const fetchData = async () => {
            await fetchFiles();
            if (isAuthenticated) {
                await fetchRecentDownloads();
            }
        };
        fetchData();
    }, [isAuthenticated]);

    const renderFileSizeDropdownItems = () => {
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        return units.map((unit, index) => (
            <Dropdown.Item key={index} eventKey={unit}>{unit}</Dropdown.Item>
        ));
    };

    const clearAllFilters = () => {
        setFilesFilterText('');
        setFilesFilterExtension('');
        setFileSizeRange({ min: '', max: '' });
        setFileSizeUnit({ min: 'MB', max: 'MB' });
        setSortBy('');
    };


    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const parseFileSize = (size, unit) => {
        const units = { 'Bytes': 1, 'KB': 1024, 'MB': 1048576, 'GB': 1073741824, 'TB': 1099511627776 };
        return size * (units[unit] || 1);
    };

    const fileExtensions = Array.from(new Set(files.map(file => {
        const fileNameParts = file.name.split('.');
        return fileNameParts[fileNameParts.length - 1].toLowerCase();
    })));

    const [featuredPage, setFeaturedPage] = useState(1);
    const itemsPerPage = isAuthenticated ? 6 : 9;

    const [filesFilterText, setFilesFilterText] = useState('');
    const [filesFilterExtension, setFilesFilterExtension] = useState('');
    const [fileSizeRange, setFileSizeRange] = useState({ min: '', max: '' });
    const [fileSizeUnit, setFileSizeUnit] = useState({ min: 'MB', max: 'MB' });
    const [sortBy, setSortBy] = useState('');

    const handleFileFilterChange = (e) => setFilesFilterText(e.target.value);
    const handleSortBy = (option) => setSortBy(option);

    const filteredFiles = files.filter((file) => {
        const fileNameParts = file.name.split('.');
        const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();

        const matchesText = file.name.toLowerCase().includes(filesFilterText.toLowerCase());
        const matchesExtension = !filesFilterExtension || fileExtension === filesFilterExtension.toLowerCase();
        const matchesSizeRange = (!fileSizeRange.min || file.size >= parseFileSize(parseFloat(fileSizeRange.min), fileSizeUnit.min)) &&
            (!fileSizeRange.max || file.size <= parseFileSize(parseFloat(fileSizeRange.max), fileSizeUnit.max));

        return matchesText && matchesExtension && matchesSizeRange;
    });

    const sortedFiles = [...filteredFiles];
    if (sortBy === 'date-asc') {
        sortedFiles.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    } else if (sortBy === 'date-desc') {
        sortedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } else if (sortBy === 'size-asc') {
        sortedFiles.sort((a, b) => a.size - b.size);
    } else if (sortBy === 'size-desc') {
        sortedFiles.sort((a, b) => b.size - a.size);
    }

    const paginatedFiles = sortedFiles.slice((featuredPage - 1) * itemsPerPage, featuredPage * itemsPerPage);
    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);

        const shareLink = (id) => {
        return `${process.env.REACT_APP_BASE_URL}/files/${id}`;
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link to clipboard.');
        }
    };

    const handleShare = (file) => {
        const link = shareLink(file._id);
        copyToClipboard(link);
    };

    const handleFileSizeRangeChange = (e) => {
        const { name, value } = e.target;
        setFileSizeRange(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileSizeUnitChange = (unitType, value) => {
        setFileSizeUnit(prevState => ({ ...prevState, [unitType]: value }));
    };

    const handleAction = async (file, action) => {
        if (action === 'download') {
            try {
                await handleFileDownload(file._id, file.name);
                await fetchFiles();
                if (isAuthenticated) {
                    await fetchRecentDownloads();
                }
                toast.success(`${file.name} downloaded successfully!`);
            } catch (error) {
                toast.error(`Failed to download ${file.name}`);
            }
        } else if (action === 'share') {
            handleShare(file);
        }
    };
    // Utility function to format date to human-readable format
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={12}>
                    <h1 className="text-center mb-4">Welcome to Secure File Sharing</h1>
                    <p className="text-center mb-5">Easily upload, manage, and share your files securely.</p>
                </Col>
            </Row>

            <Form className="mb-4">
                {files.length > 0 && (
                    <Row>
                        <Col md={2}>
                            <FormControl
                                type="text"
                                placeholder="Search featured files"
                                value={filesFilterText}
                                onChange={handleFileFilterChange}
                            />
                        </Col>
                        <Col md={1}>
                            <DropdownButton id="dropdown-basic-button" title=".ext" className="w-100">
                                {fileExtensions.map((extension, index) => (
                                    <Dropdown.Item key={index} onClick={() => setFilesFilterExtension(extension)}>{extension.toUpperCase()}</Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </Col>
                        <Col md={3} className="d-flex align-items-center">
                            <Form.Label className="w-100">File Size:</Form.Label>

                            <Form.Control
                                type="number"
                                placeholder="Min"
                                name="min"
                                value={fileSizeRange.min}
                                onChange={handleFileSizeRangeChange}
                            />
                            <DropdownButton id="dropdown-basic-button" title={fileSizeUnit.min} className="w-100 mx-1" onSelect={(value) => handleFileSizeUnitChange('min', value)}>
                                {renderFileSizeDropdownItems()}
                            </DropdownButton>
                        </Col>
                        <Col md={2} className="d-flex align-items-center">
                            <Form.Control
                                type="number"
                                placeholder="Max"
                                name="max"
                                value={fileSizeRange.max}
                                onChange={handleFileSizeRangeChange}
                                className="mx-1"
                            />
                            <DropdownButton id="dropdown-basic-button" title={fileSizeUnit.max} className="w-100" onSelect={(value) => handleFileSizeUnitChange('max', value)}>
                                {renderFileSizeDropdownItems()}
                            </DropdownButton>
                        </Col>
                        <Col md={1}>
                            <DropdownButton id="dropdown-basic-button" title="Sort by" className="w-100">
                                <Dropdown.Item onClick={() => handleSortBy('date-asc')}><FaArrowUp /> Date</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSortBy('date-desc')}><FaArrowDown /> Date</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSortBy('size-asc')}><FaArrowUp /> Size</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSortBy('size-desc')}><FaArrowDown /> Size</Dropdown.Item>
                            </DropdownButton>
                        </Col>
                        <Col md={2}>
                            <Button variant="danger" onClick={clearAllFilters}>Clear Filters</Button>
                        </Col>
                    </Row>
                )}
            </Form>


            <Row>
                {paginatedFiles.length > 0 ? (
                    paginatedFiles.map((file, index) => (
                        <Col key={index} md={isAuthenticated ? 4 : 3} className="mb-4">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <Card.Title>
                                        <a href="#" onClick={() => handleAction(file, 'download')}>  {/* Pass file and action */}
                                            {file.name}
                                        </a>
                                    </Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">Uploaded on: {formatDate(file.uploadDate)}</Card.Subtitle>
                                    <Card.Text>{file.description}</Card.Text>
                                    <Card.Text>Size: {formatBytes(file.size)}</Card.Text>
                                    <Card.Text>Downloads: {file.downloadCount}</Card.Text>
                                    <div className="d-flex justify-content-between">
                                        <Button variant="primary" className="mr-2" onClick={() => handleAction(file, 'download')}><FaDownload /> Download</Button>
                                        <Button variant="secondary" onClick={() => handleAction(file, 'share')}><FaShareAlt /> Share</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                        <Col md={12}>
                            {filteredFiles.length === 0 && files.length > 0 ? (
                                <p>No files available for download. <a href='#' variant="link" onClick={clearAllFilters}>Clear filters</a></p>
                            ) : (
                                <p>No public files have been uploaded to the system yet. Be the first to store your private files and share your public ones and start by logging in.</p>
                            )}
                        </Col>
                )}
            </Row>

            {totalPages > 1 && (
                <Pagination className="justify-content-center">
                    <Pagination.Prev
                        onClick={() => setFeaturedPage(prev => Math.max(prev - 1, 1))}
                        disabled={featuredPage === 1}
                    />
                    {[...Array(totalPages).keys()].map(number => (
                        <Pagination.Item
                            key={number + 1}
                            active={number + 1 === featuredPage}
                            onClick={() => setFeaturedPage(number + 1)}
                        >
                            {number + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next
                        onClick={() => setFeaturedPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={featuredPage === totalPages}
                    />
                </Pagination>
            )}

            <hr className="mt-5 mb-5" />

            {isAuthenticated && (
                <div>
                    <h2 className="mb-4">Recent Downloads</h2>
                    {recentDownloads.length > 0 ? (
                        <div className="recent-uploads-scroll">
                            <div className="d-flex">
                                {recentDownloads.map((file, index) => (
                                    <Card key={index} className="shadow-sm mr-3" style={{ minWidth: '18rem' }}>
                                        <Card.Body>
                                            <Card.Title>
                                                <a href="#" onClick={() => handleAction(file, 'download')}>  {/* Pass file and action */}
                                                    {file.name}
                                                </a>
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">Uploaded on: {formatDate(file.uploadDate)}</Card.Subtitle>
                                            <Card.Text>{file.description}</Card.Text>
                                            <Card.Text>Size: {formatBytes(file.size)}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No recent downloads available.</p>
                    )}
                    <hr className="mt-5 mb-5" />
                </div>
            )}


            <h2 className="mb-4">Why Choose Us?</h2>
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Secure Storage</Card.Title>
                            <Card.Text>
                                Your files are stored securely with end-to-end encryption, ensuring that only you and those you authorize can access them.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Easy Sharing</Card.Title>
                            <Card.Text>
                                Share files with just a few clicks. Generate secure links that you can share with your colleagues, friends, or family.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Access Anywhere</Card.Title>
                            <Card.Text>
                                Access your files from any device, anytime, anywhere. Our platform is optimized for all devices and screen sizes.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
