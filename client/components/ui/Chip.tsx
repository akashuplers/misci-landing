import { DocumentIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Tooltip from "./Tooltip";
import { classNames } from "@/store/appHelpers";
import { DocumentPlusIcon } from "@heroicons/react/20/solid";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  text: string;
  handleClick?: (index: number) => void;
  index?: number;
  wholeData?: any;
  rest?: any;
}

export const Chip = ({
  selected = false,
  text,
  handleClick,
  index,
  wholeData,
  rest,
}: Props) => {
  return (
    <>
      <div
        {...rest}
        className={`min-h-[2rem] px-[18px] rounded-full justify-center items-center gap-2.5 inline-flex  ${
          selected ? "bg-indigo-700 text-white" : "bg-gray-200 text-slate-700 "
        }`}
        onClick={() => handleClick && handleClick(index ?? 0)}
      >
        <h3 className=" text-sm font-normal leading-tight">{text}</h3>
      </div>
    </>
  );
}; 
interface FileChipProps extends React.HTMLAttributes<HTMLDivElement> {
  rest?: any;
  fileName: string;
  fileSize: string;
  onCrossClick?: () => void;
}

export const FileChipIcon = ({
  rest,
  fileName,
  fileSize,
  onCrossClick,
}: FileChipProps) => {
  return (
    <div
      className="min-w-fit h-9 px-3.5 py-2 rounded-full border border-gray-300 justify-start items-center gap-3 inline-flex"
      {...rest}
    >
      <div className="justify-start items-center gap-1.5 flex">
        <div className="w-5 h-5 flex-col justify-center items-center inline-flex text-indigo-500">
          <DocumentIcon />
        </div>
        <div className="text-gray-900 text-sm font-normal w-full">
          {fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName}
        </div>
      </div>
      <div className="opacity-50 text-gray-900 text-xs font-normal">
        {fileSize}
      </div>
      <button
        className="w-5 h-5 px-px py-px opacity-70 justify-center items-center flex"
        onClick={() => {
          if (onCrossClick) {
            onCrossClick();
          }
        }}
      >
        <XCircleIcon />
      </button>
    </div>
  );
};

interface FileUploadCardProps extends React.HTMLAttributes<HTMLDivElement> {
  fileName: string;
  fileSize: string;
  progress: number;
  rest?: any;
}

export const FileUploadCard = ({
  fileName,
  fileSize,
  progress,
  rest,
}: FileUploadCardProps) => {
  const progressBarWidth = `${progress}%`;
  const trimedFileName =
    fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
  return (
    <div
      className="min-w-[45%] min-h-12  p-2 bg-white border rounded-lg flex items-center gap-3"
      {...rest}
      style={{}}
    >
      <div className="p-1.5 bg-violet-100 rounded-full flex">
        <div className="w-6 h-6 text-indigo-600 rounded-full">
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

export const FloatingBalls = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="51"
      height="51"
      viewBox="0 0 51 51"
      fill="none"
      className={className}
    >
      <g filter="url(#filter0_d_2158_42436)">
        <circle
          cx="25.8967"
          cy="21.3916"
          r="15.07"
          transform="rotate(-63.5145 25.8967 21.3916)"
          fill="url(#paint0_linear_2158_42436)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2158_42436"
          x="0.824219"
          y="0.318359"
          width="50.1445"
          height="50.1465"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.925 0 0 0 0 0.635938 0 0 0 0 0.669549 0 0 0 0.38 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2158_42436"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2158_42436"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2158_42436"
          x1="40.0358"
          y1="4.03629"
          x2="21.6639"
          y2="35.8573"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#4163FF" />
          <stop offset="1" stop-color="#F9948C" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface TabItem {
  title: string;
  content?: string;
  icon?: any;
  disabled?: boolean;
  selected?: boolean;
  showIcon?: boolean;
  count?: number;
  showOnLeft?: boolean;
}
export function TabItem({
  title,
  content,
  icon,
  disabled,
  selected,
  showIcon = true,
  count,
  showOnLeft = false,
}: TabItem) {
  return (
    <div
      className={classNames(
        "rounded-lg h-full p-2.5 w-full relative text-sm font-medium leading-5 outline-none text-gray-700",
        selected
          ? "border-gray-200 text-black"
          : "text-gray-100 hover:bg-white/[0.12]"
      )}
    >
      <div
        className={`flex items-center justify-around ${
          showOnLeft ? "flex-row-reverse" : "flex-row"
        } gap-2 py-1`}
      >
        {/* noftication, */}
        {count ? (
          <span className="mx-auto bg-blue-200 text-[10px] w-[20px] h-[20px] flex items-center justify-center font-bold text-sky-800 rounded-full">
            {count}
          </span>
        ) : null}
        {showIcon && <div className="w-5 h-5 mr-2">{icon}</div>}
        <div className="text-base font-medium leading-none">{title}</div>
      </div>
      {selected ? ( // under line
        <div className="w-full h-0.5 bg-indigo-600 rounded-lg"></div>
      ) : (
        <div className="h-0.5 bg-white rounded-lg w-full"></div>
      )}
    </div>
  );
}




interface IFileComponentProps{
  name: string;
  size: string;
  onClick?: (data?:any) => void;
  onDelete?: (data?:any) => void;
  fileData?: any;
}
export function FileComponent(props: IFileComponentProps){
  return <div className="w-full h-16 p-2 rounded-lg border border-slate-300 justify-start items-center gap-3 inline-flex" onClick={()=>{props.onClick && props.onClick(props.fileData)}}>
      <div className="p-3 bg-violet-100 rounded flex-col justify-center items-center inline-flex">
        <div className="w-6 h-6 relative flex-col justify-center items-center flex text-indigo-500" >
          <DocumentPlusIcon/>
          </div>
      </div>
      <div className="grow shrink basis-0 flex-col justify-center items-start inline-flex">
        <div className="self-stretch h-9 flex-col justify-center items-start gap-0.5 flex">
          <div className="self-stretch text-gray-800 text-sm font-medium leading-tight">{props.name}</div>
          <div className="opacity-50 text-gray-800 text-xs font-medium leading-none">{props.size}</div>
        </div>
      </div>
      <button className="w-4 h-4 relative rounded" 
      onClick={()=>{props.onDelete && props.onDelete(props.fileData)}}
      >
        <XCircleIcon />
      </button>
    </div>

}