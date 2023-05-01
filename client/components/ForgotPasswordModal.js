import React, {useState, useEffect, useRef} from 'react';
import Modal from 'react-modal';

import {toast} from "react-toastify"

import axios from 'axios';
import { API_BASE_PATH, API_ROUTES } from '@/constants/apiEndpoints';

const ForgotPasswordModal = ({forgotPass, setForgotPass, email}) => {
    const [forgotPassMail, setForgotPassMail] = useState(email ?? "")

    useEffect(() => {
        if(email && forgotPass) handleForgotPass();
        return
    },[email, forgotPass])

    const handleForgotPass = (e) => {
        if(e) e.preventDefault()

        axios({
            method: 'post',
            url: `${API_BASE_PATH}${API_ROUTES.FORGOT_PASSWORD}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "email": forgotPassMail
            }
        }).then(response => {
            if (response.data.message === 'success') {
                toast.success('Password reset email sent successfully');
            } else {
                toast.error(response.data.message);
            }
        })
        .catch(error => {
            console.log('error', error);
            toast.error("User not found");
        })
        .finally(() => {
            setForgotPassMail("");
            setForgotPass(false);
        })
    }
    
    return (
        <Modal
            isOpen={!email && forgotPass}
            ariaHideApp={false}
            onRequestClose={() => {
                setForgotPass(false)
            }}
            className="w-[70%]"
            style={{
                overlay: {
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: "9999",
                },
                content: {
                position: "absolute",
                top: "50%",
                left: "50%",
                right: "auto",
                border: "none",
                background: "white",
                boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
                borderRadius: "8px",
                // height: "75%",
                width: "50%",
                maxWidth: "450px",
                bottom: "",
                zIndex: "999",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                paddingBottom: "0px",
                },
            }}
        >
            <div className="flex items-center justify-center h-full">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-medium text-gray-800 mb-4">Forgot Password</h2>
                <form className="px-4 pb-4">
                    <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        className="w-full border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        value={forgotPassMail}
                        onChange={(e) => setForgotPassMail(e.target.value)}
                    />
                    </div>
                    <div className="flex items-center justify-between">
                    <button
                        className="text-indigo-600 font-medium inline-flex space-x-1 items-center cursor-pointer"
                        onClick={handleForgotPass}
                    >
                        Submit
                    </button>
                    <button
                        className="text-gray-600 hover:text-gray-800 font-medium focus:outline-none"
                        onClick={() => setForgotPass(false)}
                    >
                        Cancel
                    </button>
                    </div>
                </form>
                </div>
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;