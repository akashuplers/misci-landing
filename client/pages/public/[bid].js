import { concat, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import styles from "../../styles/publish.module.css";
import LoaderPlane from "../../components/LoaderPlane";
import { jsonToHtml } from "../../helpers/helper";
import { ChatBubbleOvalLeftIcon, CheckCircleIcon, DocumentDuplicateIcon, HandThumbUpIcon, ShareIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import ShareLinkModal from "../../components/component/ShareLinkModal";
import CopyToClipboard from "react-copy-to-clipboard";
export default function Post() {
  const router = useRouter();
  const { bid } = router.query;
  const [data, setData] = useState("");
  const [showShareModal, setShareModal] = useState(false);
  const [text, setText] = useState("");
  const [callBack, setCallBack] = useState();
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
      const nullElement = tempElement.querySelector('null[undefined]');
      if (nullElement) {
        const divElement = document.createElement('div');
        divElement.innerHTML = nullElement.innerHTML;
        nullElement.parentNode.replaceChild(divElement, nullElement);
      }
      var modifiedHtml = tempElement.innerHTML;
      console.log(modifiedHtml);
      const phraseToRemove = 'A placeholder image has been added, you can upload your own image.';
      const modifiedString = modifiedHtml.replace(new RegExp(`<span[^>]*>${phraseToRemove}</span>`, 'g'), '');
      console.log(modifiedString);
      publishContainer.innerHTML = modifiedString;
    }

  }, [data]);

  if (loading) return <LoaderPlane />;
  return (
    <div className="bg-[#00000014]">
      <Navbar />
     <div className="flex items-center justify-center max-w-[1056px] mx-auto flex-col ">
        <div className={styles.publishContainer} id="publishContainer"></div>
        <ShareLinkModal openModal={showShareModal} setOpenModal={setShareModal}  blog_id={gqlData.fetchBlog._id} text={text} closeModal={() => setShareModal(false)} />
        {
          gqlData && <CommentSection text={text} data={gqlData} setShareModal={setShareModal}/>

        }
     </div>
      <br />
      <style>{`
      img{
        margin: auto
      }
      `}</style>
    </div>
  );
}
var CommentButtonMap = {
  like: {
    icon: <HandThumbUpIcon className="w-4 h-4 relative" />,
    text: "Like"
  },
    comment: {
      icon: <ChatBubbleOvalLeftIcon  className="w-4 h-4 relative" />,
      text: "Comment"
    },
    link: {
      icon:<DocumentDuplicateIcon className="w-4 h-4 relative" />,
      text: "Copy Link"
    },
    share:{
      icon: <ShareIcon className="w-4 h-4 relative" />,
      text: "Share"
    },
    check: {
      icon: <CheckCircleIcon className="w-4 h-4 relative" />,
      text: 'Check'
    }
}

const CommentButton = ({
  icon, text, onClick
}) => {
  return (
    <button onClick={
      onClick ? onClick : () => { }
    } className="min-w-8 h-8 p-3 rounded-2xl justify-end items-center gap-2 inline-flex hover:bg-gray-100">
      {icon}
      <div className="text-black text-base font-normal">{text}</div>
    </button>

  )
}
const CommentSection = ({data, setShareModal, text}) => {
  console.log(data);
  const [copyStart, setCopyStart] = useState(false);
  return <div className="w-full border h-full p-5 rounded-lg bg-white">
    <div>
    <span className="text-slate-800 text-lg font-bold">Write a Comment</span>
    </div>
    {/*  */}
    <div className="grid grid-cols-2 gap-4 h-full mt-8 max-h-[600px]">
      {/* Left side for comments */}
      <div className="h-full">
      <div className="w-full bg-white rounded-lg flex-col justify-start items-start gap-[15px] inline-flex">
          <div className="justify-start items-center gap-2 inline-flex">
            <img className="w-10 h-10 rounded-full" src={data.fetchBlog.userDetail.profileImage ?data.fetchBlog.userDetail.profileImage :"https://via.placeholder.com/40x40" }/>
            <div className="text-black text-lg font-bold">{data.fetchBlog.userDetail.name + " "+ data.fetchBlog.userDetail.lastName}</div>
          </div>
          {/* <div className="self-stretch opacity-70 text-black text-sm font-normal leading-[21px]">I just tried this recipe and it was amazing! The instructions were clear and easy to follow, and the end result was delicious. I will definitely be making this again. Thanks for sharing!</div> */}
          <TextareaAutosize
             maxRows={5}
             minRows={3}
            className="w-full h-10 p-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-slate-500 hover:shadow"
            placeholder="Write a comment..."
          />
          <div className="self-stretch justify-start items-center gap-2 inline-flex">
            <div className="grow shrink basis-0 h-5 justify-start items-start gap-3 flex">
              <div className="w-5 h-5 relative" />
              <div className="w-5 h-5 relative" />
              <div className="w-5 h-5 relative" />
            </div>
            <button className="px-5 py-2 rounded-lg justify-start items-start gap-2 flex">
              <span className="text-slate-600 text-base font-normal leading-7">Cancel</span>
            </button>
            <button className="px-[18px] py-1.5 bg-indigo-600 rounded-lg justify-start items-start gap-2 flex">
              <span className="text-white text-base font-bold leading-7">Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side for other comments */}
      <div className="flex flex-col gap-2 h-full  overflow-y-scroll max-h-[500px]">
       {
        data.fetchBlog.comments && Array(10).fill().flatMap(()=>data.fetchBlog.comments).map((comment) => {
          return <UserComment key={comment?.userId+comment?.text} name={comment?.name} comment={comment?.text} date={comment?.date} avatar={comment?.avatar} userId={comment?.userId} />
        } )
       }
        {/* Add your other comments component(s) here */}
        {/* Example: <OtherCommentList /> */}
      </div>
    </div>
    <div className="w-full h-[80.18px] bg-white shadow border-t border-neutral-200 justify-center items-center gap-6 inline-flex mt-4">
          <div className="h-full justify-start items-center flex w-[75%]">
             <CommentButton icon={CommentButtonMap.like.icon} text={CommentButtonMap.like.text} />
             <CommentButton icon={CommentButtonMap.comment.icon} text={CommentButtonMap.comment.text} />

          </div>
          <div className="justify-end items-center flex w-[25%]">
        <CopyToClipboard text={text + data.fetchBlog._id} onCopy={() => {
          setCopyStart(true);
          setTimeout(() => {
            setCopyStart(false);
          }
            , 2000);

        }}>
            <CommentButton icon={
              copyStart ? CommentButtonMap.check.icon : CommentButtonMap.link.icon
            } text={CommentButtonMap.link.text} />
            </CopyToClipboard>
            <CommentButton icon={CommentButtonMap.share.icon} text={CommentButtonMap.share.text} onClick={
              () => {
                setShareModal(true);
              }
            } />
          </div>
        </div>
  </div>
}
const UserComment = ({name, comment, date, avatar, userId}) => {
  const STATIC_AVATAR = 'https://via.placeholder.com/40x40';

  return <div className="w-full p-5 bg-white rounded-lg border border-neutral-200 flex-col justify-start items-start gap-[15px] inline-flex">
    <div className="justify-start items-center gap-2 inline-flex">
      <img className="w-10 h-10 rounded-full" src={avatar || STATIC_AVATAR} />
      <div className="text-black text-lg font-bold">{name}</div>
    </div>
    {/* <div className="self-stretch opacity-70 text-black text-sm font-normal leading-[21px]">I just tried this recipe and it was amazing! The instructions were clear and easy to follow, and the end result was delicious. I will definitely be making this again. Thanks for sharing!</div> */}
    <p
      className="w-full h-10 p-2 rounded-lg"
    >
      {
        comment
      }
    </p>
    <div className="self-stretch justify-start items-center gap-2 inline-flex">
      <div className="grow shrink basis-0 h-5 justify-start items-start gap-3 flex">
        <div className="w-5 h-5 relative" />
        <div className="w-5 h-5 relative" />
        <div className="w-5 h-5 relative" />
      </div>
      <CommentButton icon={CommentButtonMap.like.icon} text={CommentButtonMap.like.text} />
      <button className="px-[18px] py-1.5 bg-indigo-600 rounded-lg justify-start items-start gap-2 flex">
        <span className="text-white text-base font-bold leading-7">Comment</span>
      </button>
    </div>
  </div>
}