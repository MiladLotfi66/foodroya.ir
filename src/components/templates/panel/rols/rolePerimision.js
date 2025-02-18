import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    RoleTitle: {
      type: String,
      required: true
    },
    
    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    sendMethodPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    accountsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    contactsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     priceTemplatesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    productsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    financialDocumentsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     sendMethodsPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     purchaseInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     saleInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     purchaseReturnInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
     saleReturnInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    allInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    wasteInvoicesPermissions: {
      type: [String],
      enum: ["add", "edit", "delete", "view"],
      default: [],
    },
    RoleStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default models.rolePerimision || model("rolePerimision", schema);
