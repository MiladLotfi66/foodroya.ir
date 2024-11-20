"use client";
import { useForm, Controller, FormProvider } from "react-hook-form";
import TagSelect from "./TagSelect";
import Select, { components } from "react-select"; // اضافه کردن react-select و components
import { useTheme } from "next-themes";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ProductsSchema from "./ProductsSchema";
import { useState, useEffect, useRef } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams, useRouter } from "next/navigation"; // اضافه کردن useRouter
import { AddProductAction } from "./ProductActions";
import { v4 as uuidv4 } from "uuid"; // برای ایجاد شناسه‌های یکتا
import { GetAllPriceTemplates } from "../PriceTemplate/PriceTemplateActions";
import FeatureSelect from "./FeatureSelect";
import { customSelectStyles } from "./selectStyles";

function AddProduct({
  products = {},
  onClose,
  refreshProducts,
  parentAccount,
}) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const { ShopId } = useParams();
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // استفاده از useRouter برای هدایت
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    // دریافت قالب‌های قیمتی هنگام مونت شدن کامپوننت
    const fetchPricingTemplates = async () => {
      setLoadingTemplates(true); // تنظیم وضعیت بارگذاری به true
      try {
        const response = await GetAllPriceTemplates(ShopId); // جایگزین با نقطه پایان API شما
        const templates = response.PriceTemplates?.map((template) => ({
          value: template._id,
          label: template.title,
        }));
        setPricingTemplates(templates);
      } catch (error) {
        console.error("خطا در دریافت قالب‌های قیمتی:", error);
        setTemplateError("بارگذاری قالب‌های قیمتی با مشکل مواجه شد.");
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchPricingTemplates();
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
      pricingTemplate: products?.pricingTemplate || "",
      parentAccount: parentAccount,
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

        const features = response.features?.map((feature) => ({
          value: feature._id,
          label: feature.title,
        }));

        setPricingTemplates(features);
      } catch (error) {
        console.error("خطا در دریافت قالب‌های قیمتی:", error);
        setTemplateError("بارگذاری قالب‌های قیمتی با مشکل مواجه شد.");
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
    const files = e.target.files;
    const fileReaders = [];
    const images = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileReader = new FileReader();
      fileReaders.push(fileReader);
      fileReader.onload = () => {
        images.push({
          name: file.name,
          content: fileReader.result.split(',')[1], // حذف پیشوند Base64
        });
        if (images.length === files.length) {
          setValue("newImages", images);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  

  // تابع حذف تصویر
  const handleDeleteImage = (id) => {
    setImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete) {
        if (
          !imageToDelete.isExisting &&
          imageToDelete.src.startsWith("blob:")
        ) {
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

// در تابع handleFormSubmit در AddProduct تغییر دهید:
const handleFormSubmit = async (formData) => {
  setIsSubmit(true);
  try {
    await ProductsSchema.validate(formData, { abortEarly: false });

    let newImagePaths = [];

    // اگر تصاویر جدید موجود هستند، آن‌ها را ذخیره کنید
    if (formData.newImages && formData.newImages.length > 0) {
      for (const img of formData.newImages) {
        const imagePath = await saveBase64Image(img.content, img.name);
        newImagePaths.push(imagePath);
      }
    }

    // ترکیب تصاویر موجود و تصاویر جدید
    const allImages = [
      ...(formData.existingImages || []),
      ...newImagePaths,
    ];

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.map((tag) => tag.value) : [],
      images: allImages, // استفاده از همه تصاویر
      // حذف سایر فیلدهای اضافی در صورت نیاز
    };

    // ارسال Payload به سرور
    let result;
    if (products?._id) {
      // ویرایش محصول
      result = await EditProductsAction(JSON.parse(JSON.stringify(payload)), products._id);
    } else {
      // افزودن محصول جدید
      result = await AddProductAction(JSON.parse(JSON.stringify(payload)));
    }

    if (result.status === 201 || result.status === 200) {
      await refreshProducts();
      const successMessage = products && products._id
        ? "محصول با موفقیت ویرایش شد!"
        : "محصول با موفقیت ایجاد شد!";
      toast.success(successMessage);
      reset();
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


  // تعریف کامپوننت سفارشی برای MenuList
  const CustomMenuList = (props) => {
    return (
      <>
        <components.MenuList {...props}>{props.children}</components.MenuList>
        {/* دکمه افزودن در انتهای لیست */}
        <div
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            borderTop: "1px solid #ddd",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
          onMouseDown={(e) => {
            e.preventDefault(); // جلوگیری از فوکوس گرفتن روی Select
            router.push(`/${ShopId}/panel/priceTemplate`); // مسیر صفحه افزودن قالب قیمتی
          }}
        >
          افزودن قالب قیمتی جدید
        </div>
      </>
    );
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

      <FormProvider
        {...{
          register,
          handleSubmit,
          control,
          setValue,
          formState: { errors },
        }}
      >
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4 p-2 md:p-4"
        >
          {/* بخش مدیریت تصاویر */}
          <div>
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

            {errors.images && (
              <p className="text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* سایر فیلدهای فرم */}
          <div>
            <label className=" block  mb-1">عنوان محصول</label>
            <input
              type="text"
              {...register("title")}
              className="react-select-container w-full border rounded px-3 py-2"
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
                    styles={theme === "dark" ? customSelectStyles : undefined}
                    components={{ MenuList: CustomMenuList }} // استفاده از MenuList سفارشی
                    value={
                      pricingTemplates?.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (
                        selectedOption &&
                        selectedOption.value === "add_new"
                      ) {
                        // عدم انتخاب گزینه افزودن در فرم
                        return;
                      }
                      field.onChange(
                        selectedOption ? selectedOption.value : ""
                      );
                    }}
                  />
                )}
              />
            )}
            {errors.pricingTemplate && (
              <p className="text-red-500">{errors.pricingTemplate.message}</p>
            )}
          </div>

          {/* //////////////////////////////////// */}
          <div>
            <label className="block mb-1">محل قرار گیری</label>
            <input
              {...register("storageLocation")}
              className="react-select-container w-full border rounded px-3 py-2"
            />
            {errors.storageLocation && (
              <p className="text-red-500">{errors.storageLocation.message}</p>
            )}
          </div>
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-2 h-10">
              <label>قابل فروش</label>
              <input
                type="checkbox"
                {...register("isSaleable")}
                className=" border rounded h-10"
              />
            </div>

            <div className="flex items-center gap-2 h-10">
              <label>قابل ادغام و تقسیم</label>
              <input
                type="checkbox"
                {...register("isMergeable")}
                className="border rounded h-10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">نام واحد</label>
            <input
              {...register("unit")}
              className="react-select-container w-full border rounded px-3 py-2"
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
      </FormProvider>
    </div>
  );
}

export default AddProduct;
