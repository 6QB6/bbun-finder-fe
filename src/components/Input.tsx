interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

function Input({
  value,
  onChange,
  label,
  placeholder = "Enter text",
  disabled = false,
  maxLength,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[16px] font-bold">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-4 py-2
          border 
          text-[14px]
          font-bold
          rounded-lg
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
          transition
          ${disabled ? "border-[#8D8D8D] bg-[#EDEDED] cursor-not-allowed opacity-70" : "border-[#9EB6FF] bg-white"}`}
      />
    </div>
  );
}

export default Input;
