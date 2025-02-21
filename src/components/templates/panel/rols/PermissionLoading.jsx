// components/AccessControl/PermissionLoading.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import FormTemplate from '@/templates/generalcomponnents/formTemplate';

const PermissionLoading = ({ BGImage }) => {
  return (
    <FormTemplate BGImage={BGImage}>
      <div className="flex flex-col items-center justify-center h-screen">
        <FaSpinner className="text-blue-500 w-12 h-12 mb-4 animate-spin" />
        <p className="text-lg ">در حال بررسی دسترسی...</p>
      </div>
    </FormTemplate>
  );
};

export default PermissionLoading;
