import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles/trial-ended-modal.module.css";
import ReactModal from "react-modal";
import Link from "next/link";

const TrialEndedModal = ({ setTrailModal }) => {
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
      <div
        className={`${styles.container} relative p-8 mx-auto bg-white rounded-xl shadow-lg`}
      >
        <h3 className="font-bold text-lg">Your Trial has Ended</h3>
        <p>
          Thank you for using Lille. You have exhausted your 25 free credits.
          You will no longer be able to generate new Blogs. If you want to
          continue with our services, please contact our center to start a paid
          subscription.
        </p>
        <a
          href="mailto:info@nowigence.com"
          target="_blank"
          className={styles.contact}
        >
          Contact Us
        </a>
        {/* <div className="flex flex-shrink-0 pb-0 pt-4" style={{ zIndex: 100 }}>
          <Link
            href="/upgrade"
            className="ml-6 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style={{
              margin: "0em 0.5em",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              background: "var(--primary-blue)",
            }}
          >
            UPGRADE
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div> */}
        <button
          className={styles.close}
          onClick={() => {
            setOpen((prev) => !prev);
            setTrailModal(false);
          }}
        >
          CLOSE
        </button>
        <svg
          className={styles.clock}
          xmlns="http://www.w3.org/2000/svg"
          width="400"
          height="400"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z"
            fill="#b4aeff40"
          />
        </svg>
      </div>
    </ReactModal>
  );
};

export default TrialEndedModal;
