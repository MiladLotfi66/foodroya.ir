// src/components/UserInfo/UserInfo.jsx
import React from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import usericone from "@/public/Images/jpg/user.webp";


const UserMiniInfo = ({ userImage, name, username }) => {
  
  return (
    <div className="flex items-center mt-2">
      <Image
        className="rounded-full"
        src={userImage|| usericone}
        alt={`${name} تصویر`}
        width={40}
        height={40}
        quality={60}
      />
      <div className="mr-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {name}
        </p>
        {username && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          @{username}
        </p>}
        
      </div>
    </div>
  );
};

UserMiniInfo.propTypes = {
  userImage: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default UserMiniInfo;
