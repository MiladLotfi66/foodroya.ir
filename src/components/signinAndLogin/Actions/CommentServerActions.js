"use server";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import Users from "@/models/Users";
import Comment from "@/models/Comment";
import shops from "@/templates/Shop/shops";
import { authenticateUser } from "../../templates/Shop/ShopServerActions";

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
  
      // تلاش برای احراز هویت کاربر
      let userData;
      try {
        userData = await authenticateUser();
        
      } catch {
        // اگر کاربر احراز هویت نشد، ادامه می‌دهیم
        userData = null;
      }
      

      // بررسی اینکه referenceId و type ارسال شده‌اند
      if (!referenceId || !type) {
        throw new Error("referenceId و type ضروری هستند.");
      }
  
      // جستجوی کامنت‌ها
      const comments = await Comment.find({ referenceId, type })
        .populate('author', 'username')
        .populate('replies', '_id')
        .sort({ createdAt: -1 })
        .lean();

      // ساده‌سازی کامنت‌ها
      const simplifiedComments = comments.map(comment => 
      
          (
        
        {
        _id: comment._id.toString(),
        text: comment.text,
        author: !userData ? comment.author?.username || 'Unknown' : (comment.author?._id.toString() === userData.id ? 'شما' : comment.author?.username || 'Unknown'),
        likesCount: comment.likes?.length || 0,
        dislikesCount: comment.dislikes?.length || 0,
        repliesCount: comment.replies?.length || 0,
        isDeleted: comment.is_deleted || false,
        likedByCurrentUser: userData ? comment.likes?.some(like => like && like.toString() === userData.id) : false,
        dislikedByCurrentUser: userData ? comment.dislikes?.some(dislike => dislike && dislike.toString() === userData.id) : false,
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
      let userData;
      try {
        userData = await authenticateUser();
        
      } catch {
        // اگر کاربر احراز هویت نشد، ادامه می‌دهیم
        userData = null;
      }
        
  
      // بررسی اینکه همه فیلدهای لازم ارسال شده باشند
      if (!text || !userData?.id || !type || !referenceId) {
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
  // احراز هویت کاربر
      let userData;
      try {
        userData = await authenticateUser();
        
      } catch {
        // اگر کاربر احراز هویت نشد، ادامه می‌دهیم
        userData = null;
      }

      if (!userData) {
        throw new Error("لطفا با نام کاربری خود ورود کنید.");

      }
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
      let userData;
      try {
        userData = await authenticateUser();
        
      } catch {
        // اگر کاربر احراز هویت نشد، ادامه می‌دهیم
        userData = null;
      }

      if (!userData) {
        throw new Error("لطفا با نام کاربری خود ورود کنید.");

      }
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

export async function saveReply(text, parentCommentId) {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // احراز هویت کاربر
    let userData;
    try {
      userData = await authenticateUser();
      
    } catch {
      // اگر کاربر احراز هویت نشد، ادامه می‌دهیم
      userData = null;
    }

    if (!userData) {
      throw new Error("لطفا با نام کاربری خود ورود کنید.");

    }
    // بررسی اینکه همه فیلدهای لازم ارسال شده باشند
    if (!text || !userData.id || !parentCommentId) {
      return { message: 'لطفا همه اطلاعات مورد نیاز را ارسال کنید.', status: 400 };
    }

    // ایجاد یک کامنت جدید با نوع "reply"
    const newReply = new Comment({
      text,
      author: userData.id,
      type: "reply",  // نوع کامنت "reply" خواهد بود
      referenceId: parentCommentId  // اشاره به کامنت والد
    });

    // ذخیره پاسخ در دیتابیس
    const savedReply = await newReply.save();

    // پیدا کردن کامنت والد و اضافه کردن شناسه پاسخ به آرایه "replies"
    const parentComment = await Comment.findById(parentCommentId);
    if (parentComment) {
      parentComment.replies.push(savedReply._id); // اضافه کردن شناسه پاسخ به آرایه replies
      await parentComment.save();
    }

    return { message: 'پاسخ با موفقیت ذخیره شد.', status: 201 };

  } catch (error) {
    console.error('خطا در ذخیره‌سازی پاسخ:', error);
    return { error: error.message, status: 500 };
  }
}


export async function GetRepliesByCommentId(commentId) {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // چک کردن شناسه کامنت
    if (!commentId) {
      throw new Error("شناسه کامنت الزامی است.");
    }

    // پیدا کردن کامنت والد و دریافت پاسخ‌های آن
    const comment = await Comment.findById(commentId).populate('replies');
    if (!comment) {
      throw new Error("کامنت پیدا نشد.");
    }

    // برگرداندن پاسخ‌ها با جزئیات کامل
    const replies = await Comment.find({ _id: { $in: comment.replies } }).lean();

    // ساده‌سازی پاسخ‌ها قبل از ارسال
    const simplifiedReplies = replies.map(reply => ({
      _id: reply._id,
      text: reply.text,
      author: reply.author || "Unknown",
      likesCount: reply.likes?.length || 0,
      dislikesCount: reply.dislikes?.length || 0,
      createdAt: reply.createdAt
    }));

    return { replies: simplifiedReplies, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت پاسخ‌ها:", error);
    return { error: error.message, status: 500 };
  }
}
