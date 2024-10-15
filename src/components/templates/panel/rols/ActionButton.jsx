// components/ActionButton.jsx
import React from 'react';
import PropTypes from 'prop-types';

function ActionButton({ onClick, Icon, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-2 rounded-full transition-colors hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );
}

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ActionButton;
