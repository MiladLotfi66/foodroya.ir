import SheildCheck from "@/module/svgs/SheildCheck";

const PermissionSVG = ({ name, permissions, Icon, onToggle }) => {
  const hasPermission = permissions.includes(name);

  return (
    <div
      className="relative h-9 w-9 lg:h-14 lg:w-14 cursor-pointer"
      onClick={() => onToggle(name)}
    >
      <div className="hidden">
        <SheildCheck />
      </div>
      <svg className="h-full w-full">
        <use href={Icon}></use>
      </svg>
      {hasPermission && (
        // <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-green-500 text-red-700">
       
        // </span>
        <svg className="absolute top-0 right-0 h-6 w-6 text-green-500 rounded-full bg-gray-300 dark:bg-zinc-600">
<use  href="#SheildCheck"></use>
</svg>
      )}
    </div>
  );
};

export default PermissionSVG;

