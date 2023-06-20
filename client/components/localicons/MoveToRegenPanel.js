import React from 'react'
import { DownIcon } from './localicons'

const MoveToRegenPanel = () => {
    return (
        <div className="absolute -right-[72px] top-[50%] lg:hidden z-50 -rotate-[90deg]  border border-blue-700 rounded-t-xl">
            <a
                className="bg-transparent  text-blue-700  font-bold py-2 px-3 rounded-full flex flex-row-reverse items-center justify-between"
                href="#regenblog"
            >
                <span>
                    Regenerate
                </span>
                <span className="rotate-[90deg]">
                    <DownIcon />

                </span>            </a>
        </div>
    )
}

export default MoveToRegenPanel 