import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ShopSchema from "@/templates/Shop/ShopSchema";
import { useEffect, useState, useRef } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg";
import Image from "next/image";
import CloseSvg from "@/module/svgs/CloseSvg";
// import { DevTool } from "@hookform/devtools";
import { AddShopServerAction, EditShop } from "@/templates/Shop/ShopServerActions";

function AddShop({ Shop = {}, onClose, refreshShops }) {

  const [isSubmit, setIsSubmit] = useState(false);
  const initialShopUniqueName = useRef(Shop?.ShopUniqueName || "");

  const [selectedLogoImage, setSelectedLogoImage] = useState(
    Shop?.LogoUrl || null
  );
  const [selectedTextLogoImage, setSelectedTextLogoImage] = useState(
    Shop?.TextLogoUrl || null
  );
  const [selectedBackGroundShopImage, setSelectedBackGroundShopImage] =
    useState(Shop?.BackGroundShopUrl || null);
  const [selectedBackGroundpanelImage, setSelectedBackGroundpanelImage] =
    useState(Shop?.BackGroundpanelUrl || null);

  /////////////////////react hook form////////////////////////////
// در کامپوننت AddShop.js
const {
  register,
  watch,
  handleSubmit,
  setValue,
  setError,
  formState: { errors },
  reset,
} = useForm({
  mode: "all",
  defaultValues: {
    ShopUniqueName: Shop?.ShopUniqueName || "",
    ShopName: Shop?.ShopName || "",
    ShopSmallDiscription: Shop?.ShopSmallDiscription || "",
    ShopAddress: Shop?.ShopAddress || "",
    ShopDiscription: Shop?.ShopDiscription || "",
    Logo: null,
    TextLogo: null,
    BackGroundShop: null,
    BackGroundpanel: null,
    ShopPhone: Shop?.ShopPhone || "",
    ShopMobile: Shop?.ShopMobile || "",
    ShopStatus: Shop?.ShopStatus !== undefined ? Shop?.ShopStatus : true,
    currentShopId: Shop?._id || null, // اضافه کردن currentShopId
  },
  resolver: yupResolver(ShopSchema), // حذف context از resolver
});
  
  /////////////////////useEffect////////////////////////////
  useEffect(() => {
    reset({
      ShopUniqueName: Shop?.ShopUniqueName || "",
      ShopName: Shop?.ShopName || "",
      ShopSmallDiscription: Shop?.ShopSmallDiscription || "",
      ShopAddress: Shop?.ShopAddress || "",
      ShopDiscription: Shop?.ShopDiscription || "",
      Logo: null,
      TextLogo: null,
      BackGroundShop: null,
      BackGroundpanel: null,
      ShopPhone: Shop?.ShopPhone || "",
      ShopMobile: Shop?.ShopMobile || "",
      ShopStatus: Shop?.ShopStatus !== undefined ? Shop?.ShopStatus : true,
    });
  }, [Shop, reset]);

  useEffect(() => {
    if (Shop?.LogoUrl) {
      setSelectedLogoImage(Shop.LogoUrl);
      setValue("Logo", Shop.LogoUrl);
    }
    if (Shop?.TextLogoUrl) {
      setSelectedTextLogoImage(Shop.TextLogoUrl);
      setValue("TextLogo", Shop.TextLogoUrl);
    }
    if (Shop?.BackGroundShopUrl) {
      setSelectedBackGroundShopImage(Shop.BackGroundShopUrl);
      setValue("BackGroundShop", Shop.BackGroundShopUrl);
    }
    if (Shop?.BackGroundpanelUrl) {
      setSelectedBackGroundpanelImage(Shop.BackGroundpanelUrl);
      setValue("BackGroundpanel", Shop.BackGroundpanelUrl);
    }
  }, [Shop, setValue]);

  /////////////////////handle image changes////////////////////////////
  const handleLogoImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogoImage(URL.createObjectURL(e.target.files[0]));
      setValue("Logo", e.target.files[0]);
    }
  };

  const handleTextLogoImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedTextLogoImage(URL.createObjectURL(e.target.files[0]));
      setValue("TextLogo", e.target.files[0]);
    }
  };

  const handleBackGroundShopImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedBackGroundShopImage(URL.createObjectURL(e.target.files[0]));
      setValue("BackGroundShop", e.target.files[0]);
    }
  };

  const handleBackGroundpanelImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedBackGroundpanelImage(URL.createObjectURL(e.target.files[0]));
      setValue("BackGroundpanel", e.target.files[0]);
    }
  };

  /////////////////////handle form submit////////////////////////////

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      const formDataObj = new FormData();

      if (Shop?.LogoUrl && typeof formData.Logo === "string") {
        formDataObj.append("Logo", Shop.LogoUrl);
      } else if (formData.Logo) {
        formDataObj.append("Logo", formData.Logo);
      }

      if (Shop?.TextLogoUrl && typeof formData.TextLogo === "string") {
        formDataObj.append("TextLogo", Shop.TextLogoUrl);
      } else if (formData.TextLogo) {
        formDataObj.append("TextLogo", formData.TextLogo);
      }

      if (Shop?.BackGroundShopUrl && typeof formData.BackGroundShop === "string") {
        formDataObj.append("BackGroundShop", Shop.BackGroundShopUrl);
      } else if (formData.BackGroundShop) {
        formDataObj.append("BackGroundShop", formData.BackGroundShop);
      }

      if (Shop?.BackGroundpanelUrl && typeof formData.BackGroundpanel === "string") {
        formDataObj.append("BackGroundpanel", Shop.BackGroundpanelUrl);
      } else if (formData.BackGroundpanel) {
        formDataObj.append("BackGroundpanel", formData.BackGroundpanel);
      }

      formDataObj.append("ShopUniqueName", formData.ShopUniqueName);
      formDataObj.append("ShopName", formData.ShopName);
      formDataObj.append("ShopSmallDiscription", formData.ShopSmallDiscription);
      formDataObj.append("ShopDiscription", formData.ShopDiscription);
      formDataObj.append("ShopAddress", formData.ShopAddress);
      formDataObj.append("ShopStatus", formData.ShopStatus);
      formDataObj.append("ShopPhone", formData.ShopPhone);
      formDataObj.append("ShopMobile", formData.ShopMobile);

      let res;
      if (Shop?._id) {
        formDataObj.append("id", Shop._id);
        formDataObj.append("currentShopId", Shop._id); // ارسال currentShopId معتبر

        res = await EditShop(formDataObj);
      } else {
        res = await AddShopServerAction(formDataObj);
      }

      if (res.status === 200 || res.status === 201) {
        refreshShops();
        onClose();
        toast.success(Shop?._id ? "فروشگاه با موفقیت ویرایش شد" : "فروشگاه با موفقیت اضافه شد");
      } else {
        toast.error(res.error || "خطایی رخ داده است");
      }
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast.error(error.message || "خطایی در ارسال درخواست به سرور رخ داد");
    }
    setIsSubmit(false);
  };

  /////////////////////formsubmitting////////////////////////////

  const formsubmitting = async (formData) => {
    await handleFormSubmit(formData);
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        <CloseSvg />
      </div>
      {/* /////////////////////title//////////////////////////// */}

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button aria-label="close" className="hover:text-orange-300">
          <svg
            width="34"
            height="34"
            onClick={onClose} // بستن مودال در کلیک
          >
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {Shop?._id ? "ویرایش فروشگاه" : "افزودن فروشگاه"}
        </h1>
      </div>
      {/* /////////////////////form//////////////////////////// */}

      <form
        onSubmit={handleSubmit(formsubmitting)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* /////////////////////ShopStatus//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopStatus" className="w-1/5 text-xs md:text-sm">
            وضعیت فروشگاه
          </label>
          <input
            className="inputStyle w-1/5"
            type="checkbox"
            name="ShopStatus"
            id="ShopStatus"
            {...register("ShopStatus")}
          />
        </div>
        {/* ///////////////////////////////////// */}
        <input type="hidden" {...register('currentShopId')} />

        {/* /////////////////////ShopUniqueName//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopUniqueName" className="w-1/5 text-xs md:text-sm">
            شناسه فروشگاه
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopUniqueName"
            id="ShopUniqueName"
            {...register("ShopUniqueName")}
          />
        </div>
        {errors.ShopUniqueName && (
          <div className="text-xs text-red-400">{errors.ShopUniqueName.message}</div>
        )}
        {/* /////////////////////ShopName//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopName" className="w-1/5 text-xs md:text-sm">
            عنوان فروشگاه
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopName"
            id="ShopName"
            {...register("ShopName")}
          />
        </div>
        {errors.ShopName && (
          <div className="text-xs text-red-400">{errors.ShopName.message}</div>
        )}
        {/* /////////////////////ShopSmallDiscription//////////////////////////// */}
        <div className="flex items-center">
          <label
            htmlFor="ShopSmallDiscription"
            className="w-1/5 text-xs md:text-sm"
          >
            توضیح مختصر
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopSmallDiscription"
            id="ShopSmallDiscription"
            {...register("ShopSmallDiscription")}
          />
        </div>
        {errors.ShopSmallDiscription && (
          <div className="text-xs text-red-400">
            {errors.ShopSmallDiscription.message}
          </div>
        )}
        {/* /////////////////////ShopDiscription//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopDiscription" className="w-1/5 text-xs md:text-sm">
            توضیحات فروشگاه
          </label>
          <textarea
            className="textAriaStyle grow w-4/5"
            name="ShopDiscription"
            id="ShopDiscription"
            {...register("ShopDiscription")}
          />
        </div>
        {errors.ShopDiscription && (
          <div className="text-xs text-red-400">
            {errors.ShopDiscription.message}
          </div>
        )}
        {/* /////////////////////ShopAddress//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopAddress" className="w-1/5 text-xs md:text-sm">
            آدرس فروشگاه
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopAddress"
            id="ShopAddress"
            {...register("ShopAddress")}
          />
        </div>
        {errors.ShopAddress && (
          <div className="text-xs text-red-400">
            {errors.ShopAddress.message}
          </div>
        )}
        {/* /////////////////////ShopPhone//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopPhone" className="w-1/5 text-xs md:text-sm">
            تلفن فروشگاه
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopPhone"
            id="ShopPhone"
            {...register("ShopPhone")}
          />
        </div>
        {errors.ShopPhone && (
          <div className="text-xs text-red-400">{errors.ShopPhone.message}</div>
        )}{" "}
        {/* /////////////////////ShopMobile//////////////////////////// */}
        <div className="flex items-center">
          <label htmlFor="ShopMobile" className="w-1/5 text-xs md:text-sm">
            تلفن همراه فروشگاه
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="ShopMobile"
            id="ShopMobile"
            {...register("ShopMobile")}
          />
        </div>
        {errors.ShopMobile && (
          <div className="text-xs text-red-400">
            {errors.ShopMobile.message}
          </div>
        )}
        {/* /////////////////////Logo//////////////////////////// */}
        <div className="flex items-center">
          <div className="w-1/2">
            {selectedLogoImage ? (
              <Image
                onClick={() => document.getElementById("Logo").click()} // تغییر id به Logo
                src={selectedLogoImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="Logo" // تغییر htmlFor به Logo
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب لوگو</span>
              </label>
            )}
            <input
              className="hidden"
              id="Logo" // تغییر id به Logo
              type="file"
              name="Logo" // تغییر name به Logo
              accept="image/*"
              onChange={handleLogoImageChange}
            />
            {errors.Logo && (
              <div className="text-xs text-red-400">{errors.Logo.message}</div>
            )}
          </div>
          {/* /////////////////////TextLogo//////////////////////////// */}

          <div className="w-1/2">
            {selectedTextLogoImage ? (
              <Image
                onClick={() => document.getElementById("TextLogo").click()} // تغییر id به TextLogo
                src={selectedTextLogoImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="TextLogo" // تغییر htmlFor به TextLogo
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب لوگو متنی</span>
              </label>
            )}
            <input
              className="hidden"
              id="TextLogo" // تغییر id به TextLogo
              type="file"
              name="TextLogo" // تغییر name به TextLogo
              accept="image/*"
              onChange={handleTextLogoImageChange}
            />
            {errors.TextLogo && (
              <div className="text-xs text-red-400">
                {errors.TextLogo.message}
              </div>
            )}
          </div>
        </div>
        {/* /////////////////////background//////////////////////////// */}
        <div className="flex items-center">
          <div className="w-1/2">
            {selectedBackGroundShopImage ? (
              <Image
                onClick={() => document.getElementById("BackGroundShop").click()} // تغییر id به BackGroundShop
                src={selectedBackGroundShopImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="BackGroundShop" // تغییر htmlFor به BackGroundShop
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب تصویر زمینه فروشگاه</span>
              </label>
            )}
            <input
              className="hidden"
              id="BackGroundShop" // تغییر id به BackGroundShop
              type="file"
              name="BackGroundShop" // تغییر name به BackGroundShop
              accept="image/*"
              onChange={handleBackGroundShopImageChange}
            />
            {errors.BackGroundShop && (
              <div className="text-xs text-red-400">{errors.BackGroundShop.message}</div>
            )}
          </div>
          {/* /////////////////////BackGroundpanel//////////////////////////// */}

          <div className="w-1/2">
            {selectedBackGroundpanelImage ? (
              <Image
                onClick={() => document.getElementById("BackGroundpanel").click()} // تغییر id به BackGroundpanel
                src={selectedBackGroundpanelImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="BackGroundpanel" // تغییر htmlFor به BackGroundpanel
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب تصویر زمینه پنل مدیریتی</span>
              </label>
            )}
            <input
              className="hidden"
              id="BackGroundpanel" // تغییر id به BackGroundpanel
              type="file"
              name="BackGroundpanel" // تغییر name به BackGroundpanel
              accept="image/*"
              onChange={handleBackGroundpanelImageChange}
            />
            {errors.BackGroundpanel && (
              <div className="text-xs text-red-400">
                {errors.BackGroundpanel.message}
              </div>
            )}
          </div>
        </div>
        {/* /////////////////////button//////////////////////////// */}
        <button
          type="submit"
          className={
            isSubmit
              ? "flexCenter gap-x-2 h-11 md:h-14 bg-gray-400 rounded-xl text-white mt-4"
              : "flexCenter h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4"
          }
          disabled={isSubmit}
        >
          {isSubmit ? "در حال ثبت" : "ثبت"}
          {isSubmit ? <HashLoader size={25} color="#fff" /> : ""}
        </button>
        {/* <DevTool control={control} /> */}
        <Toaster />
      </form>
    </div>
  );
}

export default AddShop;
