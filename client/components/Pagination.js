import React, { useEffect, useState } from 'react';

const PAGE_COUNT = 12;

const Pagination = ({totalItems, pageSkip, setPageSkip}) => {
    const [paginationArr, setPaginationArr] = useState([]);

    useEffect(() => {
        if(!totalItems) return
        setPaginationArr(new Array(Math.ceil(totalItems / PAGE_COUNT)).fill(0))
    },[totalItems])

    

    return (
        paginationArr.length > 1 && (
            <div
                className="pagination"
                style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "2em",
                paddingBottom: "2em",
                }}
            >
                <ul
                style={{
                    display: "flex",
                    gap: "2em",
                    listStyleType: "none",
                }}
                >
                {paginationArr.map((el, index) => (
                    <li
                        key={index}
                        style={{
                            border: "1px solid",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        className={pageSkip === index ? "active" : ""}
                        onClick={(e) => {
                            setPageSkip(index);
                        }}
                    >
                        {index + 1}
                    </li>
                ))}
                </ul>
            </div>
        )
    );
};

export default Pagination;