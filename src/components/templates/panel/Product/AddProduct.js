"use client";
import { useForm, Controller, FormProvider } from "react-hook-form";
import TagSelect from "./TagSelect";
import Select, { components } from "react-select";
import { useTheme } from "next-themes";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ProductsSchema from "./ProductsSchema";
import { useState, useEffect, useRef } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useRouter } from "next/navigation";
import { AddProductAction, EditProductAction } from "./ProductActions";
import { v4 as uuidv4 } from "uuid";
import { GetAllPriceTemplates } from "../PriceTemplate/PriceTemplateActions";
import FeatureSelect from "./FeatureSelect";
import { customSelectStyles } from "./selectStyles";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import { NumericFormat } from 'react-number-format'; // وارد کردن NumericFormat

function AddProduct({ product = {}, onClose, refreshProducts, parentAccount }) {
  const { currentShopId, baseCurrency } = useShopInfoFromRedux();
  const ShopId = currentShopId;
  const [isSubmit, setIsSubmit] = useState(false);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const fileInputRef = useRef(null);
  const { theme } = useTheme();
  const router = useRouter();
  const [images, setImages] = useState(() => {
    if (product?.images) {
      return product.images.map((src) => ({
        id: uuidv4(),
        src,
        file: null,
        isExisting: true,
      }));
    }
    return [];
  });

  useEffect(() => {
    const fetchPricingTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await GetAllPriceTemplates(ShopId);
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
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      title: product?.title || "",
      price: product?.price || "", // اضافه کردن قیمت
      secondaryTitle: product?.secondaryTitle || "",
      pricingTemplate: product?.pricingTemplate?._id || "",
      parentAccount: parentAccount,
      tags: product?.tags
        ? product.tags.map((tag) => ({ label: tag.name, value: tag._id }))
        : [],
      storageLocation: product?.storageLocation || "",
      isSaleable: product?.isSaleable !== undefined ? product.isSaleable : true,
      isMergeable: product?.isMergeable || false,
      unit: product?.unit || "",
      description: product?.description || "",
      ShopId: ShopId || "",

      Features: product?.Features?.map((feature) => ({
        featureKey: {
          value: feature.featureKey._id,
          label: feature.featureKey.name,
        },
        value: feature.value,
        id: feature.id, // ضروری برای useFieldArray
      })),
    },
    resolver: yupResolver(ProductsSchema),
  });
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // اگر داده محصول به‌صورت ناهمزمان بارگذاری می‌شود، از useEffect برای بازنشانی فرم استفاده کنید
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        title: product.title,
        price: product.price || "", // اضافه کردن قیمت
        secondaryTitle: product.secondaryTitle,
        pricingTemplate: product.pricingTemplate?._id || "",
        parentAccount: product.parentAccount,
        tags: product.tags
          ? product.tags.map((tag) => ({ label: tag.name, value: tag._id }))
          : [],
        storageLocation: product.storageLocation,
        isSaleable: product.isSaleable,
        isMergeable: product.isMergeable,
        unit: product.unit,
        description: product.description,
        ShopId: product.ShopId,
        // ... سایر فیلدها
        Features: product.Features.map((feature) => ({
          featureKey: {
            value: feature.featureKey._id,
            label: feature.featureKey.name,
          },
          value: feature.value,
          id: feature.id,
        })),
      });
    }
  }, [product, reset]);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("لطفاً فقط فایل‌های تصویری انتخاب کنید.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: uuidv4(),
      src: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDeleteImage = (id) => {
    setImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete && !imageToDelete.isExisting) {
        URL.revokeObjectURL(imageToDelete.src);
      }
      return prev.filter((img) => img.id !== id);
    });
  };
  useEffect(() => {
    const existingImageSrcs = images
      .filter((img) => img.isExisting)
      .map((img) => img.src);
    const newImageFiles = images
      .filter((img) => !img.isExisting)
      .map((img) => img.file);
    setValue("existingImages", existingImageSrcs);
    setValue("newImages", newImageFiles);
  }, [images, setValue]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isExisting && img.src.startsWith("blob:")) {
          URL.revokeObjectURL(img.src);
        }
      });
    };
  }, [images]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await ProductsSchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();
      formDataObj.append("ShopId", formData.ShopId);

      formData.existingImages.forEach((image) => {
        formDataObj.append("existingImages", image);
      });

      formData.newImages.forEach((image) => {
        formDataObj.append("newImages", image);
      });

      formData.Features.forEach((feature, index) => {
        if (feature.featureKey) {
          formDataObj.append(
            `Features[${index}][featureKey]`,
            feature.featureKey.value
          );
          formDataObj.append(`Features[${index}][value]`, feature.value);
        }
      });

      formDataObj.append("title", formData.title);
      formDataObj.append("price", formData.price); // قیمت به صورت خام ارسال می‌شود
      formDataObj.append("pricingTemplate", formData.pricingTemplate);
      formDataObj.append("parentAccount", parentAccount);
      const tags = formData.tags?.map((tag) => tag.value).join(",");
      formDataObj.append("tags", tags);
      formDataObj.append("storageLocation", formData.storageLocation);
      formDataObj.append("isSaleable", formData.isSaleable);
      formDataObj.append("isMergeable", formData.isMergeable);
      formDataObj.append("unit", formData.unit);
      formDataObj.append("description", formData.description);

      let result;
      if (product?._id) {
        formDataObj.append("id", product._id);
        result = await EditProductAction(formDataObj, ShopId);
      } else {
        result = await AddProductAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshProducts();
        const successMessage =
          product && product._id
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
      console.error("Error handling product:", error);
      toast.error("مشکلی در پردازش محصول وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const CustomMenuList = (props) => (
    <>
      <components.MenuList {...props}>{props.children}</components.MenuList>
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          borderTop: "1px solid #ddd",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          router.push(`/${ShopId}/panel/priceTemplate`);
        }}
      >
        افزودن قالب قیمتی جدید
      </div>
    </>
  );

  return (
    <div className=" overflow-y-auto">
      <div className="hidden">
        <CloseSvg />
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-2 md:mt-4">
        <button
          aria-label="close"
          className="hover:text-orange-300"
          onClick={onClose}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>
        <h1 className="text-xl md:text-3xl font-MorabbaBold">
          {product?._id ? "ویرایش محصول" : "افزودن محصول"}
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
          className="flex flex-col gap-2 md:gap-4 p-2 md:p-4 max-h-[80vh] overflow-y-auto text-xs md:text-base"
        >
          {/* انتخاب و نمایش تصاویر */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-2 md:px-4 py-1 md:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none transition"
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
            {images.filter((img) => img.isExisting).length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold">تصاویر موجود:</h2>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {images
                    .filter((img) => img.isExisting)
                    .map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.src}
                          alt="Existing Preview"
                          className="w-full h-32 object-cover rounded"
                        />
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

            {images.filter((img) => !img.isExisting).length > 0 && (
              <div className="mt-2 md:mt-4">
                <h2 className="text-sm md:text-lg font-semibold">تصاویر جدید:</h2>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {images
                    .filter((img) => !img.isExisting)
                    .map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.src}
                          alt="New Preview"
                          className="w-full h-32 object-cover rounded"
                        />
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

            {errors.images && (
              <p className="text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* عنوان محصول */}
          <div>
            <label className="block mb-1">عنوان محصول</label>
            <input
              type="text"
              {...register("title")}
              className={`react-select-container w-full border rounded px-1 md:px-3 py-1 md:py-2 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>


          {/* قیمت محصول با فرمت سه رقم */}
          <div>
            <label className="block mb-1">قیمت محصول</label>
            <Controller
              name="price"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <div className="flex gap-1 md:gap-2 items-center text-center">
                  <NumericFormat
                    value={value}
                    onValueChange={(values) => {
                      const { value: rawValue } = values;
                      onChange(rawValue);
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    decimalScale={baseCurrency.decimalPlaces}
                    isNumericString={true}
                    className={`react-select-container w-full border rounded px-1 md:px-3 py-1 md:py-2 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  <label className="block mb-1">{baseCurrency.title}</label>
                </div>
              )}
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* دسته‌بندی کالا و تگ‌ها */}
          <div>
            <label className="block mb-1">دسته بندی کالا و تگ ها</label>
            <TagSelect control={control} setValue={setValue} errors={errors} />
          </div>

          {/* قالب قیمتی */}
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
                    components={{ MenuList: CustomMenuList }}
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

          {/* محل قرار گیری */}
          <div>
            <label className="block mb-1">محل قرار گیری</label>
            <input
              {...register("storageLocation")}
              className={`react-select-container w-full border rounded px-1 md:px-3 py-1 md:py-2 ${
                errors.storageLocation ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.storageLocation && (
              <p className="text-red-500">{errors.storageLocation.message}</p>
            )}
          </div>

          {/* موجودیت قابل فروش و قابلیت ادغام */}
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-1 md:gap-2 h-10">
              <label>قابل فروش</label>
              <input
                type="checkbox"
                {...register("isSaleable")}
                className={`border rounded h-6 w-6 ${
                  errors.isSaleable ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div className="flex items-center gap-1 md:gap-2 h-10">
              <label>قابل ادغام و تقسیم</label>
              <input
                type="checkbox"
                {...register("isMergeable")}
                className={`border rounded h-6 w-6 ${
                  errors.isMergeable ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>
          {errors.isSaleable && (
            <p className="text-red-500">{errors.isSaleable.message}</p>
          )}
          {errors.isMergeable && (
            <p className="text-red-500">{errors.isMergeable.message}</p>
          )}

          {/* نام واحد */}
          <div>
            <label className="block mb-1">نام واحد</label>
            <input
              {...register("unit")}
              className={`react-select-container w-full border rounded px-1 md:px-3 py-1 md:py-2 ${
                errors.unit ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.unit && (
              <p className="text-red-500">{errors.unit.message}</p>
            )}
          </div>

          {/* ویژگی‌ها */}
          <FeatureSelect />

          {/* توضیحات محصول */}
          <div>
            <label className="block mb-1">توضیحات</label>
            <textarea
              {...register("description")}
              className={`react-select-container w-full border rounded px-1 md:px-3 py-1 md:py-2 h-24 resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="توضیحات محصول را وارد کنید..."
            ></textarea>
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* دکمه ارسال فرم */}
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white py-1 md:py-2 px-2 md:px-4 rounded mt-4"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <HashLoader size={20} color="#fff" />
            ) : product?._id ? (
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
