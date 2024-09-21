import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import CloseSvg from "@/module/svgs/CloseSvg";
import ArrowUpSvg from "@/module/svgs/ArrowUpSvg";
import usericone from "@/public/Images/jpg/user.webp";
import HeartSvg from "@/module/svgs/HeartSvg";
import DislikeSvg from "@/module/svgs/DislikeSvg";
import {
  saveComment,
  GetCommentsByReference,
  likeComment,
  dislikeComment,
} from "@/components/signinAndLogin/Actions/CommentServerActions"; // فرض می‌کنیم fetchComments تابعی برای دریافت نظرات است

function CommentComponent({ isOpen, onClose, referenceId, type }) {
  const [text, setText] = useState(""); // حالت برای متن ورودی کاربر
  const [comments, setComments] = useState([]); // حالت برای ذخیره نظرات
  const [loading, setLoading] = useState(true); // حالت بارگذاری نظرات
  const commentRef = useRef(null);

  useEffect(() => {
    // تابع برای درخواست نظرات از سرور
    async function getComments() {
      try {
        setLoading(true); // شروع بارگذاری
        const res = await GetCommentsByReference(referenceId, type); // درخواست نظرات
        if (res.status === 200) {
          setComments(res.comments); // ذخیره نظرات در حالت
        } else {
          toast.error("خطا در دریافت نظرات");
        }
      } catch (error) {
        console.error("خطا در دریافت نظرات:", error);
        toast.error("خطا در دریافت نظرات");
      } finally {
        setLoading(false); // پایان بارگذاری
      }
    }

    if (isOpen) {
      getComments(); // فقط وقتی کامپوننت باز است، نظرات دریافت شود
    }
  }, [isOpen, referenceId, type]); // وابسته به باز شدن و تغییرات referenceId یا type

  useEffect(() => {
    function handleClickOutside(event) {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commentRef, onClose]);

  async function onSendHandler() {
    try {
      if (text.trim() === "") {
        toast.error("متن نظر خالی است");
        return;
      }
      const res = await saveComment(text, type, referenceId);
      if (res.status === 201) {
        toast.success(res.message || "نظر شما با موفقیت ثبت شد");

        // ساخت یک شیء جدید برای نظر و افزودن آن به لیست نظرات
        const newComment = {
          _id: new Date().getTime().toString(), // تبدیل شناسه به رشته برای اطمینان
          text: text,
          author: "شما", // می‌توانید نام کاربر فعلی را استفاده کنید
          likesCount: 0,
          dislikesCount: 0,
          repliesCount: 0,
        };

        setComments((prevComments) => [newComment, ...prevComments]); // افزودن نظر جدید به لیست
        setText(""); // خالی کردن ورودی پس از ارسال موفق
      } else {
        toast.error(res.error || "خطا در ذخیره نظرات");
      }
    } catch (error) {
      console.error("خطا در ذخیره نظرات:", error);
      toast.error("خطا در ذخیره نظرات");
    }
  }

  async function handleLike(commentId) {
    setComments((prevComments) =>
        prevComments.map((comment) => {
            if (comment._id === commentId) {
                if (comment.likedByCurrentUser) {
                    // اگر قبلاً لایک کرده باشد
                    return {
                        ...comment,
                        likesCount: comment.likesCount - 1,
                        likedByCurrentUser: false,
                    };
                } else {
                    // اگر لایک نکرده باشد
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
                  // اگر قبلاً دیس‌لایک کرده باشد
                  return {
                      ...comment,
                      dislikesCount: comment.dislikesCount - 1,
                      dislikedByCurrentUser: false,
                  };
              } else {
                  // اگر دیس‌لایک نکرده باشد
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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
      <div
        ref={commentRef}
        className="bg-white dark:bg-zinc-700 w-full max-w-lg h-[80vh] rounded-t-lg shadow-lg overflow-y-auto p-2 "
      >
        <div className="h-full">
          <div className="hidden">
            <CloseSvg />
            <ArrowUpSvg />
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
                {/* نمایش نظرات موجود */}
                {comments?.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-b border-gray-200 py-2"
                  >
                    <div className="flex justify-between items-center mb-2 ">
                      <div className="flex items-center">
                        <Image
                          src={usericone}
                          alt="تصویر کاربر"
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                        <span className="ml-2 font-bold">{comment.author}</span>
                      </div>

                      <div className="flex items-center">
                        {/* کامپوننت لایک */}
                        <div
                          onClick={() => handleLike(comment._id)} // تابع لایک
                        >
                          <HeartSvg
                            isLiked={comment.likedByCurrentUser} // پاس دادن وضعیت لایک
                          />
                        </div>
                        <span className="ml-1">{comment.likesCount}</span>

                        {/* کامپوننت دیسلایک */}
                        <div
                          onClick={() => handleDislike(comment._id)} // تابع دیسلایک
                        >
                          <DislikeSvg
                            isDisliked={comment.dislikedByCurrentUser} // پاس دادن وضعیت دیسلایک
                          />
                        </div>
                        <span className="ml-1">{comment.dislikesCount}</span>
                      </div>
                    </div>
                    <p className="mb-2 pr-4">{comment.text}</p>
                    <div className="flex justify-between">
                      <span>{comment.repliesCount} پاسخ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* دایو ورودی نظر که باید به پایین بچسبد */}
            <div className="flex w-full items-center text-center p-1 bg-white dark:bg-zinc-700">
              <Image
                className="rounded-full w-[10%]"
                src={usericone}
                alt="تصویر کاربر"
                width={30}
                height={30}
                quality={60}
              />
              <input
                className="pr-2 mr-1 w-[80%] h-8  rounded-md dark:bg-zinc-700"
                placeholder="افزودن نظر ..."
                value={text}
                onChange={(e) => setText(e.target.value)} // به‌روزرسانی متن ورودی کاربر
              />
              <div className="bg-blue-400 p-1 rounded-md w-[10%]">
                <svg width="34" height="34" onClick={onSendHandler}>
                  <use href="#ArrowUpSvg"></use>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default CommentComponent;
