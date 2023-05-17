import { meeAPI } from "@/graphql/querys/mee";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import styles from "./styles/trial-ended-modal.module.css";

const TrialEndedModal = ({ setTrailModal, topic }) => {
  console.log(";;", topic);
  const [open, setOpen] = useState(true);
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }
  const {
    data: meeData, loading: meeLoading, error: meeError, } = useQuery(meeAPI, {
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken,
        },
      },
      onError: ({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          for (let err of graphQLErrors) {
            switch (err.extensions.code) {
              case "UNAUTHENTICATED":
                localStorage.clear();
                window.location.href = "/";
            }
          }
        }
        if (networkError) {
          console.log(`[Network error]: ${networkError}`);
          if (
            `${networkError}` ===
            "ServerError: Response not successful: Received status code 401"
          ) {
            localStorage.clear();
            toast.error("Session Expired! Please Login Again..", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          }
        }
      },
    });
  useEffect(() => {
    if (meeData) {
      console.log("meeData", meeData);
      console.log(meeData.me.paid);
    }
  }, [meeData]);

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
        <h3 className="font-bold text-lg">
          {
            meeData && (meeData.me.isSubscribed === false ? (
              'Your Trial Period has ended'
            ) : (
              'Your Credit has expired'
            ))

          }</h3>
        <p>

          {/* 
        
          */}
          {` ${meeData && (meeData.me.isSubscribed === false ? (
            `  Thank you for using Lille. You have exhausted your 25 free credits. You will no longer be able to generate new blogs. If you want to continue benefitting from lille's capabilities please upgrade to paid plan, if you have any queris please contact us.`
          ) : (
            `Thank you for using Lille. You have exhausted your prescribed credits. You will no longer be able to generate new Blogs. If you want to continue benefitting from lille's capabilities please contact us.`
          ))
            }`}
        </p>
        <a
          href="mailto:info@nowigence.com"
          target="_blank"
          className={styles.contact}
        >
          Contact Us
        </a>

        {
          meeData && (meeData.me.isSubscribed === false ? (
            <div className="flex flex-shrink-0 pb-0 pt-4" style={{ zIndex: 100 }}>
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
            </div>
          ) : null
          )

        }
        {topic === null ? (
          <button
            className={styles.close}
            onClick={() => {
              setOpen((prev) => !prev);
              setTrailModal(false);
            }}
          >
            CLOSE
          </button>
        ) : (
          <button
            className={styles.close}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            CLOSE
          </button>
        )}
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
