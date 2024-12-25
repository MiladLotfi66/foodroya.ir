import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    // UserId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User", // تصحیح نام مدل رفرنس
    //   required: true,
    // },
    ContactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact", // تصحیح نام مدل رفرنس
      required: true,
    },
    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop", // اطمینان از صحیح بودن نام مدل
      required: true,
    },
    RoleId: {
      type: Schema.Types.ObjectId,
      ref: "rolePerimision", // اصلاح نام مدل ؛ باید با نام صحیح هماهنگ باشد
      required: true,
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.RoleInShop || model("RoleInShop", schema);
