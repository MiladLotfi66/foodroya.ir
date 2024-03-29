import { Schema, model, models } from "mongoose";
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
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
  },
  { timestamp: true }
);
export default models.User || model("User", UserSchema);
