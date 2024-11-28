// app/products/ProductManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
// import ProductCard from "./ProductCard";
import AddProduct from "./AddProduct";
import { useParams } from 'next/navigation';
// import { AddProductAction, DeleteProducts, EditProductAction ,GetAllProducts} from "@/components/signinAndLogin/Actions/ProductsServerActions";
import { GetAllProducts } from "./ProductActions";
import { Toaster, toast } from "react-hot-toast";
import AccountCategories from "./AccountCategories"; // اطمینان از مسیر صحیح وارد کردن

function ProductManage() {
  const [products, setProducts] = useState([]);
  const [isOpenAddProduct, setIsOpenAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductFile, setSelectedProductFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { ShopId } = params;
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);

  // بهینه‌سازی refreshProducts با استفاده از useCallback
  const refreshProducts = useCallback(async () => {
    try {
      const response = await GetAllProducts(ShopId);
      setProducts(response.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("خطا در دریافت محصولات.");
    }
  }, [ShopId]);

 

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);



  const handleDeleteProduct = useCallback((productId) => {
    setProducts((prevProducts) => prevProducts.filter(product => product._id !== productId));
    toast.success("محصول با موفقیت حذف شد.");
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddProduct(false);
      setSelectedProduct(null);
      setSelectedProductFile(null); // ریست کردن فایل محصول
    }
  }, []);


  const handleSelectParentAccount = useCallback((account) => {
    setSelectedParentAccount(account);
    toast.success(`حساب والد "${account.title}" انتخاب شد.`);
  }, []);
  

  const handleEditClick = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedProductFile(null); // ریست کردن فایل محصول در حالت ویرایش
    setIsOpenAddProduct(true);
  }, []);

  const handleAddProductClick = useCallback(() => {
    setIsOpenAddProduct(true);
    setSelectedProduct(null);
    setSelectedProductFile(null); // ریست کردن فایل محصول در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddProduct(false);
    setSelectedProduct(null);
    setSelectedProductFile(null);
  }, []);

  return (
    <FormTemplate>
 


{isOpenAddProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
           <AddProduct
  product={selectedProduct}
  productFile={selectedProductFile}
  onClose={handleCloseModal}
  refreshProducts={refreshProducts}
  parentAccount={selectedParentAccount} // ارسال حساب والد
/>

          </div>
        </div>
      )}
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت محصولت</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add product"
            onClick={handleAddProductClick}
          >
            افزودن محصول
          </button>
        </div>

        <AccountCategories
  onSelect={handleSelectParentAccount}
  ShopId={ShopId}
  setSelectedParentAccount={setSelectedParentAccount}
  onClose={() => {}}
/>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {/* {products?.map((product) => (
            // <ProductCard
            //   className="p-2 md:p-4"
            //   key={product._id}
            //   product={product}
            //   editFunction={() => handleEditClick(product)}
            //   onDelete={() => handleDeleteProduct(product._id)} // پاس دادن تابع حذف
            // />
          ))} */}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default ProductManage;
