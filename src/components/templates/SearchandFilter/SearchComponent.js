"use client";
import { useState } from "react";
import SearchSvg from "@/module/svgs/SearchSvg";

const SearchComponent = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className=" flex items-center">
      <input
        className="inputStyle grow "
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "جستجو..."}
      />
      <button onClick={handleSearch}
      className="h-auto bg-teal-600 rounded-md hover:bg-teal-700 text-white  p-3"
      >
        <SearchSvg/>
      </button>
    </div>
  );
};

export default SearchComponent;
