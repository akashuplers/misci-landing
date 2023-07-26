import Tooltip from "./Tooltip";


interface Props {
    selected: boolean;
    text: string;
    handleClick: (index: number) => void;
    index: number;
    wholeData?: any;
}

export const Chip = ({ selected, text, handleClick, index, wholeData }: Props) => {
    console.log(wholeData);
    return <>
        {
            wholeData != null ? (
                <Tooltip content={wholeData.realSource} direction="top" className="text-xs">
                    <button className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
                        <span className=" text-sm font-normal leading-tight">{text}</span>
                    </button>
                </Tooltip>
            ) : (
                <button className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center gap-2.5 inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
                    <span className=" text-sm font-normal leading-tight">{text}</span>
                </button>
            )
        }
    </>
};
