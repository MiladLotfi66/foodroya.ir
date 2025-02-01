import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
 
    product: 
      {
        type: Schema.Types.ObjectId,
        ref: 'Product', // اشاره به مدل 'Comment'
      },

      quantity: {
        type: Number,
        default: 1,
        min: 1
      },

      price: {
        type: Number,
      },
    
    Shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop', // تغییر نام از 'Users' به 'User'
    },  
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // تغییر نام از 'Users' به 'User'
    },   
    
  },
  { timestamps: true }
);

export default models.ShopingCartItems || model("ShopingCartItems", schema);

