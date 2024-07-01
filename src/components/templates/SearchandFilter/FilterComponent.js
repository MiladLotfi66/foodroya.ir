"use client";
import { useState } from 'react';

const FilterComponent = ({ filters, onFilter }) => {
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div>
      {filters.map((filter) => (
        <div key={filter.key}>
          <label>{filter.label}</label>
          <select onChange={(e) => handleFilterChange(filter.key, e.target.value)}>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterComponent;

