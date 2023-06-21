import { useEffect, useRef, useState } from 'react';
import ReactLoading from "react-loading";
import Modal from "react-modal";
import { toast } from 'react-toastify';
const VERIFY_URL = 'https://maverick.lille.ai/auth/verify-otp'

const OTPModal = (
    {
        showOTPModal,
        setShowOTPModal,
        setPFModal
    }
) => {
    const [otp, setOTP] = useState('');
    const [sendingLoading, setSendingLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        setOTP((prevOtp) => {
            const updatedOtp = { ...prevOtp, [`digit-${index}`]: value };
            return updatedOtp;
        });
        // Move to the next input field
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };
    useEffect(() => {
        // focus on first
        if (inputRefs?.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [inputRefs])


    const handlePaste = (e) => {
        const otpString = e.clipboardData.getData('text/plain').slice(0, 6);
        var otpDigits = otpString.split('')
        // remove blank spaces
        otpDigits = otpDigits.filter((digit) => digit !== ' ');
        setOTP((prevOtp) => {
            const updatedOtp = { ...prevOtp };

            for (let i = 0; i < otpDigits.length; i++) {
                const digit = otpDigits[i];
                const digitIndex = i;

                if (inputRefs.current[digitIndex]) {
                    updatedOtp[`digit-${digitIndex}`] = digit;
                    inputRefs.current[digitIndex].value = digit;
                }
            }

            return updatedOtp;
        });
    };
    const handleVerifyOtp = async () => {
        setSendingLoading(true);
        try {
            const getToken = localStorage.getItem("token");
            // conver to single string the opt
            const otpPayload = Object.values(otp).join('');

            const response = await fetch(VERIFY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + getToken,
                },
                body: JSON.stringify({ otp: otpPayload }),
            });

            const data = await response.json();

            if (data.error == true) {
                toast.error(data.message);
                setPFModal(false)
            } else {
                toast.success(data.message);
                setShowOTPModal(false);
                setTimeout(() => {
                    setPFModal(true);
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while verifying OTP.');
        }
        setSendingLoading(false);
    }
    const handleClearOtp = () => {
        setOTP({});
        inputRefs.current.forEach((ref) => (ref.value = ''));
        inputRefs.current[0].focus();
    };

    const handleResendOtp = async () => {
        const SEND_OTP_URL = "https://maverick.lille.ai/auth/send-otp";
        var getToken = localStorage.getItem("token");
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getToken,
            },
        };

        fetch(SEND_OTP_URL, requestOptions)
            .then((response) => {
                console.log("RESPONSE FROM SEND OTP");
                console.log(response);
                console.log(response.json());
                toast.success("OTP Resend successfully");
            })
            .catch((error) => {
                console.log("ERROR FROM SEND OTP");
                console.log(error);
                toast.error("Error while sending OTP");
            });
    };

    return (
        <Modal
            isOpen={showOTPModal}
            onRequestClose={() => { }}
            ariaHideApp={false}
            className="w-[100%] sm:w-[38%] max-h-[95%]"
            style={{
                overlay: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: "9999",
                },
                content: {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    border: "none",
                    background: "white",
                    // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
                    borderRadius: "8px",
                    // width: "100%",
                    maxWidth: "380px",
                    bottom: "",
                    zIndex: "999",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                    padding: "30px",
                    paddingBottom: "0px",
                },
            }}
        >
            <div className="w-full">
                <div className="bg-white h-full py-3 rounded text-center">
                    <h1 className="text-xl font">To verify the email you provided Lille has sent an OTP. Please check the email and add the OTP here:</h1>
                    <div id="otp" className="flex flex-row justify-center text-center px-2 mt-5">
                        {Array.from({ length: 6 }, (_, index) => (
                            <input
                                key={index}
                                className="m-2 border h-10 w-10 text-center form-control rounded"
                                type="text"
                                id={`digit-${index}`}
                                maxLength="1"
                                value={otp[`digit-${index}`] || ''}
                                onChange={(e) => handleOtpChange(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onPaste={handlePaste}
                                inputMode="numeric" // Restrict to numeric input
                                pattern="[0-9]*"
                            />
                        ))}
                    </div>

                    <div className="flex justify-center text-center mt-5">
                        <button
                            className="flex items-center text-blue-700 hover:text-blue-900 cursor-pointer cta-invert"
                            onClick={handleVerifyOtp}
                        >
                            {
                                sendingLoading ? <ReactLoading
                                    width={25}
                                    height={25}
                                    round={true}
                                    color={"#ffffff"}
                                /> : <>
                                    <span className="font-bold">Verify</span>
                                    <i className="bx bx-caret-right ml-1"></i>
                                </>
                            }
                        </button>
                    </div>
                    <div className="flex justify-between mt-5">
                        <button
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            onClick={handleClearOtp}
                        >
                            Clear
                        </button>
                        <button
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            onClick={handleResendOtp}
                        >
                            Resend OTP
                        </button>
                    </div>

                </div>
            </div>
        </Modal>
    );
};

export default OTPModal;
