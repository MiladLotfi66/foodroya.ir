export const customSelectStyles  = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#4B5563' : '#52525B', // bg-gray-300 یا dark:bg-zinc-600
      borderColor: state.isFocused ? '#2563EB' : '#9CA3AF', // تغییر رنگ مرز بر اساس حالت فوکوس
      boxShadow: state.isFocused ? '0 0 0 1px #2563EB' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#2563EB' : '#9CA3AF',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1F2937', // dark:bg-zinc-600
      color: '#52525B', // dark:text-gray-300
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#2563EB'
        : state.isFocused
        ? '#4B5563'
        : 'transparent',
      color: state.isSelected ? '#FFFFFF' : '#D1D5DB',
      '&:hover': {
        backgroundColor: '#4B5563',
        color: '#D1D5DB',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1F2937', // dark:text-gray-300
    }),
  };