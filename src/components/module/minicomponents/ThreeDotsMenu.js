"use client";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsRightMenuOpen,
  selectRightMenuPosition,
  selectRightMenuItemId,
  selectMenuItems,
  closeRightMenu
} from "src/Redux/features/mobileMenu/mobileMenuSlice";
import { ProductDeleteItem,ProductEditItem,ProductSendItem } from "@/components/signinAndLogin/Actions/MenuServerActions";

function ThreeDotsMenu() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsRightMenuOpen);
  const position = useSelector(selectRightMenuPosition);
  const menuItems = useSelector(selectMenuItems);
  const itemId = useSelector(selectRightMenuItemId);

  const handleMenuClose = () => {
    dispatch(closeRightMenu());
  };

  const handleMenuItemClick = async (action) => {
    if (action === "edit") {
      await ProductEditItem(itemId);
    } else if (action === "delete") {
      await ProductDeleteItem(itemId);
    } else if (action === "send") {
      await ProductSendItem(itemId);
    }
    handleMenuClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute w-[20%] h-[10%] z-[46]"
      style={{ top: position.top, left: position.left }}
    >
      <div className="relative group flex items-center">
        <ul className="relative top-full w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 space-y-4 text-zinc-700 bg-white text-sm md:text-base border-t-[3px] border-t-orange-300 rounded-xl tracking-normal shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 p-6 pt-[21px]">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => handleMenuItemClick(item.action)}            >
              {item.label}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ThreeDotsMenu;
