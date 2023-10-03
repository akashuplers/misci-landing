<<<<<<< HEAD
import DeleteModal from "@/modals/DeleteModal";
import { LinkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { popoverContentPropDefs } from "@radix-ui/themes";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

const UsedReference = ({ reference, setReference, index, handleRefClick, onDelete, handleCitationFunction, idCountMap }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
      <>
        <div
          key={index}
          className={`ref-button cta relative flex justify-between items-center ${
            reference.selected ? "active" : ""
          }`}
          style={{
            borderRadius: "100px",
            padding: "0.25em 0.75em",
            backgroundColor: "#e9e9e9",
            border: "none",
            color: "black",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={(e)=>{
            setReference((prev)=>{
              let newRef = [...prev];
              let localId = reference.localId;
              let refIndex = newRef.findIndex((ref)=>ref.localId === localId);
              newRef[refIndex].selected = !newRef[refIndex].selected;
              return newRef;
            })
          }}
          data-source={reference.source}
        >
          {reference.source}
          <span className="flex gap-[0.05rem] text-slate-400">
            {/* <Tooltip content={reference.url} direction="top" >
                    <a href={reference.url}
                        target="_blank"
                    >
                        <LinkIcon className="w-4 h-4 ml-2" />
                    </a>
                    </Tooltip> */}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                <a href={reference.url}
                        target="_blank"
                    >
                        <LinkIcon className="w-4 h-4 ml-2" />
                    </a>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="TooltipContent" sideOffset={5}>
                    <div className="bg-gray-900 rounded-2xl px-5 text-white h-full w-96 z-50">
                    {reference.url}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <TrashIcon
              className="w-4 h-4 ml-2"
              onClick={() => {
                setShowDeleteModal(true);
              }}
            />
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
              zIndex: "0",
              alignItems: "center",
            }}
          > 
            {idCountMap(reference?.id)}
          </span>
        </div>
        <DeleteModal
          isOpen={showDeleteModal}
          onCancel={() => {
            setShowDeleteModal(false);
          }}
          data={reference}
          onDelete={() => {
            onDelete(reference);
            setShowDeleteModal(false);
          }}
        />
      </>
=======

const UsedReference = ({ reference, index, handleRefClick }) => {
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
>>>>>>> misc-cp-prod-adg
    );
};

export default UsedReference;
