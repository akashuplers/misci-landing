import Layout from "@/components/Layout";
import { stat } from "fs";

export default function Library() {
  return (
    <Layout blogId={null}>
      <div className="lib-container max-w-[1440px] mx-auto">
        <section className="mt-10 px-10 flex items-center justify-center">
          {/* header */}
          <div className="w-[671px] h-16 pl-6 pr-3 py-5 bg-white bg-opacity-25 rounded-[10px] shadow border border-indigo-600 backdrop-blur-[18px] justify-start items-center gap-3 inline-flex">
            {/* <div className="grow shrink basis-0 opacity-50 text-gray-900 text-base">
              Search Topics
            </div> */}
            <input className="w-full h-full bg-transparent text-gray-900 text-base font-normal leading-3" placeholder="Search Topics" />
          </div>
        </section>
        <section className="mt-10  lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-4 place-items-center justify-center">
          {staticDta.map((item, index) => {
            return <LibModule key={index} {...item} />;
          })}
        </section>
      </div>
    </Layout>
  );
}

interface LibModuleProps {
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
}
function LibModule(props: LibModuleProps) {
  return (
    <div className="w-full h-52 px-10 py-7 bg-white bg-opacity-20 rounded-lg shadow border border-white backdrop-blur-2xl justify-between items-center inline-flex">
      <div className="flex-col justify-start items-start gap-2.5 inline-flex">
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="text-stone-500 text-xs font-normal  capitalize leading-3">
            {props.author}
          </div>
        </div>
        <div className="lg:w-80 text-zinc-800 text-lg font-bold  capitalize leading-tight">
          {props.title}
        </div>
        <div className="lg:w-80 text-zinc-800 text-sm font-normal  capitalize leading-none">
          {props.description}
        </div>
        <div className="text-stone-300 text-xs font-normal  capitalize leading-3">
          {props.date}
        </div>
      </div>
      <img
        className="w-20 lg:w-48 h-36 rounded"
        src={props.image ?? "https://via.placeholder.com/189x146"}
      />
    </div>
  );
}

const staticDta = [
  {
    title: "How to build a website",
    description: "This is a description of the website",
    author: "John Doe",
    date: "12/12/2021",
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    title: "How to build a website",
    description: "This is a description of the website",
    author: "John Doe",
    date: "12/12/2021",
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    title: "How to build a website",
    description: "This is a description of the website",
    author: "John Doe",
    date: "12/12/2021",
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
  {
    title: "How to build a website",
    description: "This is a description of the website",
    author: "John Doe",
    date: "12/12/2021",
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  },
];
