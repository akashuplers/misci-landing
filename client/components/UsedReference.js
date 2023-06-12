
const UsedReference = ({ reference, index, handleRefClick }) => {
    console.log("UsedReference.js: UsedReference: ref: ", reference)
    return (
        <div
            key={index}
            className="ref-button cta relative"
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
