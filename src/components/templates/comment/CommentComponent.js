"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form"; // اضافه کردن useForm
import { Toaster, toast } from "react-hot-toast";
import CloseSvg from "@/module/svgs/CloseSvg";
import ArrowUpSvg from "@/module/svgs/ArrowUpSvg";
import usericone from "@/public/Images/jpg/user.webp";
import HeartSvg from "@/module/svgs/HeartSvg";
import DislikeSvg from "@/module/svgs/DislikeSvg";
import ChevronDown from "@/module/svgs/ChevronDown";
import CommentSchima from "@/utils/yupSchemas/CommentSchima";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  saveComment,
  GetCommentsByReference,
  saveReply, // تابع برای ذخیره پاسخ
  likeComment,
  dislikeComment,
} from "@/components/signinAndLogin/Actions/CommentServerActions";

function CommentComponent({ isOpen, onClose, referenceId, type }) {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {comment:"",reply:""},
    resolver: yupResolver(CommentSchima), // اضافه کردن resolver به useForm
  });
  const [comments, setComments] = useState([]); // حالت برای ذخیره نظرات
  const [loading, setLoading] = useState(true); // حالت بارگذاری نظرات
  const [expandedComments, setExpandedComments] = useState({}); // حالت جدید برای ذخیره باز و بسته بودن نظرات
  const [showExpandButton, setShowExpandButton] = useState({}); // حالت برای نمایش دکمه نمایش بیشتر
  const [replyText, setReplyText] = useState({}); // حالت برای ذخیره پاسخ‌ها
  const [replyingTo, setReplyingTo] = useState(null); // تعیین اینکه کاربر به کدام کامنت در حال پاسخ است
  const [expandedReplies, setExpandedReplies] = useState({});

  const commentRef = useRef({});
  const overlayRef = useRef(null);

  useEffect(() => {
    async function getComments() {
      try {
        setLoading(true);
        const res = await GetCommentsByReference(referenceId, type);
        if (res.status === 200) {
          setComments(res.comments);
        } else {
          toast.error("خطا در دریافت نظرات");
        }
      } catch (error) {
        console.error("خطا در دریافت نظرات:", error);
        toast.error("خطا در دریافت نظرات");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      getComments();
    }
  }, [isOpen, referenceId, type]);

  useEffect(() => {
    const handleOverlayClick = (event) => {
      if (event.target === overlayRef.current) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOverlayClick);

    return () => {
      document.removeEventListener("mousedown", handleOverlayClick);
    };
  }, []);

  useEffect(() => {
    comments.forEach((comment) => {
      if (commentRef.current[comment._id]) {
        const { scrollHeight, clientHeight } = commentRef.current[comment._id];
        if (scrollHeight > clientHeight) {
          setShowExpandButton((prev) => ({ ...prev, [comment._id]: true }));
        }
      }
    });
  }, [comments]);

  // مدیریت ارسال فرم جدید با react-hook-form
  const onSubmitHandler = async (data) => {

    const { comment } = data;
    try {
      if (comment.trim() === "") {
        toast.error("متن نظر خالی است");
        return;
      }
      
      const res = await saveComment(comment, type, referenceId);
      if (res.status === 201) {
        toast.success(res.message || "نظر شما با موفقیت ثبت شد");

        const newComment = {
          _id: new Date().getTime().toString(),
          text: comment,
          author: "شما",
          likesCount: 0,
          dislikesCount: 0,
          repliesCount: 0,
        };

        setComments((prevComments) => [newComment, ...prevComments]);
        reset(); // پاک کردن فرم پس از ارسال موفق
      } else {
        toast.error(res.error || "خطا در ذخیره نظرات");
      }
    } catch (error) {
      console.error("خطا در ذخیره نظرات:", error);
      toast.error("خطا در ذخیره نظرات");
    }
  };


  async function handleReplySend(data, commentId) {
    const { reply } = data; // مقدار reply را از داده‌های فرم دریافت می‌کند
    console.log("data----->", reply);
  
    try {
      if (!reply || reply.trim() === "") {
        toast.error("پاسخ خالی است");
        return;
      }
  
      const res = await saveReply(reply, commentId);
      if (res.status === 201) {
        toast.success("پاسخ شما با موفقیت ثبت شد");
  
        // به‌روزرسانی پاسخ‌ها در کامنت
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, repliesCount: comment.repliesCount + 1 }
              : comment
          )
        );
  
        // پاک کردن فرم (ریست کردن تکست باکس)
        reset({ reply: "" }); // این خط مسئول پاک کردن مقدار تکست باکس پس از ارسال موفق است
  
        // بستن حالت پاسخ
        setReplyingTo(null);
      } else {
        toast.error(res.error || "خطا در ذخیره پاسخ");
      }
    } catch (error) {
      console.error("خطا در ذخیره پاسخ:", error);
      toast.error("خطا در ذخیره پاسخ");
    }
  }
  

  function toggleCommentExpand(commentId) {
    setExpandedComments((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  }
  async function handleLike(commentId) {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          if (comment.likedByCurrentUser) {
            return {
              ...comment,
              likesCount: comment.likesCount - 1,
              likedByCurrentUser: false,
            };
          } else {
            return {
              ...comment,
              likesCount: comment.likesCount + 1,
              likedByCurrentUser: true,
            };
          }
        }
        return comment;
      })
    );

    try {
      const res = await likeComment(commentId);
      if (res.status !== 200) {
        toast.error("خطا در ثبت لایک");
      }
    } catch (error) {
      console.error("خطا در ثبت لایک:", error);
      toast.error("خطا در ثبت لایک");
    }
  }

  async function handleDislike(commentId) {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          if (comment.dislikedByCurrentUser) {
            return {
              ...comment,
              dislikesCount: comment.dislikesCount - 1,
              dislikedByCurrentUser: false,
            };
          } else {
            return {
              ...comment,
              dislikesCount: comment.dislikesCount + 1,
              dislikedByCurrentUser: true,
            };
          }
        }
        return comment;
      })
    );

    try {
      const res = await dislikeComment(commentId);
      if (res.status !== 200) {
        toast.error("خطا در ثبت دیس‌لایک");
      }
    } catch (error) {
      console.error("خطا در ثبت دیس‌لایک:", error);
      toast.error("خطا در ثبت دیس‌لایک");
    }
  }
  ////////////////////////////////////////////////
  async function handleReplyLike(replyId, commentId) {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === replyId
                ? {
                    ...reply,
                    likesCount: reply.likedByCurrentUser
                      ? reply.likesCount - 1
                      : reply.likesCount + 1,
                    likedByCurrentUser: !reply.likedByCurrentUser,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );

    try {
      const res = await likeComment(replyId); // فرض می‌کنیم `likeComment` قابلیت مدیریت پاسخ‌ها را دارد.
      if (res.status !== 200) {
        toast.error("خطا در ثبت لایک پاسخ");
      }
    } catch (error) {
      console.error("خطا در ثبت لایک پاسخ:", error);
      toast.error("خطا در ثبت لایک پاسخ");
    }
  }

  async function handleReplyDislike(replyId, commentId) {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === replyId
                ? {
                    ...reply,
                    dislikesCount: reply.dislikedByCurrentUser
                      ? reply.dislikesCount - 1
                      : reply.dislikesCount + 1,
                    dislikedByCurrentUser: !reply.dislikedByCurrentUser,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );

    try {
      const res = await dislikeComment(replyId); // فرض می‌کنیم `dislikeComment` هم پاسخ‌ها را مدیریت می‌کند.
      if (res.status !== 200) {
        toast.error("خطا در ثبت دیسلایک پاسخ");
      }
    } catch (error) {
      console.error("خطا در ثبت دیسلایک پاسخ:", error);
      toast.error("خطا در ثبت دیسلایک پاسخ");
    }
  }

  ////////////////////////////////////////////////
  async function loadReplies(commentId) {
    // اگر پاسخ‌ها باز بودند، بسته می‌شوند
    if (expandedReplies[commentId]) {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: false,
      }));
      return;
    }

    // اگر پاسخ‌ها بسته بودند، آن‌ها را لود و باز می‌کنیم
    try {
      const res = await GetCommentsByReference(commentId, "reply");

      if (res.status === 200) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, replies: res.comments }
              : comment
          )
        );
        setExpandedReplies((prev) => ({
          ...prev,
          [commentId]: true,
        }));
      } else {
        toast.error(res.error || "خطا در دریافت پاسخ‌ها");
      }
    } catch (error) {
      console.error("خطا در دریافت پاسخ‌ها:", error);
      toast.error("خطا در دریافت پاسخ‌ها");
    }
  }
  ////////////////////////////////
  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white dark:bg-zinc-700 w-full max-w-lg h-[80vh] rounded-t-lg shadow-lg overflow-y-auto p-2 ">
        <div className="h-full">
          <div className="hidden">
            // <CloseSvg />
            // <ArrowUpSvg />
            //{" "}
          </div>
          <div className="flex justify-between p-2 md:p-5 h-[10%]">
            <button aria-label="close" className="hover:text-orange-300">
              <svg width="34" height="34" onClick={onClose}>
                <use href="#CloseSvg"></use>
              </svg>
            </button>
            <h1 className="text-3xl font-MorabbaBold">نظرات</h1>
          </div>

          <div className="flex flex-col justify-between h-[90%]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-lg">در حال بارگذاری...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-lg">هیچ نظری وجود ندارد</span>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-grow">
                {comments.map((comment) => {
                  const isExpanded = expandedComments[comment._id];

                  return (
                    <div
                      key={comment._id}
                      className={`comment-container ${
                        comment.author === "شما"
                          ? "my-comment"
                          : "other-comment"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Image
                            src={usericone}
                            alt="تصویر کاربر"
                            width={30}
                            height={30}
                            className="rounded-full pl-1"
                          />
                          <span className="ml-2 font-bold">
                            {comment.author}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className="flex"
                            onClick={() => {
                              if (session) {
                                handleLike(comment._id);
                              } else {
                                alert("لطفاً ابتدا وارد حساب کاربری خود شوید.");
                              }
                            }}
                          >
                            <HeartSvg isLiked={comment.likedByCurrentUser} />
                            <span className="ml-1">{comment.likesCount}</span>
                          </div>

                          <div
                            className="flex"
                            onClick={() => {
                              if (session) {
                                handleDislike(comment._id);
                              } else {
                                alert("لطفاً ابتدا وارد حساب کاربری خود شوید.");
                              }
                            }}
                          >
                            <DislikeSvg
                              isDisliked={comment.dislikedByCurrentUser}
                            />
                            <span className="ml-1">
                              {comment.dislikesCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p
                        ref={(el) => {
                          if (el) {
                            commentRef.current[comment._id] = el;
                          }
                        }}
                        className={`mb-2 pr-4 text-wrap overflow-hidden ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {comment.text}
                      </p>

                      {showExpandButton[comment._id] && (
                        <button
                          className="text-blue-500"
                          onClick={() => toggleCommentExpand(comment._id)}
                        >
                          {isExpanded ? "بستن" : "نمایش بیشتر"}
                        </button>
                      )}

                      <div className="flex justify-between text-xs">
                        <button
                          className="text-blue-500"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          پاسخ
                        </button>
                        {comment.repliesCount > 0 && (
                          <div
                            className="flex cursor-pointer items-center"
                            onClick={() => loadReplies(comment._id)}
                          >
                            <span>{comment.repliesCount} پاسخ</span>

                            <div
                              className={
                                expandedReplies[comment._id] ? "rotate-180" : ""
                              }
                            >
                              <ChevronDown />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* مدیریت پاسخ‌ها */}

                      {expandedReplies[comment._id] &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                          <div className="ml-5 border-l-2 border-gray-300 text-xs">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply._id}
                                className="flex flex-col mb-2"
                              >
                                <span className="font-bold">
                                  {reply.author}
                                </span>
                                <p>{reply.text}</p>

                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex"
                                    onClick={() => {
                                      if (session) {
                                        handleReplyLike(reply._id, comment._id);
                                      } else {
                                        alert(
                                          "لطفاً ابتدا وارد حساب کاربری خود شوید."
                                        );
                                      }
                                    }}
                                  >
                                    <HeartSvg
                                      isLiked={reply.likedByCurrentUser}
                                    />
                                    <span className="ml-1">
                                      {reply.likesCount}
                                    </span>
                                  </div>

                                  <div
                                    className="flex"
                                    onClick={() => {
                                      if (session) {
                                        handleReplyDislike(
                                          reply._id,
                                          comment._id
                                        );
                                      } else {
                                        alert(
                                          "لطفاً ابتدا وارد حساب کاربری خود شوید."
                                        );
                                      }
                                    }}
                                  >
                                    <DislikeSvg
                                      isDisliked={reply.dislikedByCurrentUser}
                                    />
                                    <span className="ml-1">
                                      {reply.dislikesCount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* پاسخ دادن */}
                      {replyingTo === comment._id && (
                        <div className="mt-2">
                            <form onSubmit={handleSubmit((data) => handleReplySend(data, comment._id))}>

                            <input
            className="inputStyle w-[70%]"
            type="text"
            placeholder="پاسخ خود را بنویسید..."
            name="reply"
            id="reply"
            {...register("reply")}
          />
                          <button
                                  type="submit"

                            className="mt-1 p-1 bg-blue-500 text-white rounded-md"
                          >
                            ارسال پاسخ
                          </button>

                        </form>
                        </div>

                      )}
                      {errors.reply && (
                        <span className="text-red-500 text-xs">
                          {errors.reply.message}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* فرم ارسال کامنت جدید */}
            {session && (
              <form onSubmit={handleSubmit((data) => onSubmitHandler(data))}
              className="flex w-full items-center text-center p-1 bg-white dark:bg-zinc-700"
              >
                <Image
                  className="rounded-full w-[10%]"
                  src={usericone}
                  alt="تصویر کاربر"
                  width={30}
                  height={30}
                  quality={60}
                />
                {/* <input
                  className="pr-2 mr-1 w-[80%] h-8 rounded-md dark:bg-zinc-700"
                  placeholder="افزودن نظر ..."
                  {...register("text", { required: true })}
                /> */}
                               <input
            className="inputStyle w-[80%]"
            type="text"
            placeholder="افزودن نظر ..."
            name="comment"
            id="comment"
            {...register("comment")}
          />
                <button
                  type="submit"
                  className="bg-blue-400 p-1 rounded-md w-[10%]"
                >
                  <svg width="34" height="34">
                    <use href="#ArrowUpSvg"></use>
                  </svg>
                </button>
                {errors.comment && (
                        <span className="text-red-500 text-xs">
                          {errors.comment.message}
                        </span>
                      )}
              </form>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default CommentComponent;
