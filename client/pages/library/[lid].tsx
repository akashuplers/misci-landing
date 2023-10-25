import Layout from "@/components/Layout";
import { FloatingBalls } from "@/components/ui/Chip";
import { RelativeTimeString } from "@/components/ui/RelativeTimeString";
import { useLibState } from "@/store/appState";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useEffect } from "react";

interface LibraryArticleProps {
  libraryItemId: string;
}

export default function LibraryArticle(props: LibraryArticleProps) {
  const { clearCurrentLibraryData, setCurrentLibraryData, currentLibraryData } =
    useLibState();
    console.log(currentLibraryData);
  useEffect(() => {
    // This function will be called when the component is about to unmount
    return () => {
      // clearCurrentLibraryData();
    };
  }, []);

  return (
    <Layout blogId={null}>
    <div className="mt-10 mb-28 relative overflow-x-hidden">
    <div style={{width: 1214.42, height: 1093.78, right:'-10%', transform: 'rotate(-16.47deg)', transformOrigin: '0 0', background: 'linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)'}} className="-z-10 absolute"/>
    <div style={{width: 1214.42, height: 1093.78, left:'-10%' ,top: "60%", transform: 'rotate(-163.47deg)', transformOrigin: '0 0', background: 'linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)'}} className="-z-10 absolute"/>
    <FloatingBalls className="absolute top-[10%] right-[2%]" />
      <FloatingBalls className="absolute top-[50%] right-[10%]" />
      <section className="text-gray-600 body-font  max-w-5xl  mx-auto relative px-4 ">
        <Link
          href="/library"
          as="/library"
          className="flex gap-2 items-center"
        >
          <span>
            <ArrowLeftIcon className="h-5 w-5 inline-block" />
          </span>
          Library
        </Link>
        <main>
          <div className="w-full h-40 flex-col justify-start items-start gap-4 inline-flex">
            <div className="w-full text-zinc-800 text-3xl font-bold font-['Heebo'] capitalize leading-9">
              {currentLibraryData?.title ? currentLibraryData?.title : currentLibraryData?.description.slice(0, 50) + '...'}
            </div>
            <div className="text-stone-300 text-base font-normal font-['Heebo'] capitalize leading-none">
              {/* {currentLibraryData?.date} */}
              {
                <RelativeTimeString date={Number(currentLibraryData?.date)}
                />
              }
            </div>
            <div className="justify-start items-center gap-4 inline-flex">
              <div className="text-stone-500 text-xl font-normal font-['Heebo'] capitalize leading-tight">
                {currentLibraryData?.author}
              </div>
            </div>
          </div>
          <img
            className="w-full object-contain h-80 rounded-xl"
            src={
              currentLibraryData?.image ??
              "https://via.placeholder.com/189x146"
            }
          />
          <div className="w-full text-zinc-800 text-2xl font-medium font-['Heebo'] capitalize leading-7 mt-4">
            {currentLibraryData?.description}
          </div>
        </main>
      </section>
    </div>
  </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { params, resolvedUrl } = context;
  console.log(context);
  const routeName = resolvedUrl; // This will give you the route name
  const libraryItemId = params?.lid;
  return {
    props: {
      libraryItemId,
    },
  };
}
