import { useMutation } from "@apollo/client";
import React from "react";
import ReactLoading from "react-loading";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
import { addPreferances } from "../graphql/mutations/addPreferances";

export default function PreferencesModal({ pfmodal, setPFModal, getToken }) {
  var token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }
  const [AddPreferance, { loading: prefLoading }] = useMutation(
    addPreferances,
    {
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    }
  );

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [prefKeyword, setPrefKeyword] = React.useState([
    "Latest Vocational courses",
    "Organising a Job fair",
    "Campus interview preparation",
    "Latest Student Jobs",
    "Productivity in Work From Home",
    "Homeschooling",
    "Successful Customer service ",
    "Online learning",
    "Simple weight loss techniques",
    "Plant Based diets",
    "Latest Technology Trends",
    "Job Oriented courses",
    "Benefits of keto Diet",
    "Survive the Climate Change",
    "Affordable Healthcare ",
    "Cheap vacation destinations",
    "What are Super foods",
    "Investment ideas 2023",
    "Project planning techniques",
    "Leadership skills",
    "Recruitment and Hiring tips",
    "Technology training trends",
    "Enhancement in professional skills",
    "Event planning tips",
    "Choosing outsourcing partmers",
    "Income tax saving",
    "AI in emergency response",
  ]);

  const [selectedPrefKeyword, setSelectedPrefKeyword] = React.useState([]);

  function handlePref() {
    if (selectedPrefKeyword.length <= 0) {
      toast.error("Selected Minimum 1 Keywords", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    setIsButtonLoading(true); // Set loading state to true when the mutation starts
    AddPreferance({
      variables: {
        options: {
          keywords: selectedPrefKeyword,
        },
      },
      onCompleted: (data) => {
        console.log(data);
        setIsButtonLoading(false); // Set loading state to false when the mutation is complete
        setPFModal(false);
        toast.success("Preferences Saved!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      },
      onError: (error) => {
        console.error(error);
        setIsButtonLoading(false); // Set loading state to false when there is an error
      },
    }).catch((err) => {
      console.log(err);
      setIsButtonLoading(false); // Set loading state to false when there is an error
    });
  }
  const handlePrefClick = (e) => {
    const value = e.target.innerText;

    let check;
    selectedPrefKeyword.find((el) => {
      if (el === value) {
        check = true;
        e.target.classList.remove("active");
        setSelectedPrefKeyword((prev) => prev.filter((el) => el !== value));
        return;
      }
    });

    if (check) return;

    if (selectedPrefKeyword.length >= 3) {
      toast.error("Max 3 keywords", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    e.target.classList.add("active");
    setSelectedPrefKeyword((prev) => [...prev, value]);
  };

  return (
    <ReactModal
      isOpen={pfmodal}
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
      <div className="relative w-full p-8 mx-auto bg-white rounded-lg shadow-lg text-center hidden  lg:flex flex-col justify-center items-center gap-2" style={{ maxWidth: "45rem" }}>
        <h2 className="text-xl font-bold">Select topics of your interest</h2>
        <p className="text-sm text-gray-500 pb-5">
          Select at least 1 topics of your interest so that we can provide daily
          blogs.
        </p>
        <div className="flex flex-wrap gap-2 py-4">
          {prefKeyword.map((keyword, index) => {
            return (
              <span
                className="cta preference"
                style={{
                  borderRadius: "100px",
                  padding: "0.25em 0.75em",
                  backgroundColor: "#e9e9e9",
                  border: "none",
                  color: "black",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                key={index}
                onClick={(e) => handlePrefClick(e, setSelectedPrefKeyword)}
              >
                {keyword}
              </span>
            );
          })}
        </div>

        <button
          className={`cta-invert`}
          style={{
            width: "100px",
            height: "40px",
            marginLeft: 'auto'
          }}
          onClick={handlePref}
        >
          {isButtonLoading ? (
            <ReactLoading
              type={"spin"}
              color={"#ffffff"}
              height={25}
              width={25}
              className={"mx-auto"}
            />
          ) : (
            // <LoaderPlane /> // Loader component
            "Submit"
          )}
        </button>
      </div>
      <div className="relative w-full p-8 mx-auto bg-white rounded-lg shadow-lg text-center flex lg:hidden flex-col justify-center items-center gap-2" style={{ maxWidth: "45rem" }}>
        <h2 className="text-4xl font-bold">Select topics of your interest</h2>
        <p className="text-sm text-gray-500 pb-5">
          Select at least 1 topics of your interest so that we can provide daily
          blogs.
        </p>
        <div className="flex  flex-wrap gap-2 py-4">
          {prefKeyword.slice(0, 8).map((keyword, index) => {
            return (
              <span
                className="cta preference"
                style={{
                  borderRadius: "100px",
                  padding: "0.25em 0.75em",
                  backgroundColor: "#e9e9e9",
                  border: "none",
                  color: "black",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                key={index}
                onClick={(e) => handlePrefClick(e, setSelectedPrefKeyword)}
              >
                {keyword}
              </span>
            );
          })}
        </div>

        <button
          className={`cta-invert`}
          style={{
            width: "100px",
            height: "40px",
            marginLeft: 'auto'
          }}
          onClick={handlePref}
        >
          {isButtonLoading ? (
            <ReactLoading
              type={"spin"}
              color={"#ffffff"}
              height={25}
              width={25}
              className={"mx-auto"}
            />
          ) : (
            // <LoaderPlane /> // Loader component
            "Submit"
          )}
        </button>
      </div>
    </ReactModal>
  );
}
