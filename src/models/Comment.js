import { Schema, model, models } from "mongoose";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 1000, // محدودیت طول متن کامنت
    },
    author: {
      type: Schema.Types.ObjectId, // ارجاع به کاربر نویسنده
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId, // ارجاع به کاربرانی که لایک کردند
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId, // ارجاع به کاربرانی که دیسلایک کردند
        ref: 'User',
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId, // لیست پاسخ‌ها (کامنت‌هایی که پاسخ هستند)
        ref: 'Comment',
      },
    ],
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_by: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.Comment || model("Comment", commentSchema);
