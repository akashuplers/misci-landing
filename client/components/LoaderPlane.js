import React from 'react'

export default function LoaderPlane() {
  return (
    <div className="mx-auto ml-0 pl-10 text-center flex center flex-col">
      <img className="mx-auto" src="/animation.gif"></img> 
      <div className="-mt-12 animate-pulse text-xs">Loading ...</div>
    </div>
  )
}
