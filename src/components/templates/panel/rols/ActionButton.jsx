// components/ActionButton.jsx
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ActionButton = forwardRef(({ onClick, Icon, label, className = '' }, ref) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-2 rounded-full transition-colors hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      aria-label={label}
      title={label}
      ref={ref} // انتقال ref به عنصر DOM
    >
      <Icon className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );
});

// اضافه کردن PropTypes برای اطمینان از نوع props
ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

// تعیین مقدار پیش‌فرض برای props
ActionButton.defaultProps = {
  className: '',
};

export default ActionButton;
