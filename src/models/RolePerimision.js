import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    RoleTitle: {
      type: String,
      required: true
    },
    
    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "shops",
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

    bannersPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },

    rolesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
  
    RoleStatus: { type: Boolean, required: true },

  },
  { timestamps: true }
);

export default models.rolePerimision || model("rolePerimision", schema);
