import Link from "next/link";
import React from "react";
import CreatableSelect from "react-select/creatable";

const PreferenceMobileTab = ({
  meeData,
  isFormat,
  handleUpdatePref,
  selectedOption,
  options, 
  setIsFormat,
}) => {
  
  return (
    <>
      {meeData?.me?.isSubscribed ? (
        <div className="mt-10 divide-y divide-gray-200">
          <div className="space-y-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Daily Feed Preferences
            </h3>
            <p className="max-w-2xl text-sm text-gray-500">
              Max 3 preferences allowed (Use alphabets and numbers only).
            </p>
          </div>
          <div className="mt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0"></dd>
              </div>
              <CreatableSelect
                defaultValue={selectedOption}
                isMulti
                onInputChange={(newValue) => {
                  let pattern = /^[a-zA-Z0-9\s]+$/;
                  if (pattern.test(newValue)) {
                    console.log("String contains only alphabets and numbers.");
                    setIsFormat(newValue.length > 100 || false);
                  } else {
                    console.log("String contains other characters.");
                    if (newValue) setIsFormat(true);
                  }
                }}
                onChange={(o) => {
                  setSelectedOption(o);
                }}
                options={options}
                isOptionDisabled={() => {
                  return isFormat || selectedOption.length >= 3;
                }}
              />
            </dl>
          </div>
          <button
            type="button"
            className="mt-5 rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={handleUpdatePref}
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center bg-gray-100 h-[600px]">
          <div className="p-8 rounded-md">
            <p className="text-gray-800 text-lg font-medium text-center mt-4">
              Upgrade to edit the daily feed preferences...
            </p>
          </div>
          <div className="flex flex-shrink-0 pb-0 pt-4">
            <Link
              to="/upgrade"
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
        </div>
      )}
    </>
  );
};

export default PreferenceMobileTab;
