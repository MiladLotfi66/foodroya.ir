import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    UserId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true

    },

    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
      required: true

    },

    RoleId: {
      type: Schema.Types.ObjectId,
      ref: "rolePerimision",
      required: true

    },

    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true

    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true

    },
  },
  { timestamps: true }
);

export default models.RoleInShop || model("RoleInShop", schema);
