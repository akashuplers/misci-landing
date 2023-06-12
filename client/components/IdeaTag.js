import React from 'react';

const IdeaTag = ({ tag, handleTagClick }) => {
  return (
    <div
      className="tag-button cta"
      style={{
        borderRadius: "100px",
        padding: "0.25em 0.75em",
        backgroundColor: "#e9e9e9",
        border: "none",
        color: "black",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={handleTagClick}
      data-tag={tag}
    >
      {tag.toUpperCase()}
    </div>
  );
};

export default IdeaTag;
