import React from 'react';
import { Pagination } from 'react-bootstrap';

const CustomPagination = ({ totalPages, currentPage, onPageChange }) => {
    const pageItems = [];
    for (let page = 1; page <= totalPages; page++) {
        pageItems.push(
            <Pagination.Item key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
                {page}
            </Pagination.Item>
        );
    }

    return (
        <Pagination>
            {pageItems}
        </Pagination>
    );
};

export default CustomPagination;
