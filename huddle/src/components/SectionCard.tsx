interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function SectionCard({ label, value, onChange, placeholder, readOnly }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        rows={3}
        readOnly={readOnly}
        className={`w-full resize-none text-sm text-gray-800 placeholder-gray-300 focus:outline-none ${readOnly ? "text-gray-500" : ""}`}
      />
    </div>
  );
}
