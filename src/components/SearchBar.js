import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <Form inline onSubmit={handleSubmit}>
            <Form.Control type="text" placeholder="Search" className="mr-sm-2" value={query} onChange={handleChange} />
            <Button type="submit">Search</Button>
        </Form>
    );
};

export default SearchBar;
