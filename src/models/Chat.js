import { Schema, model, models } from "mongoose";

// ابتدا MessageSchema را تعریف می‌کنیم
const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
}, { timestamps: true });

// سپس RoomsSchema را تعریف می‌کنیم و از MessageSchema استفاده می‌کنیم
const RoomsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    messages: {
        type: [MessageSchema],
        default: [],
    },
}, { timestamps: true });

// در نهایت NameSpaceSchema را تعریف می‌کنیم و از RoomsSchema استفاده می‌کنیم
const NameSpaceSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    href: {
        type: String,
        required: true,
    },
    rooms: {
        type: [RoomsSchema],
        default: []
    }
}, { timestamps: true });

export default models.NameSpace || model("NameSpace", NameSpaceSchema);
