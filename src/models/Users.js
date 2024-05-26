import { Schema, model, models } from "mongoose";
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
      required: true,
    },
    refreshToken:String,
  },
  { timestamp: true }
);
export default models.User || model("User", UserSchema);
