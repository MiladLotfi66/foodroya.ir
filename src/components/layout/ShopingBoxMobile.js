"use client";
import Xmark from "@/module/svgs/X-mark";
import BasketShopProductCard from "@/module/BasketShopProductCard";
import BasketShopFooter from "@/module/BasketShopFooter";

import { toggleBasketCart, selectIsBasketCartOpen } from "../../Redux/features/mobileMenu/mobileMenuSlice";

import { useDispatch } from "react-redux";

import { useSelector } from "react-redux";


// import {
    //     selectreversemobileBasketState,
    //     reversemobileBasketState,
    // } from "../../Redux/features/mobileMenu/mobileMenuSlice";
    // import { useSelector, useDispatch } from "react-redux";
    
    function ShopingBoxMobile() {
        // const isBasketOpen = useSelector(selectreversemobileBasketState);
        //  const dispatch = useDispatch();
        const isBasketCartOpen = useSelector(selectIsBasketCartOpen);
        
        const dispatch = useDispatch();
        
        const handleToggleBasketMenu = () => {
        
          dispatch(toggleBasketCart());
        
        };
      


  return (
    <>
      {
             <div>
                <div onClick={handleToggleBasketMenu} className=" md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"></div>

            <div
              className="fixed top-0 bottom-0 left-0 w-64 pt-3 px-4 overflow-y-auto transition-all min-h-screen  md:hidden bg-white dark:bg-zinc-700 z-20"
            >
        
              {/* ************************ header ************************ */}
              <div className="flex justify-between border-b pb-2 border-b-gray-300 dark:border-b-white/10">
                 <div onClick={handleToggleBasketMenu} >

                  <Xmark />
                 </div>
                  <div>سبد خرید</div>
                  
              </div>
            
              {/* ************************ product list ************************ */}
           <BasketShopProductCard/>
           <BasketShopProductCard/>
           <BasketShopProductCard/>
  
              {/* ************************ footer ************************ */}
  
           <BasketShopFooter/>
            </div>
            {/* ************************ overlay ************************ */}

            {/* <div onClick={() => dispatch(reversemobileBasketState())} className="overlay md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"></div> */}
          </div>
        //   ):("")
      }
      

    </>
  );
}

export default ShopingBoxMobile;
