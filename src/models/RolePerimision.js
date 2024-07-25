import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    bannersPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },

    rolsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    RoleStatus: { type: Boolean, required: true },

  },
  { timestamps: true }
);

export default models.rolePerimision || model("rolePerimision", schema);
