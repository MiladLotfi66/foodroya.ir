// components/FormStep.js
import React from 'react';

const FormStep = ({ children, isActive }) => {
  return (
    <div className={isActive ? 'block' : 'hidden'}>
      {children}
    </div>
  );
};

export default FormStep;
