interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}

export default function SectionCard({ label, value, onChange, placeholder, rows = 3, readOnly = false }: Props) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 transition-colors ${readOnly ? "border-gray-100" : "border-gray-200 focus-within:border-cbre-mint"}`}>
      <p className="text-xs font-semibold text-cbre-green uppercase tracking-wide mb-3">{label}</p>
      {readOnly ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[3rem]">{value || <span className="text-gray-300 italic">—</span>}</p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? ""}
          rows={rows}
          className="w-full resize-none text-sm text-gray-800 placeholder-gray-300 focus:outline-none"
        />
      )}
    </div>
  );
}
