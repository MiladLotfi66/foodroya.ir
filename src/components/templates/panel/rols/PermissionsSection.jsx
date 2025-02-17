// PermissionsSection.jsx
import React from "react";
import PermissionSVG from "./PermissionSVG";

const PermissionsSection = ({ title, permissions, setPermissions, icons }) => {
  const handleTogglePermission = (name) => {
    if (permissions.includes(name)) {
      setPermissions(permissions.filter((permission) => permission !== name));
    } else {
      setPermissions([...permissions, name]);
    }
  };

  return (
    <div className="flex gap-3 text-center">
      <div className="rounded-full bg-gray-300 dark:bg-zinc-600  w-[6rem] text-sm md:text-lg md:h-32 md:w-32 flex items-center justify-center max-h-[60vh] overflow-y-auto ">
        <div className="flex items-center justify-center ">
          <p className="text-center mb-4 pt-5">{title}</p>
        </div>
      </div>
      <div className="flexCenter gap-2 md:gap-3 child-hover:text-orange-300">
        {icons.map(({ name, icon }) => (
          <PermissionSVG
            key={name}
            name={name}
            permissions={permissions}
            Icon={icon}
            onToggle={() => handleTogglePermission(name)}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionsSection;
