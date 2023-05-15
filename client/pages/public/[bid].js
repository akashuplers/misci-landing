import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import styles from "../../styles/publish.module.css";

import LoaderPlane from "../../components/LoaderPlane";
import { jsonToHtml } from "../../helpers/helper";

export default function Post() {
  const router = useRouter();
  const { bid } = router.query;
  const [data, setData] = useState("");

  const {
    data: gqlData,
    loading,
    error,
  } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", function (event) {
      event.stopImmediatePropagation();
    });
  }

  useEffect(() => {
    // const html = jsonToHtml(gqlData?.fetchBlog?.publish_data[2].tiny_mce_data);

    const aa = gqlData?.fetchBlog?.publish_data.find(
      (pd) => pd.platform === "wordpress"
    ).tiny_mce_data;
    const html = jsonToHtml(aa);

    setData(html);
  }, [router, gqlData]);

  useEffect(() => {
    const publishContainer = document.getElementById("publishContainer");
    if (publishContainer != null) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = data;

      // Find the null tag with the undefined attribute
      const nullElement = tempElement.querySelector('null[undefined]');

      if (nullElement) {
        // Create a new <div> element to replace the null tag
        const divElement = document.createElement('div');

        // Copy any content from the null element to the new <div> if necessary
        divElement.innerHTML = nullElement.innerHTML;

        // Replace the null tag with the new <div> element
        nullElement.parentNode.replaceChild(divElement, nullElement);
      }

      // Retrieve the modified HTML from the temporary element
      const modifiedHtml = tempElement.innerHTML;
      console.log(modifiedHtml);
      publishContainer.innerHTML = modifiedHtml;
      document.querySelector('#publishContainer > div').style.alignItems = 'center';
      const getRefPTag = document.querySelector('#publishContainer > div').children[document.querySelector('#publishContainer > div').childElementCount - 2];
      getRefPTag.style.alignSelf = 'baseline';
      getRefPTag.style.display = 'block';
      const getRefOlTag = document.querySelector('#publishContainer > div').children[document.querySelector('#publishContainer > div').childElementCount - 1];
      getRefOlTag.style.alignSelf = 'baseline';
      getRefOlTag.style.display = 'block';
    }
  }, [data]);

  if (loading) return <LoaderPlane />;
  return (
    <>
      <Navbar />
      <div className={styles.publishContainer} id="publishContainer"></div>
      <br />
      <style>{`
      img{
        margin: auto
      }
      `}</style>
    </>
  );
}
