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
import { ResulsNotFoundIcon } from "@/components/localicons/localicons";
import {
  ChatBubbleOvalLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
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
        totalComments
      }
    }
  }
`;

const PAGE_COUNT = 12;
interface Props {
  page: number;
  limit: number;
}
export default function Library(props: Props) {
  const [pageSkip, setPageSkip] = useState(props.page - 1);
  const [pageLimit, setPageLimit] = useState(props.limit);
  const [search, setSearch] = useState<string>();
  const debouncedSearchTerm = useDebounce(search, 300);

  // Define your query options

  const { loading, error, data, refetch } = useQuery(GET_BLOGS, {
    variables: {
      options: {
        status: ["published"],
        page_skip: pageSkip * PAGE_COUNT,
        page_limit: (1 + pageSkip) * PAGE_COUNT,
        search: debouncedSearchTerm,
      },
    },
  });
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };
  useEffect(() => {
    // refetch();
    // change param on refersh like page should be 0
    setPageSkip(0);
    setPageLimit(12);
    refetch();
  }, [debouncedSearchTerm]);

  const { clearCurrentLibraryData, setCurrentLibraryData, currentLibraryData } =
    useLibState();

  const skecelton = [1, 2, 3, 4, 5, 6, 7];
  return (
    <Layout blogId={null}>
      <div className="lib-container max-w-full mx-auto relative overflow-x-hidden h-screen">
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
        <section className="px-10 flex items-center justify-center sticky top-0 lg:top-0 z-20 bg-white bg-opacity-10 backdrop-blur-lg lg:gap-56 ">
          {/* header */}
          <div className="w-full lg:w-[40%] h-16 bg-white bg-opacity-25 rounded-lg shadow border border-indigo-600 backdrop-blur-[18px] justify-start items-center gap-3 inline-flex my-4 px-2 focus-within:ring-2 focus-within:ring-indigo-600">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              id="1"
              type="text"
              placeholder="Search Topics"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="peer h-full w-full rounded-lg  font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-transparent focus:ring-2 focus:ring-transparent border-none"
            />
          </div>
        </section>
        <section
          className={`
        my mb-52 min-h-full relative lg:px-10 grid  grid-cols-1 lg:grid-cols-2 gap-10 max-w-screen-2xl mx-auto overflow-hidden
        `}
        >
          {data ? (
            data?.getAllBlogs?.blogs.length > 0 ? (
              data?.getAllBlogs?.blogs.map((item: any, index: number) => {
                return (
                  <LibModule
                    key={index}
                    {...item}
                    id={index}
                    page={pageSkip}
                    limit={pageLimit}
                    setCurrentLibraryData={setCurrentLibraryData}
                  />
                );
              })
            ) : (
              <div className="text-center text-2xl text-gray-400 w-full flex items-center justify-center absolute mx-auto ">
                <div className="w-48 h-full relative flex flex-col items-center ">
                  <div className="w-48  opacity-50 text-center text-gray-900 text-lg">
                    Result Not Found
                  </div>
                  <div className="w-48 opacity-50 text-center text-gray-900 text-xs">
                    Try another search
                  </div>
                  <ResulsNotFoundIcon />
                </div>
              </div>
            )
          ) : (
            skecelton.map((item: any, index: number) => {
              return <LibModuleSkeleton key={index} />;
            })
          )}
        </section>
      </div>
      <div className="flex items-center justify-center mt-20">
        {data?.getAllBlogs?.blogs.length > 0 && (
          <Pagination
            totalItems={data?.getAllBlogs?.count}
            pageSkip={pageSkip}
            setPageSkip={setPageSkip}
          />
        )}
      </div>
    </Layout>
  );
}

function LibModule(props: LibModuleProps) {
  console.log(props);
  const router = useRouter();
  const username =
    props.twitterUserName ??
    props.linkedInUserName ??
    props.userName ??
    "lille";
  return (
    <div
      onClick={() => {
        props.setCurrentLibraryData(props);
        // router.push(`/public/${props._id}?source=library`);
        const { _id, page, limit } = props;

        // Build the query object
        const query = {
          source: "library",
          page: props.page,
          limit: props.limit,
        };

        // Navigate to the new URL
        router.push({
          pathname: "/public/[id]",
          query: {
            id: _id,
            ...query,
          },
        });
      }}
    >
      <div
        className={`
    w-full min-h-52 h-full px-10 py-7 bg-gray-200 bg-opacity-20 rounded-lg  border border-white backdrop-blur-2xl justify-between items-center inline-flex hover:bg-opacity-30 transition-all duration-300 cursor-pointer hover:border-lime-50 hover:border-opacity-50 shadow-lg
    `}
      >
        <div className="w-[80%] flex-col justify-start items-start gap-2.5 inline-flex h-full">
          <div className="justify-start items-center gap-2 inline-flex">
            {/* img */}
            <img
              className="w-6 h-6 rounded-full"
              src={
                props.profileImage ??
                "https://secure.gravatar.com/avatar/42f7181c2013147d652d1c99ee035862?s=800&d=identicon"
              }
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
            <div className="flex flex-col gap-2 text-gray-600 text-xs font-normal  capitalize leading-3">
              <RelativeTimeString date={Number(props.date)} />
              <div className="flex items-center gap-2">
                {props.totalComments}
                <ChatBubbleOvalLeftIcon className="w-4 h-4 relative" />
                {props.likes > 0 ? props.likes : 0}{" "}
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height={16}
                    width={16}
                    viewBox="0 0 512 512"
                  >
                    {" "}
                    <path d="M320 96c8.844 0 16-7.156 16-16v-64C336 7.156 328.8 0 320 0s-16 7.156-16 16v64C304 88.84 311.2 96 320 96zM383.4 96c5.125 0 10.16-2.453 13.25-7.016l32.56-48c1.854-2.746 2.744-5.865 2.744-8.951c0-8.947-7.273-16.04-15.97-16.04c-5.125 0-10.17 2.465-13.27 7.02l-32.56 48C368.3 73.76 367.4 76.88 367.4 79.97C367.4 88.88 374.7 96 383.4 96zM384 357.5l0-163.9c0-6.016-4.672-33.69-32-33.69c-17.69 0-32.07 14.33-32.07 31.1L320 268.1L169.2 117.3C164.5 112.6 158.3 110.3 152.2 110.3c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l89.3 89.3C227.4 243.4 228.9 247.2 228.9 251c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.899-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349l-107.6-107.6C91.22 149.2 85.08 146.9 78.94 146.9c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l107.6 107.6C172.5 298.4 173.9 302.2 173.9 305.1c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.9-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349L59.28 227.2C54.59 222.5 48.45 220.1 42.31 220.1c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l89.3 89.3c2.9 2.899 4.349 6.7 4.349 10.5c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.899-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349L40.97 318.7C36.28 314 30.14 311.7 24 311.7c-13.71 0-23.99 11.26-23.99 24.05c0 6.141 2.332 12.23 7.02 16.92C112.6 458.2 151.3 512 232.3 512C318.1 512 384 440.9 384 357.5zM243.3 88.98C246.4 93.55 251.4 96 256.6 96c8.762 0 15.99-7.117 15.99-16.03c0-3.088-.8906-6.205-2.744-8.951l-32.56-48C234.2 18.46 229.1 15.98 223.1 15.98c-8.664 0-15.98 7.074-15.98 16.05c0 3.086 .8906 6.205 2.744 8.951L243.3 88.98zM480 160c-17.69 0-32 14.33-32 32v76.14l-32-32v121.4c0 94.01-63.31 141.5-78.32 152.2C345.1 510.9 352.6 512 360.3 512C446.1 512 512 440.9 512 357.5l-.0625-165.6C511.9 174.3 497.7 160 480 160z" />
                  </svg>
                </>
              </div>
            </div>
          </div>
        </div>
        <img
          className="lg:min-w-[20%] h-36 rounded"
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

// get server side props
export async function getServerSideProps(context: any) {
  const page = context.query.page || 1;
  const limit = context.query.limit || 10;
  return {
    props: {
      page,
      limit,
    },
  };
}
