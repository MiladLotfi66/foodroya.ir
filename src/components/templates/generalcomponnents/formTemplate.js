import React from 'react';

function FormTemplate({ children, BGImage }) {
  
  // بررسی وجود مقدار BGImage
  if (!BGImage) {
    console.warn("BGImage prop is not provided or is empty.");
  }

  return (
    <div className="absolute w-full h-full overflow-auto">
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${BGImage})` }}
      ></div>
      <div className="relative container">
        {children}
      </div>
    </div>
  );
}

export default FormTemplate;
