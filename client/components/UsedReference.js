import { LinkIcon, TrashIcon } from "@heroicons/react/24/outline";

const UsedReference = ({ reference, index, handleRefClick }) => {
    return (
        <div
            key={index}
            className="ref-button cta relative flex justify-between items-center "
            style={{
                borderRadius: "100px",
                padding: "0.25em 0.75em",
                backgroundColor: "#e9e9e9",
                border: "none",
                color: "black",
                cursor: "pointer",
                userSelect: "none",
            }}
            onClick={handleRefClick}
            data-source={reference.source}
        >
            {reference.source}
            <span className="flex gap-[0.05rem] text-slate-400">
                <LinkIcon className="w-4 h-4 ml-2" />
                <TrashIcon className="w-4 h-4 ml-2" />
            </span>
            <span
                className=""
                style={{
                    position: "absolute",
                    bottom: "65%",
                    left: "90%",
                    backgroundColor: "inherit",
                    color: "inherit",
                    width: "14px",
                    height: "14px",
                    fontSize: "0.65rem",
                    fontWeight: "600",
                    borderRadius: "100px",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: "1",
                    alignItems: "center",
                }}
            >
                {index + 1}
            </span>
        </div>
    );
};

export default UsedReference;
