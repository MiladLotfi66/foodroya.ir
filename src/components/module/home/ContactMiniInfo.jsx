// src/components/module/home/ContactMiniInfo.jsx
import React from "react";
import PropTypes from "prop-types";

const ContactMiniInfo = ({ name, phone }) => {
  return (
    <div className="flex items-center mt-2">

      <div className="mr-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {name}
        </p>
        {phone && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {phone}
        </p>}
      </div>
    </div>
  );
};

ContactMiniInfo.propTypes = {
  name: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
};

export default ContactMiniInfo;
