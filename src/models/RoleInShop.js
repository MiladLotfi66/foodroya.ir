import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    UserId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
    },

    RoleId: {
      type: Schema.Types.ObjectId,
      ref: "rolePerimision",
    },

    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

export default models.RoleInShop || model("RoleInShop", schema);
