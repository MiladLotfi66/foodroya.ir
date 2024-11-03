// FormulaBuilderModal.jsx
"use client";
import React from "react";
import FormulaBuilder from "./FormulaBuilder";

const FormulaBuilderModal = ({ isOpen, onClose, onSave, variables , formole }) => {
  if (!isOpen) return null;
console.log("formole",formole);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-300 dark:bg-zinc-600 rounded-lg p-6 w-full max-w-lg">
        <FormulaBuilder
          variables={variables}
          onSave={onSave}
          onCancel={onClose}
          formole={formole}
        />
      </div>
    </div>
  );
};

export default FormulaBuilderModal;
