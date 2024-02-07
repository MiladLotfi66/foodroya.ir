import Bars3 from "@/module/Bars3";
import SignallogoSvg from "@/module/SignallogoSvg";
import Basketsvg from "@/module/Basketsvg";
function MobileHeader() {
  return (
    <div className="flex md:hidden items-center justify-between bg-white dark:bg-zinc-700 px-4 h-16 w[90%]">
      <div className="hidden">
        <Bars3 />
        <SignallogoSvg />
        <Basketsvg />
      </div>
      <svg className="shrink-0 w-6 h-6 ">
        <use className="text-zink-700 dark:text-white" href="#Bars3"></use>
      </svg>
      <svg className="shrink-0 w-[59px] h-[59px]">
        <use className="text-orange-300" href="#signallogo"></use>
      </svg>
      <svg className="shrink-0 w-6 h-6">
        <use className="text-zink-700 dark:text-white" href="#Basketsvg"></use>
      </svg>
    </div>
  );
}

export default MobileHeader;
