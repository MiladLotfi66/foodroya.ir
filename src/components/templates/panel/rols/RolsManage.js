import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import RoleName from "@/templates/generalcomponnents/RoleName";
function RolsManage() {
  return (
    <FormTemplate>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت نقش ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
            // onClick={handleAddShopClick}
          >
            افزودن نقش
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-8 p-4 pb-16 justify-items-center">
          <RoleName name="کاربر عادی" />
          <RoleName name="همکار" />
          <RoleName name="مدیر" />
          <RoleName name="حسابدار" />
        </div>
      </div>
    </FormTemplate>
  );
}

export default RolsManage;
