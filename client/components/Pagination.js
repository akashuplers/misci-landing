import React, { useEffect, useState } from 'react';
import styles from "./styles/pagination.module.css"

const PAGE_COUNT = 12;

const Pagination = ({totalItems, pageSkip, setPageSkip}) => {
    const totalPages = Math.ceil(totalItems / PAGE_COUNT)
    const [currentPage, setCurrentPage] = useState(pageSkip + 1);
    const [visiblePages, setVisiblePages] = useState(
        getVisiblePages(currentPage, totalPages)
    );

    function onPageChange(page){
        setCurrentPage(page);
        setPageSkip(page - 1);
    }

    function getVisiblePages(currentPage, totalPages) {
        let startPage = currentPage - 3;
        let endPage = currentPage + 3;

        if (startPage < 1) {
            startPage = 1;
            endPage = 7;
        }

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - 6;
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).filter(num => num > 0);
    }

    function handlePageClick(page) {
        const newVisiblePages = getVisiblePages(page, totalPages);
        setVisiblePages(newVisiblePages);
        onPageChange(page);
    }    

    if(totalPages <= 0) return null
    return (
        <div className={styles.paginationContainer}>
            <ul className={styles.pagination}>
                <li>
                    <a
                        href="#"
                        className={`prev ${currentPage === 1 ? styles.disabled : ''}`}
                        onClick={() => handlePageClick(1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path d="M12.4877 12L13.4277 11.06L10.3744 8L13.4277 4.94L12.4877 4L8.48773 8L12.4877 12Z" fill="#333333"/>
                            <path d="M8.09467 12L9.03467 11.06L5.98133 8L9.03467 4.94L8.09467 4L4.09467 8L8.09467 12Z" fill="#333333"/>
                        </svg>
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={`prev ${currentPage === 1 ? styles.disabled : ''}`}
                        onClick={() => handlePageClick(currentPage - 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" viewBox="0 0 6 8" fill="none">
                            <path d="M4.82123 8L5.76123 7.06L2.7079 4L5.76123 0.94L4.82123 8.21774e-08L0.82123 4L4.82123 8Z" fill="black"/>
                        </svg>
                    </a>
                </li>
                {visiblePages.map((page) => (
                    <li key={page}>
                        <a
                            href="#"
                            className={`${styles.page} ${page === currentPage ? styles.active : ''}`}
                            onClick={() => handlePageClick(page)}
                        >
                        {page}
                        </a>
                    </li>
                ))}
                <li>
                    <a
                        href="#"
                        className={`next ${currentPage === totalPages ? styles.disabled : ''}`}
                        onClick={() => handlePageClick(currentPage + 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" viewBox="0 0 6 8" fill="none">
                            <path d="M1.70123 0L0.76123 0.94L3.81456 4L0.76123 7.06L1.70123 8L5.70123 4L1.70123 0Z" fill="black"/>
                        </svg>
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={`next ${currentPage === totalPages ? styles.disabled : ''}`}
                        onClick={() => handlePageClick(totalPages)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path d="M5.03473 4L4.09473 4.94L7.14806 8L4.09473 11.06L5.03473 12L9.03473 8L5.03473 4Z" fill="black"/>
                            <path d="M9.42779 4L8.48779 4.94L11.5411 8L8.48779 11.06L9.42779 12L13.4278 8L9.42779 4Z" fill="black"/>
                        </svg>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;