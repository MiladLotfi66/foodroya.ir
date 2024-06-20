
"use client";
import React, {  useRef, useEffect } from "react";

function ThreeDotsMenu({ bannerId, menuItems, menuActions, isOpen, onClose, onToggle }) {
  const menuRef = useRef(null);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      onClose();
    }
  };

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };
    onToggle(bannerId);
  };

  const handleMenuItemClick = (action) => {
    menuActions[action](bannerId);
    console.log("tttt");
    onClose(); // Close menu after action
  };

  return (
    <div className="absolute w-[20%] h-[10%] z-[46]">
<button className="w-full h-full" onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-[50%] h-[50%] items-start text-zinc-600 dark:text-white shadowLightSvg dark:shadowDarkSvg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="transparent" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      {isOpen && (
        
        <div
        
          ref={menuRef}
className="relative group flex items-center"
      
        >
          <ul
           className="relative top-full w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 space-y-4 text-zinc-700 bg-white text-sm md:text-base border-t-[3px]
                 border-t-orange-300 rounded-xl tracking-normal shadow-normal transition-all
                  dark:text-white dark:bg-zinc-700/90 p-6 pt-[21px]"
        
          >
            {menuItems.map((item) => (
             <li
                key={item.action}
                className=" cursor-pointer "
                onClick={() => handleMenuItemClick(item.action)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ThreeDotsMenu;




// "use client";
// import React, { useState, useRef, useEffect } from "react";

// function ThreeDotsMenu({ bannerId, menuItems, menuActions }) {
//   // const [isMenuOpen , setIsMenuOpen]=useState(false)

//   const [showMenu, setShowMenu] = useState(false);
//   const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
//   const menuRef = useRef(null);


//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);


//   const handleClickOutside = (event) => {
//     if (menuRef.current && !menuRef.current.contains(event.target)) {
//       setShowMenu(false);
//     }
//   };


//   const handleClick = (event) => {
//     const rect = event.currentTarget.getBoundingClientRect();
//     const position = {
//       top: rect.bottom + window.scrollY,
//       left: rect.left + window.scrollX,
//     };
//     setShowMenu(!showMenu);
//     setMenuPosition(position);

//   };

//   const handleMenuItemClick = (action) => {
//     menuActions[action](bannerId);
//     setShowMenu(false); // Close menu after action
//   };




//   return (
//     <div className="absolute w-[20%] h-[10%] z-[46]">
//       <button className="w-full h-full" onClick={handleClick}>

//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth={1.5}
//           stroke="currentColor"
//           className="w-[50%] h-[50%] items-start text-zinc-600 dark:text-white shadowLightSvg dark:shadowDarkSvg"

//      >
//           <circle
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="1"
//             fill="transparent"
//           />
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//           />
//         </svg>
//       </button>
//       {showMenu && (
//         <div
//           ref={menuRef}
//           className="absolute bg-white shadow-lg rounded-lg w-48 z-50"
//           style={{ top: `50px`, left: `50px` }}
//         >
//           <ul>
//             {menuItems.map((item) => (
//               <li
//                 key={item.action}
//                 className="p-2 hover:bg-gray-200 cursor-pointer"
//                 onClick={() => handleMenuItemClick(item.action)}
//               >
//                 {item.label}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ThreeDotsMenu;
