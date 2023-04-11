/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "../helpers/helper";
import { updateBlog } from "../graphql/mutations/updateBlog";
import LoaderPlane from "./LoaderPlane";
import { useMutation } from "@apollo/client";
import AuthenticationModal from "./AuthenticationModal";
import { useRouter } from "next/router";
import { LINKEDIN_CLIENT_ID } from "../constants/apiEndpoints";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
} from "react-share";
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
} from "react-share";
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "axios";

export default function TinyMCEEditor({
  topic,
  isAuthenticated,
  editorText,
  loading,
  blog_id,
  blogData: dataIncoming,
  blogData,
}) {
  const [updatedText, setEditorText] = useState(editorText);
  const [saveLoad, setSaveLoad] = useState(false);
  const [saveText, setSaveText] = useState("Save!");
  const [openModal, setOpenModal] = useState(false);
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  useEffect(() => {
    setEditorText(editorText);
  }, [editorText]);

  const [authenticationModalType, setAuthneticationModalType] = useState("");
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const router = useRouter();
  let token, linkedInAccessToken, authorId;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
    linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
    authorId = localStorage.getItem("authorId");
  }
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  const handleSave = async () => {
    setSaveLoad(true);
    var getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
      window.submitted = true;
    }

    if (getToken) {
      console.log("token", getToken);
      const jsonDoc = htmlToJson(updatedText).children;
      const formatedJSON = { children: [...jsonDoc] };
      UpdateBlog(
        {
          variables: {
            options: {
              tinymce_json: formatedJSON,
              blog_id: blog_id,
              platform: "wordpress",
            },
          },
        },
        {
          context: {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getToken,
            },
          },
        }
      )
        .then(() => {
          if (window.location === "/dashboard/" + blog_id) return;
          window.location.href = "/dashboard/" + blog_id;
          // router.push("/dashboard/" + blog_id);
        })
        .catch((err) => {
          //console.log(err);
        })
        .finally(() => {
          setSaveLoad(false);
          setSaveText("Saved!");
        });
      setAuthenticationModalOpen(false);
    } else {
      setAuthneticationModalType("signup");
      setAuthenticationModalOpen(true);
    }
  };

  const [callBack, setCallBack] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setText(window.location.origin + "/public/");
    }
    if (typeof window !== "undefined") {
      let temp = `${window.location.origin}${router.pathname}`;
      if (temp.substring(temp.length - 1) == "/")
        setCallBack(temp.substring(0, temp.length - 1));
      else {
        setCallBack(window.location.origin + "/dashboard");
      }
    }
  }, []);

  const handleconnectLinkedin = () => {
    localStorage.setItem("loginProcess", true);
    localStorage.setItem("bid", blog_id);
    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    window.location = redirectUrl;
  };

  const handleSavePublish = () => {
    let getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
    if (getToken) {
      const jsonDoc = htmlToJson(updatedText).children;
      const formatedJSON = { children: [...jsonDoc] };
      UpdateBlog(
        {
          variables: {
            options: {
              tinymce_json: formatedJSON,
              blog_id: blog_id,
              platform: "wordpress",
            },
          },
        },
        {
          context: {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getToken,
            },
          },
        }
      )
        .then(() => {
          var myHeaders = new Headers();
          myHeaders.append("content-type", "application/json");
          myHeaders.append("Authorization", "Bearer " + token);

          var raw = JSON.stringify({
            query:
              "mutation SavePreferences($options: PublisOptions) {\n  publish(options: $options)\n}",
            variables: {
              options: {
                blog_id: blog_id,
              },
            },
          });

          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          fetch("https://maverick.lille.ai/graphql", requestOptions)
            .then((response) => response.text())
            .then((result) => {
              const data = JSON.parse(result);
              if (data.data.publish) {
                setOpenModal(true);
              }
            })
            .catch((error) => console.log("error", error));
        })
        .catch((err) => {});
    }
  };

  const handlePublish = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      token: linkedInAccessToken,
      author: "urn:li:person:" + authorId,
      data: htmlToJson(editorText)?.children[3]?.children[0],
      blogId: blog_id,
    });

    console.log(
      "htmlToJson(editorText)",
      htmlToJson(editorText)?.children[3]?.children[0]
    );

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://maverick.lille.ai/auth/linkedin/post", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  };

  const [option, setOption] = useState("blog");

  function handleBlog(e) {
    setOption("blog");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");

    const aa = blogData?.publish_data[2]?.tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(e) {
    setOption("linkedin");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    const aa = blogData?.publish_data[0]?.tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(e) {
    setOption("twitter");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    const aa = blogData?.publish_data[1]?.tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);
  }

  if (loading) return <LoaderPlane />;
  return (
    <>
      {isAuthenticated ? (
        <div
          style={{
            position: "absolute",
            top: "-6%",
            left: "0",
            display: "flex",
            gap: "0.5em",
          }}
        >
          <button
            className="blog-toggle-button cta active wordpress"
            onClick={handleBlog}
          >
            Blog
          </button>
          <button
            className="blog-toggle-button cta linkedin"
            onClick={handleLinkedinBlog}
          >
            Linkedin
          </button>
          <button
            className="blog-toggle-button cta twitter"
            onClick={handleTwitterBlog}
          >
            Twitter
          </button>
        </div>
      ) : (
        <div></div>
      )}
      <Modal
        isOpen={openModal}
        onRequestClose={() => setOpenModal(false)}
        ariaHideApp={false}
        className="w-[100%] sm:w-[38%] max-h-[95%]"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "9999",
          },
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            border: "none",
            background: "white",
            boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
            borderRadius: "8px",
            // height: "75%",
            width: "80%",
            maxWidth: "580px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            paddingBottom: "0px",
          },
        }}
      >
        <div className="pl-4 text-xl font-bold">Share</div>
        <WhatsappShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <WhatsappIcon size={62} round /> Whatsapp
        </WhatsappShareButton>
        <FacebookShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <FacebookIcon size={62} round /> Facebook
        </FacebookShareButton>
        <TwitterShareButton
          url={text + blog_id}
          hashtags={["lille", "nowg"]}
          className="m-5"
        >
          <TwitterIcon size={62} round />
          Twitter
        </TwitterShareButton>
        <EmailShareButton
          url={text + blog_id}
          subject="Link for my Blog"
          className="Demo__some-network__share-button m-5"
        >
          <EmailIcon size={62} round /> Email
        </EmailShareButton>
        <TelegramShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <TelegramIcon size={62} round /> Telegram
        </TelegramShareButton>
        <div className="p-5 pl-2 flex">
          <input
            type="text"
            value={text + blog_id}
            className="w-[70%] h-[40px] mr-5"
          />
          <CopyToClipboard text={text + blog_id} onCopy={onCopyText}>
            <div className="copy-area">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Copy
              </button>
              <span className={`copy-feedback ${isCopied ? "active" : ""}`}>
                Copied!
              </span>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
        handleSave={handleSave}
        bid={blog_id}
      />
      <Editor
        value={updatedText || editorText}
        apiKey="i40cogfqfupotdcavx74ibdbucbojjvpuzbl8tqy34atmkyd"
        init={{
          setup: (editor) => {
            if (editor.inline) {
              registerPageMouseUp(editor, throttledStore);
            }
          },
          skin: "naked",
          icons: "small",
          toolbar_location: "bottom",
          plugins: "lists code table codesample link",
          menubar: false,
          statusbar: false,
          height: 600,
          images_upload_base_path: `https://pluarisazurestorage.blob.core.windows.net/nowigence-web-resources/blogs`,
          images_upload_credentials: true,
          plugins:
            "preview casechange importcss tinydrive searchreplace autolink save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker editimage help formatpainter permanentpen pageembed charmap mentions linkchecker emoticons advtable export footnotes mergetags autocorrect",
          menu: {
            tc: {
              title: "Comments",
              items: "addcomment showcomments deleteallconversations",
            },
          },
          toolbar:
            "undo redo image| bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
          image_title: true,
          automatic_uploads: true,
          file_picker_types: "image",
          file_picker_callback: function (cb, value, meta) {
            var input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            var url = `https://maverick.lille.ai/upload/image`;
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            xhr.open("POST", url, true);

            input.onchange = function () {
              var file = this.files[0];
              var reader = new FileReader();
              xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                  // File uploaded successfully
                  var response = JSON.parse(xhr.responseText);

                  // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                  var url = response.url;
                  // console.log(url)
                  // Create a thumbnail of the uploaded image, with 150px width
                  cb(url, { title: response.type });
                }
              };

              reader.onload = function () {
                var id = "blobid" + new Date().getTime();
                var blobCache =
                  window.tinymce.activeEditor.editorUpload.blobCache;
                var base64 = reader.result.split(",")[1];

                var blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                // call the callback and populate the Title field with the file name

                // fd.append("upload_preset", unsignedUploadPreset);
                // fd.append("path", "browser_upload");
                fd.append("file", blobInfo.blob());

                xhr.send(fd);
              };

              reader.readAsDataURL(file);
            };

            input.click();
          },
          images_upload_handler: (blobInfo, success, failure) => {
            var formdata = new FormData();
            formdata.append("file", blobInfo.blob());

            var requestOptions = {
              method: "POST",
              body: formdata,
              redirect: "follow",
            };

            fetch("https://maverick.lille.ai/upload/image", requestOptions)
              // .then((response) => response.text())
              // .then((result) => {
              //   const data = JSON.parse(result);
              //   success(data.url);
              // })
              .catch((error) => console.log("error", error));
          },
        }}
        onEditorChange={(content, editor) => {
          setEditorText(content);
          setSaveText("Save Now!");
          // console.log(updatedText);
        }}
      />
      <div className="flex space-x-5">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={saveText === "Save Now!" && handleSave}
        >
          {saveLoad ? (
            <ReactLoading width={25} height={25} round={true} />
          ) : (
            saveText
          )}
        </button>
        {option === "linkedin" ? (
          linkedInAccessToken ? (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={handlePublish}
            >
              Publish on Linkedin
            </button>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleconnectLinkedin}
            >
              Connect with Linkedin
            </button>
          )
        ) : option === "twitter" ? (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Coming Soon...
          </button>
        ) : isAuthenticated ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleSavePublish}
          >
            Save & Publish
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
