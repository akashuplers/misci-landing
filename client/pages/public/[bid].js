import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../styles/publish.module.css";

import { jsonToHtml } from "../../helpers/helper";
import LoaderPlane from "../../components/LoaderPlane";

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
    const html = jsonToHtml(gqlData?.fetchBlog?.publish_data[2].tiny_mce_data);
    setData(html);
  }, [router, gqlData]);

  useEffect(() => {
    const publishContainer = document.getElementById("publishContainer");
    if (publishContainer != null) {
      publishContainer.innerHTML = data;
    }
  }, [data]);

  if (loading) return <LoaderPlane />;
  return (
    <>
      <Navbar />
      <div className={styles.publishContainer} id="publishContainer"></div>
      <br />
    </>
  );
}
