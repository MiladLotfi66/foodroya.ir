"use server";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import Users from "@/models/Users";
import Comment from "@/models/Comment";
import shops from "@/models/shops";
import { authenticateUser } from "./ShopServerActions";

export async function GetCommentFromArray(commentIds) {
    try {
      // اتصال به دیتابیس
      await connectDB();
  
      // چک کردن اینکه commentIds به درستی وارد شده باشد
      if (!Array.isArray(commentIds)) {
        throw new Error("commentIds باید یک آرایه از شناسه‌های کامنت باشد.");
      }
  
      // جستجوی کامنت‌ها بر اساس شناسه‌های داده شده
      const comments = await Comment.find({ _id: { $in: commentIds } })
        .populate('author', 'name')  // در صورت نیاز به اطلاعات بیشتر از نویسنده
        .populate('replies', '_id')  // فقط شناسه‌های پاسخ‌ها را می‌خواهیم
        .lean();
  
      // ساده‌سازی کامنت‌ها قبل از ارسال
      const simplifiedComments = comments.map(comment => ({
        _id: comment._id,
        text: comment.text, // متن کامنت
        author: comment.author?.name || 'Unknown', // نویسنده کامنت
        likesCount: comment.likes?.length || 0, // تعداد لایک‌ها
        dislikesCount: comment.dislikes?.length || 0, // تعداد دیسلایک‌ها
        repliesCount: comment.replies?.length || 0, // تعداد پاسخ‌ها
        isDeleted: comment.is_deleted || false, // وضعیت حذف شده بودن
      }));
  
      return { comments: simplifiedComments, status: 200 };
    } catch (error) {
      console.error("خطا در دریافت کامنت‌ها:", error);
      return { error: error.message, status: 500 };
    }
  }
  
  
  export async function GetCommentsByReference(referenceId, type) {
    
    try {
      // اتصال به دیتابیس
      await connectDB();
      const userData = await authenticateUser();

      // بررسی اینکه referenceId و type به درستی ارسال شده‌اند
      if (!referenceId || !type) {
        throw new Error("referenceId و type ضروری هستند.");
      }
  
      // جستجوی کامنت‌ها بر اساس referenceId و type
      const comments = await Comment.find({ referenceId, type })
        .populate('author', 'username')  // اطلاعات نویسنده کامنت
        .populate('replies', '_id')  // فقط شناسه‌های پاسخ‌ها
        .sort({ createdAt: -1 })  // مرتب‌سازی بر اساس زمان ایجاد، جدیدترین‌ها اول

        .lean();

      // ساده‌سازی کامنت‌ها قبل از ارسال
      const simplifiedComments = comments.map(comment => ({
        _id: comment._id.toString(), // تبدیل ObjectId به رشته
        text: comment.text, // متن کامنت
        author: comment.author?._id.toString() === userData.id ? 'شما' : comment.author?.username || 'Unknown', // بررسی نویسنده و جایگزینی با "شما"
        likesCount: comment.likes?.length || 0, // تعداد لایک‌ها
        dislikesCount: comment.dislikes?.length || 0, // تعداد دیسلایک‌ها
        repliesCount: comment.replies?.length || 0, // تعداد پاسخ‌ها
        isDeleted: comment.is_deleted || false, // وضعیت حذف شده بودن
        likedByCurrentUser: comment.likes?.some(like => like.toString() === userData.id) || false, // بررسی اینکه کاربر فعلی لایک کرده یا نه
        dislikedByCurrentUser: comment.dislikes?.some(dislike => dislike.toString() === userData.id) || false, // بررسی اینکه کاربر فعلی دیسلایک کرده یا نه
  
      }));
  
      return { comments: simplifiedComments, status: 200 };
  
    } catch (error) {
      console.error("خطا در دریافت کامنت‌ها:", error);
      return { error: error.message, status: 500 };
    }
  }
  
  export async function saveComment(text, type, referenceId) {
    
    try {
      await connectDB();
  
      // احراز هویت کاربر
      const userData = await authenticateUser();
      
  
      // بررسی اینکه همه فیلدهای لازم ارسال شده باشند
      if (!text || !userData.id || !type || !referenceId) {
        return { message: 'لطفا همه اطلاعات مورد نیاز را ارسال کنید.', status: 400 };
  
      }
  
      // ایجاد یک کامنت جدید
      const newComment = new Comment({
        text,
        author:userData.id ,
        type,
        referenceId
      });
  
      // ذخیره کامنت در دیتابیس
      await newComment.save();
  
      return { message: 'کامنت با موفقیت ذخیره شد.', status: 201 };
  
    } catch (error) {
      console.error('خطا در ذخیره‌سازی کامنت:', error);
      return { error: error.message, status: 500 };
    }
  
  }

  export async function likeComment(commentId) {
    try {
        await connectDB();

        // احراز هویت کاربر
        const userData = await authenticateUser();

        if (!commentId) {
            throw new Error("شناسه کامنت الزامی است.");
        }

        // ابتدا بررسی می‌کنیم که آیا کاربر قبلاً لایک کرده است
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error("کامنت پیدا نشد.");
        }

        const userLikedIndex = comment.likes.indexOf(userData.id);

        if (userLikedIndex > -1) {
            // اگر کاربر قبلاً لایک کرده باشد، لایک را حذف می‌کنیم
            comment.likes.splice(userLikedIndex, 1);
        } else {
            // در غیر این صورت، لایک جدید را اضافه می‌کنیم
            comment.likes.push(userData.id);
        }

        await comment.save();
        return { message: 'وضعیت لایک با موفقیت به‌روزرسانی شد.', status: 200 };
    } catch (error) {
        console.error('خطا در ثبت لایک:', error);
        return { error: error.message, status: 500 };
    }
}

  
export async function dislikeComment(commentId) {
  try {
      await connectDB();

      // احراز هویت کاربر
      const userData = await authenticateUser();

      if (!commentId) {
          throw new Error("شناسه کامنت الزامی است.");
      }

      // ابتدا بررسی می‌کنیم که آیا کاربر قبلاً دیس‌لایک کرده است
      const comment = await Comment.findById(commentId);
      if (!comment) {
          throw new Error("کامنت پیدا نشد.");
      }

      const userDislikedIndex = comment.dislikes.indexOf(userData.id);

      if (userDislikedIndex > -1) {
          // اگر کاربر قبلاً دیس‌لایک کرده باشد، دیس‌لایک را حذف می‌کنیم
          comment.dislikes.splice(userDislikedIndex, 1);
      } else {
          // در غیر این صورت، دیس‌لایک جدید را اضافه می‌کنیم
          comment.dislikes.push(userData.id);
      }

      await comment.save();
      return { message: 'وضعیت دیس‌لایک با موفقیت به‌روزرسانی شد.', status: 200 };
  } catch (error) {
      console.error('خطا در ثبت دیس‌لایک:', error);
      return { error: error.message, status: 500 };
  }
}

  