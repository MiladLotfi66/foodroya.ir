// components/FallbackImage.js
import { useState } from 'react';
import Image from 'next/image';

const FallbackImage = ({ src, alt, width, height, className, quality = 60 , placeholder}) => {
  const [imgSrc, setImgSrc] = useState(src || placeholder);
console.log("product_placeholder",placeholder);

  const handleError = () => {
    setImgSrc(placeholder);
  };

  return (
    <Image
      className={className}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      onError={handleError}
    />
  );
};

export default FallbackImage;
