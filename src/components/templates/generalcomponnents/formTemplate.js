import React from 'react';

function FormTemplate({ children, BGImage }) {
  
  // بررسی وجود مقدار BGImage
  if (!BGImage) {
    console.warn("BGImage prop is not provided or is empty.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-800">
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center "
        style={{ backgroundImage: `url(${BGImage})` }}
      ></div>
      <div className="relative container ">
        {children}
      </div>
    </div>
  );
}

export default FormTemplate;
