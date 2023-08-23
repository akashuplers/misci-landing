import { DocumentIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Tooltip from "./Tooltip";


interface Props extends React.HTMLAttributes<HTMLButtonElement> {
    selected: boolean;
    text: string;
    handleClick: (index: number) => void;
    index: number;
    wholeData?: any;
    rest?: any;
}

export const Chip = ({ selected, text, handleClick, index, wholeData , rest}: Props) => {
    return <>
        {
            wholeData != null ? (
                <Tooltip content={wholeData.realSource} direction="top" className="text-xs">
                    <button {...rest} className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
                        <span className=" text-sm font-normal leading-tight">{text}</span>
                    </button>
                </Tooltip>
            ) : (
                <button  
                {...rest}
                className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center gap-2.5 inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
                    <span className=" text-sm font-normal leading-tight">{text}</span>
                </button>
            )
        }
    </>
};

interface FileChipProps extends React.HTMLAttributes<HTMLDivElement> {
    rest?: any;
    fileName: string;
    fileSize: string;
    onCrossClick?: () => void;
}

export const FileChipIcon = ({  rest , fileName, fileSize, onCrossClick}: FileChipProps) => {
    return <div className="min-w-fit h-9 px-3.5 py-2 rounded-full border border-gray-300 justify-start items-center gap-3 inline-flex" {...rest}>
        <div className="justify-start items-center gap-1.5 flex">
            <div className="w-5 h-5 flex-col justify-center items-center inline-flex text-indigo-500" >
                <DocumentIcon />
            </div>
            <div className="text-gray-900 text-sm font-normal w-full">{fileName.length > 10 ? fileName.slice(0, 10) + '...' : fileName}</div>
        </div>
        <div className="opacity-50 text-gray-900 text-xs font-normal">{fileSize}</div>
        <button className="w-5 h-5 px-px py-px opacity-70 justify-center items-center flex" onClick={() => {
            if (onCrossClick) {
                onCrossClick();
            }
        }}>
        <XCircleIcon />
        </button>
    </div>
}

interface FileUploadCardProps extends React.HTMLAttributes<HTMLDivElement> {
    fileName: string;
    fileSize: string;
    progress: number;
    rest?: any;
}

export const FileUploadCard = ({ fileName, fileSize, progress , rest} : FileUploadCardProps) => {
    const progressBarWidth = `${progress}%`;
    const trimedFileName = fileName.length > 10 ? fileName.slice(0, 10) + '...' : fileName;
    return (
      <div className="min-w-[45%] min-h-12  p-2 bg-white border rounded-lg flex items-center gap-3" {...rest} style={{
      }}>
        <div className="p-1.5 bg-violet-100 rounded-full flex">
          <div className="w-6 h-6 text-indigo-600 rounded-full" >
            <DocumentIcon />
        </div>
        </div>
        <div className="flex-grow flex-shrink-0 flex-basis-0 flex-col items-start justify-center">
          <div className="flex items-center gap-0.5 justify-between w-full">
            <div className="opacity-70 text-gray-800 text-sm font-bold leading-tight">
              {trimedFileName}
            </div>
            <div className="opacity-50 text-gray-800 text-xs font-medium leading-none">
              {fileSize}
            </div>
          </div>
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="flex-grow flex-shrink-0 relative flex-basis-0 h-2 bg-gray-300 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                style={{ width: progressBarWidth }}
              />
            </div>
            <div className="w-8 text-center text-zinc-400 text-xs font-medium leading-none">
              {progress}%
            </div>
          </div>
        </div>
      </div>
    );
  };