"use client";

import React from "react";
import AsyncSelect from "react-select/async";
import { api } from "@/lib/api";

interface Option {
  value: string;
  label: string;
}

interface AsyncSelectProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string | undefined, option?: Option) => void;
  loadOptions: (inputValue: string) => Promise<Option[]>;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  defaultLabel?: string; // إضافة prop للعرض الافتراضي
}

const AsyncSelectComponent: React.FC<AsyncSelectProps> = ({
  placeholder = "ابحث...",
  value,
  onChange,
  loadOptions,
  isLoading = false,
  isDisabled = false,
  className = "",
  defaultLabel = "",
}) => {
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);

  // تحديث الخيار المحدد عند تغيير القيمة
  React.useEffect(() => {
    if (value && defaultLabel) {
      setSelectedOption({ value, label: defaultLabel });
    } else if (!value) {
      setSelectedOption(null);
    } else if (value && !defaultLabel) {
      // إذا كان هناك قيمة ولكن لا يوجد defaultLabel، حاول البحث عن الخيار
      loadOptions("").then((options) => {
        const foundOption = options.find(option => option.value === value);
        if (foundOption) {
          setSelectedOption(foundOption);
        }
      });
    }
  }, [value, defaultLabel, loadOptions]);

  const handleChange = (selectedOption: Option | null) => {
    setSelectedOption(selectedOption);
    onChange(selectedOption?.value, selectedOption || undefined);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      minHeight: "2.5rem",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      "&:focus": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f1f5f9"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#f1f5f9",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#1f2937",
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: "#6b7280",
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: "#6b7280",
    }),
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      value={selectedOption}
      placeholder={placeholder}
      isLoading={isLoading}
      isDisabled={isDisabled}
      styles={customStyles}
      className={className}
      loadingMessage={() => "جاري البحث..."}
      noOptionsMessage={() => "لا توجد نتائج"}
    />
  );
};

export default AsyncSelectComponent;
