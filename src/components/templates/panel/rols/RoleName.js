
function RoleName({ name , onClickfunction}) {
  return (
    // <div  className=" rounded-full bg-opacity-50  dark:bg-opacity-50  bg-gray-300 dark:bg-black h-[6rem] w-[6rem] text-xs md:text-base md:h-32 md:w-32 flex items-center justify-center ">
      <div onClick={onClickfunction} className="flex-col items-center justify-center ">
        <p className="text-center mb-4">{name}</p>

      {/* </div> */}
    </div>
  );
}

export default RoleName;
