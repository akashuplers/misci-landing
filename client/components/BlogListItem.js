import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../styles/saved.module.css';
const BlogListItem = ({ blog, index, setblog_id, setOpenModal, type, showType = true }) => {
  const [queryParams, setQueryParams] = useState({ blogId: blog._id });
  useEffect(() => {
    setQueryParams({ blogId: blog._id });
    if (type !== 'saved') {
      setQueryParams({ blogId: blog._id, isPublished: true });
    }
  }, [blog, type]);
  const pathName = type == 'saved' ? `/dashboard/${blog._id}` : type == 'ir_generated' ? `/dashboard/${blog._id}?isDailyFeed=true` : `/dashboard/${blog._id}?isPublished=true`;
  return (
    <li href={{ pathname: '/dashboard/' + blog._id, query: queryParams }} key={blog._id} className="relative">
      <Link href={pathName}><div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
        <img
          src={blog.image}
          alt={blog.title}
          className="pointer-events-none object-cover h-[150px] w-full lg:w-[280px]"
          style={{ scale: '1.25' }}
        />
        {
          type == 'publish' && (
            <Link
              legacyBehavior
              as={"/dashboard/" + blog._id + "?isPublished=true"}
              href={{
                pathname: "/dashboard/" + blog._id,
                query: { isPublished: true },
              }}
              passHref
            >
              <span
                target="_blank"
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  zIndex: '1',
                  background: 'white',
                  borderRadius: '0 0 0 5px',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </svg>
              </span>
            </Link>
          )
        }
        <Link href={type == 'saved' ? `/dashboard/${blog._id}` : type == 'ir_generated' ? `/dashboard/${blog._id}?isDailyFeed=true` : `/dashboard/${blog._id}?isPublished=true`}>
          <span>
            <button
              type="button"
              className="absolute inset-0 focus:outline-none"
              onMouseEnter={(e) => {
                const delButton = document.querySelector(
                  `#savedBlog${index}DelButton`
                );
                delButton.classList.remove('!hidden');
              }}
              onMouseLeave={(e) => {
                const delButton = document.querySelector(
                  `#savedBlog${index}DelButton`
                );
                delButton.classList.add('!hidden');
              }}
            >
              {
                showType && type == 'saved' && (
                  <>
                    <button
                      className={`${styles.statusDelButton} ${styles.statusButton}`}
                    >
                      {blog?.status === "ir_generated"
                        ? "DAILY FEED"
                        : blog?.status.toUpperCase()}
                    </button>
                  </>
                )
              }
              <span className="sr-only">
                View details for {blog.title}
              </span>
              <button
                id={`savedBlog${index}DelButton`}
                className={`${styles.statusDelButton} !hidden ${styles.deleteButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setblog_id(blog._id);
                  setOpenModal(true);
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                }}
              >
                DELETE
              </button>
            </button>
          </span>
        </Link>
      </div>
      </Link>
      <button className={`${styles.dateTag} mt-2`}>
        {new Date(blog?.date * 1000).toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </button>
      <p className="pointer-events-none mt-2 block truncate lg:text-sm lg:font-medium text-2xl font-extrabold text-black lg:text-gray-700">
        {blog?.title}
      </p>
      <p className="pointer-events-none block lg:text-sm text-base font-base  lg:text-gray-700">
        {blog?.description?.length > 115
          ? blog?.description?.substring(0, 115) + '...'
          : blog.description}
      </p>
    </li>
  );
};

export default BlogListItem;
