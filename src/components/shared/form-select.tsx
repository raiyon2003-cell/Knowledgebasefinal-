"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSelectProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export function FormSelect({
  name,
  value,
  onValueChange,
  placeholder,
  children,
  required,
  disabled,
}: FormSelectProps) {
  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v || "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </>
  );
}

export { SelectItem };
