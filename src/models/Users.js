import { Schema, model, models } from "mongoose";
const UserSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: () => Date.now(),
    imutable: true,
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
    imutable: true,

  },
  role: {
    type: String,
    default: "user",
    required: true
    
  }
});
export default models.User || model("User", UserSchema);
