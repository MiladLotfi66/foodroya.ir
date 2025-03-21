// FormulaBuilderModal.jsx
"use client";
import React from "react";
import FormulaBuilder from "./FormulaBuilder";

const FormulaBuilderModal = ({ isOpen, onClose, onSave, variables , formole ,ShopId}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-300 dark:bg-zinc-600 rounded-lg p-6 w-full max-w-lg">
        <FormulaBuilder
          variables={variables}
          onSave={onSave}
          onCancel={onClose}
          formole={formole}
          ShopId={ShopId} // اضافه کردن ShopId

        />
      </div>
    </div>
  );
};

export default FormulaBuilderModal;
