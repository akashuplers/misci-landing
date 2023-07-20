import { useState, useEffect } from 'react';
import { API_BASE_PATH, API_ROUTES } from '../constants/apiEndpoints';

export const useSendSavedTimeOfUser = () => {
    const [statusOfAPI, setStatusOfAPI] = useState({
        response: null,
        loading: false,
        error: null,
    });
    const sendSavedTime = (blogId, time, type) => {
        const getToken = localStorage.getItem("token");
        var getUserId;
        if (typeof window !== "undefined") {
            getUserId = localStorage.getItem("userId");
        }
        var getTempId;
        if (typeof window !== "undefined") {
            getTempId = localStorage.getItem("tempId");
        }
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
        setStatusOfAPI((prev) => ({ ...prev, loading: true }));
        const raw = JSON.stringify({
            userId: getToken ? getUserId : getTempId,
            blogId,
            time,
            type,
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        const URL = API_BASE_PATH + API_ROUTES.ADD_SAVED_TIME
        fetch(URL, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                setStatusOfAPI((prev) => ({ ...prev, response: result }));
            })
            .catch(error => {
                console.log('error', error);
                setStatusOfAPI((prev) => ({ ...prev, error }));
            }
            ).finally(() => {
                setStatusOfAPI((prev) => ({ ...prev, loading: false }))
            });
    };

    return { response : statusOfAPI.response, loading: statusOfAPI.loading, error: statusOfAPI.error, sendSavedTime };
};

export default useSendSavedTimeOfUser;