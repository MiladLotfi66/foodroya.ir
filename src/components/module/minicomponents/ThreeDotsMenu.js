"use client";
import { useDispatch } from "react-redux";
import { openRightMenu } from "src/Redux/features/mobileMenu/mobileMenuSlice";

function ThreeDotsMenu({ id }) {
  const dispatch = useDispatch();


  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
    };
    console.log(`top ${position.top} --- left: ${position.left}`);
    dispatch(openRightMenu({ id, position }));
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
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
    </div>
  );
}

export default ThreeDotsMenu;
