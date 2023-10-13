import Layout from "@/components/Layout";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";

interface LibraryArticleProps {
  libraryItemId: string;
}

export default function LibraryArticle(props: LibraryArticleProps) {
  return (
    <Layout blogId={null}>
      <div className="mt-10">
        <section className="text-gray-600 body-font  max-w-5xl  mx-auto relative">
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
            <h1>
              Library Item {props.libraryItemId}
            </h1>
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
