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
<<<<<<< HEAD

export const SourceColors = {
  blue: 'bg-blue-800',
  orange: 'bg-red-300',
  yellow: 'bg-yellow-500',
}
export const SourceTab =({title, SourceColor, selected, onClick}) => {
  const color = SourceColors[SourceColor] || 'bg-blue-800';
  return <div className={`relative h-6 gap-1.5 py-1 justify-around items-center inline-flex `} onClick={onClick ?? console.log}>
  <div className={` ${color} w-1.5 h-1.5  rounded-full`} />
  <div className="text-gray-800 text-xs font-normal ">{title}</div>
  {/* selectdeivlinv */}
  {/* ${selected ? ' border-b-2 border-indigo-600' : ''}  */}
  {
      selected && <div className="bg-indigo-600 h-1 rounded-full absolute bottom-0 left-0 right-0 "></div>
  }
</div>
}
=======
>>>>>>> misc-cp-prod-adg
