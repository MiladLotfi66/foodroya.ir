"use client";
import { useDispatch, useSelector } from "react-redux";
import { closeRightMenu, selectIsRightMenuOpen, selectRightMenuPosition } from "src/Redux/features/mobileMenu/mobileMenuSlice";

function ComponentMenu() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsRightMenuOpen);
  const position = useSelector(selectRightMenuPosition);
  console.log(position);

  const handleClose = () => {
    dispatch(closeRightMenu());
  };

  const handleEdit = () => {
    console.log('Edit action');
    handleClose();
  };

  const handleDelete = () => {
    console.log('Delete action');
    handleClose();
  };

  const handleSend = () => {
    console.log('Send action');
    handleClose();
  };

  return (
    isOpen && (
      <div>
        <div
          className="absolute bg-white dark:bg-zinc-700 z-50 shadow-lg rounded-lg w-[48]"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          <ul>
            <li
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={handleEdit}
            >
              ویرایش
            </li>
            <li
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={handleDelete}
            >
              حذف
            </li>
            <li
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={handleSend}
            >
              ارسال
            </li>
          </ul>
        </div>
        <div
          onClick={handleClose}
          className="overlay fixed inset-0 w-full h-full bg-black/40 z-[49]"
        ></div>
      </div>
    )
  );
}

export default ComponentMenu;
