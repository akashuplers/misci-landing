import React from "react";
import { toast } from "react-toastify";
import ReactModal from "react-modal";
import { useMutation } from "@apollo/client";
import { addPreferances } from "../graphql/mutations/addPreferances";
import LoaderPlane from "../components/LoaderPlane";
import ReactLoading from "react-loading"

export default function PreferencesModal({ pfmodal, setPFModal, getToken }) {
  const [AddPreferance, { loading: prefLoading }] = useMutation(
    addPreferances,
    {
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken,
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
    "latest Technology Trends",
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
    if(selectedPrefKeyword.length <= 2){
      toast.error("Selected Minimum 3 Keywords", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return
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

    if (selectedPrefKeyword.length >= 7) {
      toast.error("Max 7 keywords", {
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
          }
        }}
    >
      <div className="relative w-full max-w-2xl p-8 mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="text-lg">Select your interested topics</h2>
        <p className="text-sm text-gray-500 pb-5">
          Select atleast 3 Keywords so we can show you personalized topics and
          ideas
        </p>
        <div className="flex flex-wrap gap-1">
          {prefKeyword.map((keyword, index) => {
            return (
              <span
                className="cta"
                key={index}
                onClick={(e) => handlePrefClick(e, setSelectedPrefKeyword)}
              >
                {keyword}
              </span>
            );
          })}
        </div>
        <button
          className={`self-end px-4 py-2 mt-4 text-sm font-semibold text-white bg-indigo-600 rounded-md`}
          style={{
            width:"100px",
            height:"40px"
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
            // <LoaderPlane /> // Loader component
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </ReactModal>
  );
}
