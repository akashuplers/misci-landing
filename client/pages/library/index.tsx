import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import Layout from "@/components/Layout";
import Link from "next/link";
import { getLibrariesItems } from "@/helpers/apiMethodsHelpers";
import { gql, useQuery } from "@apollo/client";
import { GQL_GET_ALL_LIBRARIES_ITEMS } from "@/graphql/queries/lib/getBlogs";
import { useLibState } from "@/store/appState";
import { LibModuleProps } from "@/store/types";
import { useRouter } from "next/router";
import { RelativeTimeString } from "@/components/ui/RelativeTimeString";
import { FloatingBalls } from "@/components/ui/Chip";
import { useDebounce } from "@uidotdev/usehooks";
const GET_BLOGS = gql`
  query GetAllBlogs($options: BlogListInput) {
    getAllBlogs(options: $options) {
      count
      blogs {
        _id
        title
        description
        image
        tags
        status
        date
        totalComments
        likes
        profileImage
        linkedInUserName
        twitterUserName
        userName
      }
    }
  }
`;

export default function Library() {
  const [pageSkip, setPageSkip] = useState(0);
  const [search, setSearch] = useState<string>();
  const debouncedSearchTerm = useDebounce(search, 300);
  // Define your query options
  const { loading, error, data, refetch } = useQuery(GET_BLOGS, {
    variables: {
      options: {
        status: ["published"],
        page_skip: 0,
        page_limit: 7,
        search: debouncedSearchTerm,
      },
    },
  });
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };
  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm]);

  const { clearCurrentLibraryData, setCurrentLibraryData, currentLibraryData } =
    useLibState();

  const skecelton = [1, 2, 3, 4, 5, 6, 7];
  return (
    <Layout blogId={null}>
      <div className="lib-container max-w-full mx-auto relative overflow-x-hidden">
        <div
          style={{
            width: 1214.42,
            height: 1093.78,
            right: "-10%",
            transform: "rotate(-16.47deg)",
            transformOrigin: "0 0",
            background:
              "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
          }}
          className="-z-10 absolute"
        />
        <div
          style={{
            width: 1214.42,
            height: 1093.78,
            left: "40%",
            top: "120%",
            transform: "rotate(-163.47deg)",
            transformOrigin: "0 0",
            background:
              "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
          }}
          className="-z-10 absolute"
        />
        <FloatingBalls className="absolute top-[10%] right-[2%]" />
        <FloatingBalls className="absolute top-[50%] right-[10%]" />
        <section className="px-10 flex items-center justify-center sticky top-5 lg:top-10 z-20 bg-white bg-opacity-10 backdrop-blur-lg lg:gap-56 ">
          {/* header */}
          <div className="w-[40%] h-16 bg-white bg-opacity-25 rounded-lg shadow border border-indigo-600 backdrop-blur-[18px] justify-start items-center gap-3 inline-flex">
            <input
              id="1"
              type="text"
              placeholder="Search Topics"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="peer h-full w-full rounded-lg  font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-transparent focus:ring-2 focus:ring-transparent"
            />
          </div>
        </section>
        <section className="mt-10 h-full  lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-screen-2xl mx-auto overflow-hidden">
          {data
            ? data?.getAllBlogs?.blogs.map((item: any, index: number) => {
                return (
                  <LibModule
                    key={index}
                    {...item}
                    id={index}
                    setCurrentLibraryData={setCurrentLibraryData}
                  />
                );
              })
            : skecelton.map((item: any, index: number) => {
                return <LibModuleSkeleton key={index} />;
              })}

          <Pagination
            totalItems={data?.getAllBlogs?.count}
            pageSkip={pageSkip}
            setPageSkip={setPageSkip}
          />
        </section>
      </div>
    </Layout>
  );
}

function LibModule(props: LibModuleProps) {
  console.log(props);
  const router = useRouter();
  const username = props.twitterUserName ?? props.linkedInUserName ?? props.userName ?? "lille";
  return (
    <div
      onClick={() => {
        props.setCurrentLibraryData(props);
        router.push(`/public/${props._id}?source=library`);
      }}
    >
      <div
        className={`
    w-full h-52 px-10 py-7 bg-gray-200 bg-opacity-20 rounded-lg  border border-white backdrop-blur-2xl justify-between items-center inline-flex hover:bg-opacity-30 transition-all duration-300 cursor-pointer hover:border-lime-50 hover:border-opacity-50 shadow-lg
    `}
      >
        <div className="flex-col justify-start items-start gap-2.5 inline-flex h-full">
          <div className="justify-start items-center gap-2 inline-flex">
            {/* img */}
            <img
              className="w-6 h-6 rounded-full"
              src={props.profileImage ?? "https://secure.gravatar.com/avatar/42f7181c2013147d652d1c99ee035862?s=800&d=identicon"}
            />
            <div className="text-stone-500 text-xs font-normal  capitalize leading-3">
              {username}
            </div>
          </div>
          <div className="flex-col justify-around items-start gap-1 inline-flex h-full">
            <div className="lg:w-80 text-zinc-800 text-lg font-bold  capitalize leading-tight">
              {props.title ?? props.description.slice(0, 50) + "..."}
            </div>
            <div className="lg:w-80 text-zinc-800 text-sm font-normal  capitalize leading-none">
              {props.title
                ? props.description.slice(0, 100) + "..."
                : props.description.slice(60, 120) + "..."}
            </div>
            <div className="text-stone-300 text-xs font-normal  capitalize leading-3">
              <RelativeTimeString date={Number(props.date)} />
            </div>
          </div>
        </div>
        <img
          className="w-20 lg:w-48 h-36 rounded"
          src={props.image ?? "https://via.placeholder.com/189x146"}
        />
      </div>
    </div>
  );
}

function LibModuleSkeleton() {
  return (
    <div className="w-full h-52 px-10 py-7 bg-gray-200 bg-opacity-20 rounded-lg border border-white backdrop-blur-2xl justify-between items-center inline-flex transition-all duration-300 shadow-lg">
      <div className="flex-col justify-start items-start gap-2.5 inline-flex h-full">
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="text-stone-500 text-xs font-normal capitalize  rounded-md leading-3 w-20 h-4 bg-gray-400 animate-pulse"></div>
        </div>
        <div className="flex-col justify-around items-start gap-1 inline-flex h-full">
          <div className="lg:w-80 text-zinc-800 rounded-md text-lg font-bold capitalize leading-tight h-7 bg-gray-400 animate-pulse"></div>
          <div className="lg:w-80 text-zinc-800 rounded-md text-sm font-normal capitalize leading-none h-4 bg-gray-400 animate-pulse"></div>
          <div className="text-stone-300 text-xs font-normal capitalize leading-3 w-28 h-4 bg-gray-400 animate-pulse"></div>
        </div>
      </div>
      <div className="w-20 lg:w-48 h-36 rounded-md bg-gray-400 animate-pulse"></div>
    </div>
  );
}
