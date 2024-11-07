
"use client";
import { useForm, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader"; // در صورت نیاز به Loader
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ProductsSchema from "./ProductsSchema";
import { useEffect, useState } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from 'next/navigation';
import { AddProductsAction, EditProductsAction } from "./ProductActions";
import ImageUpload from "./ImageUpload"; // وارد کردن کامپوننت ImageUpload

function AddProduct({ products = {}, onClose, refreshproducts }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      images: products?.images || [],
      title: products?.title || "",
      secondaryTitle: products?.secondaryTitle || "",
      items: products?.items || "",
      generalFeatures: products?.generalFeatures || "",
      pricingTemplate: products?.pricingTemplate || "",
      category: products?.category || "",
      tags: products?.tags || "",
      storageLocation: products?.storageLocation || "",
      isSaleable: products?.isSaleable || true,
      isMergeable: products?.isMergeable || false,
      unit: products?.unit || "",
      description: products?.description || "",
      shopUniqName: shopUniqName || "",
    },
    resolver: yupResolver(ProductsSchema),
  });

  const handleImageChange = (newImages) => {
    setImages(newImages);
    console.log('تصاویر به‌روزرسانی شدند:', newImages);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await ProductsSchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();

      formDataObj.append("shopUniqName", formData.shopUniqName);

      // افزودن تصاویر
      formData.images.forEach((image, index) => {
        if (image instanceof File) {
          formDataObj.append(`images`, image);
        } else if (typeof image === "string") {
          // اگر در حال ویرایش و تصویر URL موجود است
          formDataObj.append(`existingImages`, image);
        }
      });

      formDataObj.append("title", formData.title);
      formDataObj.append("secondaryTitle", formData.secondaryTitle);
      formDataObj.append("items", formData.items);
      formDataObj.append("generalFeatures", formData.generalFeatures);
      formDataObj.append("pricingTemplate", formData.pricingTemplate);
      formDataObj.append("category", formData.category);
      formDataObj.append("tags", formData.tags);
      formDataObj.append("storageLocation", formData.storageLocation);
      formDataObj.append("isSaleable", formData.isSaleable);
      formDataObj.append("isMergeable", formData.isMergeable);
      formDataObj.append("unit", formData.unit);
      formDataObj.append("description", formData.description);

      if (products?._id) {
        formDataObj.append("id", products._id);
      }

      let result;
      if (products?._id) {
        // اگر محصول برای ویرایش است
        result = await EditProductsAction(formDataObj, shopUniqName);
      } else {
        // اگر محصول جدید باشد
        result = await AddProductsAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshproducts();
        const successMessage = products && products.id ? "محصول با موفقیت ویرایش شد!" : "محصول با موفقیت ایجاد شد!";
        toast.success(successMessage);
        reset();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error handling products:", error);
      toast.error("مشکلی در پردازش محصول وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formSubmitting = async (formData) => {
    await handleFormSubmit(formData);
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        <CloseSvg />
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button
          aria-label="close"
          className="hover:text-orange-300"
          onClick={onClose}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {products?._id ? "ویرایش محصول" : "افزودن محصول"}
        </h1>
      </div>

      <form
onSubmit={handleSubmit(formSubmitting)}
className="flex flex-col gap-4 p-2 md:p-4"
>
<div>
            <ImageUpload
          control={control}
          name="images"
          existingImages={products?.images || []}
        />
        {errors.images && <p className="text-red-500">{errors.images.message}</p>}


  <label className="block mb-1">عنوان محصول</label>
  <input
    type="text"
    {...register("title")}
    className="w-full border rounded px-3 py-2"
    required
  />
  {errors.title && <p className="text-red-500">{errors.title.message}</p>}
</div>

<div>
  <label className="block mb-1">عنوان دوم محصول</label>
  <input
    type="text"
    {...register("secondaryTitle")}
    className="w-full border rounded px-3 py-2"
    required
  />
  {errors.secondaryTitle && <p className="text-red-500">{errors.secondaryTitle.message}</p>}
</div>

<div>
  <label className="block mb-1">نام شی</label>
  <input
    type="text"
    {...register("items")}
    className="w-full border rounded px-3 py-2"
    required
  />
  {errors.items && <p className="text-red-500">{errors.items.message}</p>}
</div>

<div>
  <label className="block mb-1">مشخصات عمومی</label>
  <input
    type="text"
    {...register("generalFeatures")}
    className="w-full border rounded px-3 py-2"
    required
  />
  {errors.generalFeatures && <p className="text-red-500">{errors.generalFeatures.message}</p>}
</div>

<div>
  <label className="block mb-1">قالب قیمتی</label>
  <input
    {...register("pricingTemplate")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.pricingTemplate && <p className="text-red-500">{errors.pricingTemplate.message}</p>}
</div> 

<div>
  <label className="block mb-1">دسته بندی حساب</label>
  <input
    {...register("category")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.category && <p className="text-red-500">{errors.category.message}</p>}
</div>

<div>
  <label className="block mb-1">تگ ها</label>
  <input
    {...register("tags")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.tags && <p className="text-red-500">{errors.tags.message}</p>}
</div>
<div>
  <label className="block mb-1">محل قرار گیری</label>
  <input
    {...register("storageLocation")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.storageLocation && <p className="text-red-500">{errors.storageLocation.message}</p>}
</div>
{/* ///////////////////////// */}
<div>
<label className="block mb-1">قابل فروش</label>
<Controller
name="isSaleable"
control={control}
render={({ field }) => (
<div className="flex items-center">
<span>غیرفعال</span>
<button
  type="button"
  onClick={() => field.onChange(!field.value)}
  className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-2 m-1 duration-300 ease-in-out ${
    field.value ? "bg-teal-500" : "bg-gray-300"
  }`}
>
  <div
    className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
      field.value ? "-translate-x-6" : ""
    }`}
  ></div>
</button>
<span className="ml-1">فعال</span>
</div>
)}
/>
{errors.isSaleable && <p className="text-red-500">{errors.isSaleable.message}</p>}
</div>


<div>
  <label className="block mb-1">قابل ادغام و تقسیم</label>
  <checkbox
    {...register("isMergeable")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </checkbox>
  {errors.isMergeable && <p className="text-red-500">{errors.isMergeable.message}</p>}
</div>
<div>
  <label className="block mb-1">نام واحد</label>
  <input
    {...register("unit")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.unit && <p className="text-red-500">{errors.unit.message}</p>}
</div> 
<div>
  <label className="block mb-1">توضیحات</label>
  <input
    {...register("description")}
    className="w-full border rounded px-3 py-2"
    required
  >
  </input>
  {errors.description && <p className="text-red-500">{errors.description.message}</p>}
</div>

{/* سایر فیلدهای مربوط به محصول می‌تواند اینجا اضافه شود */}
<button
  type="submit"
  className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
  disabled={isSubmit}
>
  {isSubmit ? <HashLoader size={20} color="#fff" /> : (products?._id ? "ویرایش محصول" : "افزودن محصول")}
</button>
<Toaster />
</form>
    </div>
  );
}

export default AddProduct;




