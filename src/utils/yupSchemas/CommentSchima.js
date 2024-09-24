import * as yup from "yup";

const CommentSchima = yup.object().shape({  
  comment: yup
    .string()
    .max(300, "متن نظر نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد"),
    reply: yup
    .string()
    .max(300, "متن نظر نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد"),
});

export default CommentSchima;
