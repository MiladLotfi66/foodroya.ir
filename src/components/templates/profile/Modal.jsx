// Modal.js
import { useRef, useState, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import setCanvasPreview from "./setCanvasPreview";
import PencilIcon from "@/module/svgs/PencilIcon";
import CloseSvg from "@/module/svgs/CloseSvg";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const Modal = ({ imgSrc, closeModal, updateAvatar }) => {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState();
  const [error, setError] = useState("");

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const handleCrop = () => {
    if (imgRef.current && previewCanvasRef.current && crop) {
      setCanvasPreview(
        imgRef.current, // HTMLImageElement
        previewCanvasRef.current, // HTMLCanvasElement
        convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
      );
      const dataUrl = previewCanvasRef.current.toDataURL();
      updateAvatar(dataUrl);
      closeModal();
    }
  };

  return (
    <>
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
          {imgSrc && (
            <div className="flex flex-col items-center">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                circularCrop
                keepSelection
                aspect={ASPECT_RATIO}
                minWidth={MIN_DIMENSION}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Upload"
                  style={{ maxHeight: "70vh" }}
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
    </>
  );
};

export default Modal;
