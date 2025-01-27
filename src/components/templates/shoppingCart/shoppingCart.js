import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
 
    ShopingCartItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ShopingCartItems', // اشاره به مدل 'Comment'
        default: [],

      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // تغییر نام از 'Users' به 'User'
    },   
    
  },
  { timestamps: true }
);

export default models.ShoppingCart || model("ShoppingCart", schema);

