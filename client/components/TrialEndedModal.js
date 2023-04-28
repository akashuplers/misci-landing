import React, {useState} from "react";
import { toast } from "react-toastify";
import styles from "./styles/trial-ended-modal.module.css"
import ReactModal from "react-modal";

const TrialEndedModal = () => {
    const [open, setOpen] = useState(true);

    return (
        <ReactModal
            isOpen={open}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center w-full h-full p-4 overflow-auto bg-black bg-opacity-50 z-50"
            overlayClassName="fixed inset-0 z-50"
            style={{
                overlay: {
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: "9999",
                },
            }}
        >
            <div className={`${styles.container} relative p-8 mx-auto bg-white rounded-xl shadow-lg`}>
                <h3 className="font-bold text-lg">Your Trial has Ended</h3>
                <p>Thank you for using Lille. You have exhausted your 25 free credits. You will no longer be able to generate new Blogs. If you want to continue with our services, please contact our center to start a paid subscription.</p>
                <button className={styles.contact}>Contact Us</button>
                <button className={styles.close} onClick={() => setOpen(prev => !prev)}>CLOSE</button>
                <svg className={styles.clock} xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z" fill="#b4aeff40"/></svg>
            </div>

        </ReactModal>
    );
};

export default TrialEndedModal;