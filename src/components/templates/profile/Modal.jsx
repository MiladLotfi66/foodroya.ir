// Modal.js
import { useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop";
import setCanvasPreview from "./setCanvasPreview";
import "react-image-crop/dist/ReactCrop.css";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const Modal = ({ imgSrc, closeModal, updateAvatar }) => {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState(null);
  const [error, setError] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setImageDimensions({ width, height });

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      setError("ابعاد تصویر باید حداقل 150x150 پیکسل باشد.");
      return;
    }

    // ایجاد کراپ اولیه با واحد پیکسلی
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "px",
          width: Math.max(MIN_DIMENSION, width * 0.5),
        },
        ASPECT_RATIO,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleCrop = () => {
    if (imgRef.current && previewCanvasRef.current && crop) {
      const pixelCrop = convertToPixelCrop(
        crop,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight
      );


      // بررسی دوباره ابعاد کراپ شده
      if (pixelCrop.width < MIN_DIMENSION || pixelCrop.height < MIN_DIMENSION) {
        setError("ابعاد کراپ شده باید حداقل 150x150 پیکسل باشد.");
        return;
      }

      setCanvasPreview(
        imgRef.current, // HTMLImageElement
        previewCanvasRef.current, // HTMLCanvasElement
        pixelCrop
      );
      const dataUrl = previewCanvasRef.current.toDataURL();
      updateAvatar(dataUrl);
      closeModal();
    } else {
      setError("لطفاً یک بخش مناسب برای کراپ انتخاب کنید.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal} // بستن مودال با کلیک خارج از پنجره
    >
      <div
        className="bg-white rounded-lg p-4 relative"
        onClick={(e) => e.stopPropagation()} // جلوگیری از بستن مودال با کلیک داخل پنجره
      >
        <button
          aria-label="close"
          className="absolute top-2 right-2 hover:text-orange-300"
          onClick={closeModal}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {imgSrc ? (
          <div className="flex flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)} // تنظیم وضعیت کراپ با newCrop (پیکسلی)
              circularCrop
              keepSelection
              aspect={ASPECT_RATIO}
              minWidth={MIN_DIMENSION}
              minHeight={MIN_DIMENSION}
              // حذف onComplete به منظور جلوگیری از تنظیم مجدد وضعیت کراپ
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Upload"
                style={{ maxHeight: "70vh", maxWidth: "100%" }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <button
              className="text-white font-mono text-xs py-2 px-4 rounded-2xl mt-4 bg-sky-500 hover:bg-sky-600"
              onClick={handleCrop}
            >
              برش تصویر
            </button>
          </div>
        ) : (
          !error && <p className="text-center">در حال بارگزاری تصویر...</p>
        )}
        {crop && (
          <canvas
            ref={previewCanvasRef}
            className="mt-4"
            style={{
              display: "none",
              border: "1px solid black",
              objectFit: "contain",
              width: 150,
              height: 150,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Modal;
