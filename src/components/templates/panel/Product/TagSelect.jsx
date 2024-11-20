import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select/creatable";
import debounce from "lodash.debounce";
import { GetAllTags, AddTagAction } from "./TagActions"; // مسیر صحیح اکشن‌ها را وارد کنید
import { Controller } from "react-hook-form";
import { useTheme } from "next-themes";
const TagSelect = ({ control, errors }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  // تابع برای فراخوانی Server Action با Debounce
  const fetchTags = useCallback(async (search) => {
    setIsLoading(true);
    try {
      const response = await GetAllTags(search);
      if (response.status === 200) {
        const tagOptions = response.tags.map((tag) => ({
          label: tag.name,
          value: tag._id,
        }));
        setOptions(tagOptions);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("خطا در دریافت تگ‌ها:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ایجاد نسخه Debounced از تابع fetchTags
  const debouncedFetchTags = useCallback(debounce(fetchTags, 300), [fetchTags]);

  // نظارت بر تغییرات inputValue و فراخوانی Debounced fetchTags
  useEffect(() => {
    if (inputValue.trim() !== "") {
      debouncedFetchTags(inputValue);
    } else {
      fetchTags(""); // در صورت پاک شدن ورودی، می‌توانید تمام گزینه‌ها را دوباره بارگذاری کنید
    }

    return () => {
      debouncedFetchTags.cancel();
    };
  }, [inputValue, debouncedFetchTags, fetchTags]);

  const handleCreate = useCallback(
    async (inputValue, onChange, value) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("name", inputValue);
        const response = await AddTagAction(formData);
        if (response.status === 201) {
          const newTag = response.tag;
          const newOption = { label: newTag.name, value: newTag.name };
          setOptions((prev) => [...prev, newOption]);
          const updatedValue = [...(value || []), newOption];
          onChange(updatedValue);
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error("خطا در ایجاد تگ جدید:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div>
      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, value, ref } }) => (
          <Select
            inputRef={ref}
            
              className={theme==="dark"?"select react-select-container ":""}    

              classNamePrefix="select react-select-container "
         
            isMulti
            options={options}
            onCreateOption={(inputVal) => handleCreate(inputVal, onChange, value)}
            onChange={(selectedOptions) => {
              onChange(selectedOptions);
            }}
            value={value || []}
            onInputChange={(val) => setInputValue(val)}
            isLoading={isLoading}
            placeholder="تگ‌ها را تایپ کنید..."
            noOptionsMessage={() =>
              isLoading ? "در حال جستجو..." : "هیچ تگی پیدا نشد"
            }
            // اگر نیاز دارید منوی Dropdown همیشه باز باشد، می‌توانید از props زیر استفاده کنید:
            // menuIsOpen={true}
          />
        )}
      />
      {errors.tags && <p className="text-red-500">{errors.tags.message}</p>}
    </div>
  );
};

export default TagSelect;
