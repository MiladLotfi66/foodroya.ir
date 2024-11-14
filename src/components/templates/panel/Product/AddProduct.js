"use client";
import { useForm, Controller, FormProvider } from "react-hook-form";
import TagSelect from "./TagSelect";
import Select from "react-select"; // اضافه کردن react-select
import { useTheme } from "next-themes";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ProductsSchema from "./ProductsSchema";
import { useState, useEffect, useRef } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from "next/navigation";
import { AddProductsAction, EditProductsAction } from "./ProductActions";
import { v4 as uuidv4 } from "uuid"; // برای ایجاد شناسه‌های یکتا
import { GetAllPriceTemplates } from "../PriceTemplate/PriceTemplateActions";
import FeatureSelect from "./FeatureSelect";
import { customSelectStyles } from "./selectStyles";
import AccountCategories from './AccountCategories'; // فرض می‌کنیم در همان مسیر قرار دارد
import { GetAccountIdBystoreIdAndAccountCode } from "../Account/accountActions";

function AddProduct({ products = {}, onClose, refreshproducts }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [anbarAcountId, setAnbarAcountId] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingAnbarAcountId, setLoadingAnbarAcountId] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [anbarAcountIdError, setAnbarAcountIdError] = useState("");
  const { ShopId } = useParams();
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [features, setFeatures] = useState([]);
  const [isAccountCategoriesOpen, setIsAccountCategoriesOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    // دریافت قالب‌های قیمتی هنگام مونت شدن کامپوننت
    const fetchPricingTemplates = async () => {
      setLoadingTemplates(true); // تنظیم وضعیت بارگذاری به true
      try {
        const response = await GetAllPriceTemplates(ShopId); // جایگزین با نقطه پایان API شما
        console.log("response", response);

        const templates = response.PriceTemplates?.map((template) => ({
          value: template._id,
          label: template.title,
        }));

        console.log("templates", templates);

        setPricingTemplates(templates);
      } catch (error) {
        console.error('خطا در دریافت قالب‌های قیمتی:', error);
        setTemplateError('بارگذاری قالب‌های قیمتی با مشکل مواجه شد.');
      } finally {
        setLoadingTemplates(false);
      }
    };  
     const fetchAnbarAcountId = async () => {
      setLoadingAnbarAcountId(true); // تنظیم وضعیت بارگذاری به true
      try {
        const response = await GetAccountIdBystoreIdAndAccountCode(ShopId,"1000-1"); // جایگزین با نقطه پایان API شما
        console.log("AnbarAcountId", response);


        setAnbarAcountId(response);
      } catch (error) {
        console.error('خطا در دریافت حساب انبار:', error);
        setAnbarAcountIdError('بارگذاری حساب انبار با مشکل مواجه شد.');
      } finally {
        setLoadingAnbarAcountId(false);
      }
    };
    fetchPricingTemplates();
    fetchAnbarAcountId();
  }, [ShopId]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      
      title: products?.title || "",
      secondaryTitle: products?.secondaryTitle || "",
      items: products?.items || "",
      generalFeatures: products?.generalFeatures || "",
      pricingTemplate: products?.pricingTemplate || "",
      category: products?.category || "",
      tags: products?.tags
        ? products.tags?.map((tag) => ({ label: tag, value: tag }))
        : [],

      storageLocation: products?.storageLocation || "",
      isSaleable:
        products?.isSaleable !== undefined ? products.isSaleable : true,
      isMergeable: products?.isMergeable || false,
      unit: products?.unit || "",
      description: products?.description || "",
      ShopId: ShopId || "",
    },
    resolver: yupResolver(ProductsSchema),
  });
/////////////////////////////
useEffect(() => {
  const fetchingFeature = async () => {
    try {
      const response = await GetAllProductFeature(products?._id); 
      console.log("response", response);

      const features = response.features?.map((feature) => ({
        value: feature._id,
        label: feature.title,
      }));

      console.log("features", features);

      setPricingTemplates(features);
    } catch (error) {
      console.error('خطا در دریافت قالب‌های قیمتی:', error);
      setTemplateError('بارگذاری قالب‌های قیمتی با مشکل مواجه شد.');
    } 
  };
if (products?._id) {
  fetchingFeature();
}
}, []);
  // مدیریت state برای تصاویر به صورت یک آرایه از اشیاء
  const [images, setImages] = useState(() => {
    // تصاویر موجود را با ساختار یکتا تبدیل می‌کنیم
    if (products?.images) {
      return products.images?.map((src) => ({
        id: uuidv4(),
        src,
        file: null, // تصاویر موجود فایل ندارند
        isExisting: true,
      }));
    }
    return [];
  });
/////////////////////////////


  // تابع انتخاب تصاویر جدید
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;
    if (totalImages > 10) {
      toast.error("شما تنها می‌توانید حداکثر ۱۰ تصویر آپلود کنید.");
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("لطفاً فقط فایل‌های تصویری انتخاب کنید.");
    }

    const selectedFiles = validFiles.slice(0, 10 - images.length);
    const newImages = selectedFiles?.map((file) => ({
      id: uuidv4(),
      src: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // تابع حذف تصویر
  const handleDeleteImage = (id) => {
    setImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete) {
        if (!imageToDelete.isExisting && imageToDelete.src.startsWith("blob:")) {
          URL.revokeObjectURL(imageToDelete.src);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // بروزرسانی مقدار فیلد images در react-hook-form
  useEffect(() => {
    const existingImageSrcs = images
      .filter((img) => img.isExisting)
      ?.map((img) => img.src);
    const newImageFiles = images
      .filter((img) => !img.isExisting && img.file)
      ?.map((img) => img.file);
    setValue("existingImages", existingImageSrcs);
    setValue("newImages", newImageFiles);
  }, [images, setValue]);

  // پاکسازی URLهای object برای جلوگیری از نشت حافظه
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isExisting && img.src.startsWith("blob:")) {
          URL.revokeObjectURL(img.src);
        }
      });
    };
  }, [images]);

  // ارسال فرم
  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await ProductsSchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();

      formDataObj.append("ShopId", formData.ShopId);

      // افزودن تصاویر موجود (URL ها)
      formData.existingImages.forEach((image) => {
        formDataObj.append("existingImages", image);
      });

      // افزودن تصاویر جدید (فایل ها)
      formData.newImages.forEach((image) => {
        formDataObj.append("images", image);
      });

      // افزودن سایر فیلدهای فرم
      formDataObj.append("title", formData.title);
      formDataObj.append("secondaryTitle", formData.secondaryTitle);
      formDataObj.append("items", formData.items);
      formDataObj.append("generalFeatures", formData.generalFeatures);
      formDataObj.append("pricingTemplate", formData.pricingTemplate);
      formDataObj.append("category", formData.category);

      // تبدیل آرایه اشیاء تگ‌ها به آرایه رشته‌ای
      const tags = formData.tags?.map((tag) => tag.value);
      tags.forEach((tag) => formDataObj.append("tags", tag));

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
        // ویرایش محصول
        result = await EditProductsAction(formDataObj, ShopId);
      } else {
        // افزودن محصول جدید
        result = await AddProductsAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshproducts();
        const successMessage =
          products && products.id
            ? "محصول با موفقیت ویرایش شد!"
            : "محصول با موفقیت ایجاد شد!";
        toast.success(successMessage);
        reset();
        // آزادسازی Blob URLها پس از ارسال موفق
        images.forEach((img) => {
          if (!img.isExisting && img.src.startsWith("blob:")) {
            URL.revokeObjectURL(img.src);
          }
        });
        setImages([]);
        onClose();
      } else {
        toast.error(result.message || "خطایی در ارسال فرم رخ داده است.");
      }
    } catch (error) {
      console.error("Error handling products:", error);
      toast.error("مشکلی در پردازش محصول وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const handleOpenAccountCategories = () => {
    setIsAccountCategoriesOpen(true);
  };

  const handleCloseAccountCategories = () => {
    setIsAccountCategoriesOpen(false);
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setValue('parentAccount', account); // تنظیم مقدار در فرم
    setIsAccountCategoriesOpen(false);
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

      <FormProvider {...{ register, handleSubmit, control, setValue,formState: { errors }}}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4 p-2 md:p-4"
        >
          {/* بخش مدیریت تصاویر */}
          <div>
            <label className="block mb-2 font-semibold">تصاویر محصول</label>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none transition"
            >
              انتخاب تصویر
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            {/* پیش‌نمایش تصاویر موجود */}
            {images.filter((img) => img.isExisting).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold">تصاویر موجود:</h2>
                <div className="grid grid-cols-3 gap-4">
                  {images
                    .filter((img) => img.isExisting)
                    ?.map((img) => (
                      <div key={`existing-${img.id}`} className="relative">
                        <img
                          src={img.src}
                          alt="Existing Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        {/* دکمه حذف */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          aria-label="حذف تصویر"
                        >
                          <svg width="16" height="16">
                            <use href="#CloseSvg"></use>
                          </svg>{" "}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* پیش‌نمایش تصاویر جدید */}
            {images.filter((img) => !img.isExisting).length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">تصاویر جدید:</h2>
                <div className="grid grid-cols-3 gap-4">
                  {images
                    .filter((img) => !img.isExisting)
                    ?.map((img) => (
                      <div key={`new-${img.id}`} className="relative">
                        <img
                          src={img.src}
                          alt="New Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        {/* دکمه حذف */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          aria-label="حذف تصویر"
                        >
                          <svg width="16" height="16">
                            <use href="#CloseSvg"></use>
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* نمایش خطاها */}
            {errors.existingImages && (
              <p className="text-red-500">{errors.existingImages.message}</p>
            )}
            {errors.newImages && (
              <p className="text-red-500">{errors.newImages.message}</p>
            )}
          </div>

          {/* سایر فیلدهای فرم */}
          <div>
            <label className=" block  mb-1">عنوان محصول</label>
            <input
              type="text"
              {...register("title")}
              className="react-select-container w-full border rounded px-3 py-2"
              required
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
        
          <div>
            <label className="block mb-1">دسته بندی کالا و تگ ها </label>
            <TagSelect
              control={control}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
            />

            {errors.items && (
              <p className="text-red-500">{errors.items.message}</p>
            )}
          </div>

     
          {/* بخش انتخاب قالب قیمتی با استفاده از react-select */}
          <div>
            <label className="block mb-1">قالب قیمتی</label>
            {loadingTemplates ? (
              <HashLoader size={20} color="#000" />
            ) : templateError ? (
              <p className="text-red-500">{templateError}</p>
            ) : (
              <Controller
                name="pricingTemplate"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={pricingTemplates}
                    placeholder="انتخاب قالب قیمتی"
                    isClearable
                          styles={ theme === "dark"?customSelectStyles :""}
                    value={
                      pricingTemplates?.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption ? selectedOption.value : "");
                    }}
                  // className=" react-select-container"
                  // classNamePrefix="select "
                  />
                )}
              />
            )}
            {errors.pricingTemplate && (
              <p className="text-red-500">{errors.pricingTemplate.message}</p>
            )}
          </div>

        {/* /////////////////////////////// */}
        <div>
          <label>حساب والد:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              {...register('parentAccount')}
              value={selectedAccount ? selectedAccount.label : ''}
              readOnly
              style={{ marginRight: '10px' }}
            />
            <button type="button" onClick={handleOpenAccountCategories}>
              انتخاب حساب والد
            </button>
          </div>
          {errors.parentAccount && <span>This field is required</span>}
        </div>

       {/* //////////////////////////////////// */}
          <div>
            <label className="block mb-1">محل قرار گیری</label>
            <input
              {...register("storageLocation")}
              className="react-select-container w-full border rounded px-3 py-2"
              required
            />
            {errors.storageLocation && (
              <p className="text-red-500">{errors.storageLocation.message}</p>
            )}
          </div>
<div className="flex items-center justify-around">

          <div className="flex items-center gap-2 h-10">
            <label >قابل فروش</label>
            <input
              type="checkbox"
              {...register("isSaleable")}
              className=" border rounded h-10"
              />
         
            {errors.isSaleable && (
              <p className="text-red-500">{errors.isSaleable.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 h-10">
            <label >قابل ادغام و تقسیم</label>
            <input
              type="checkbox"
              {...register("isMergeable")}
              className="border rounded h-10"
              />
            {errors.isMergeable && (
              <p className="text-red-500">{errors.isMergeable.message}</p>
            )}
          </div>
            </div>

          <div>
            <label className="block mb-1">نام واحد</label>
            <input
              {...register("unit")}
              className="react-select-container w-full border rounded px-3 py-2"
              required
            />
            {errors.unit && (
              <p className="text-red-500">{errors.unit.message}</p>
            )}
          </div>

        {/* کامپوننت FeatureSelect */}
        <FeatureSelect />


          <div>
            <label className="block mb-1">توضیحات</label>
            <textarea
              {...register("description")}
              className="react-select-container w-full border rounded px-3 py-2"
              required
            ></textarea>
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* دکمه ارسال فرم */}
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <HashLoader size={20} color="#fff" />
            ) : products?._id ? (
              "ویرایش محصول"
            ) : (
              "افزودن محصول"
            )}
          </button>
          <Toaster />
        </form>

              {/* نمایش AccountCategories */}
      {isAccountCategoriesOpen && (
        <AccountCategories
          onSelect={handleSelectAccount}
          onClose={handleCloseAccountCategories}
        />
      )}

      </FormProvider>
    </div>
  );
}

export default AddProduct;
