export default function KpiCard({ title, value, format }) {
  const mostrarValor =
    value === null || value === undefined
      ? 0
      : format === "decimal"
      ? Number(value).toFixed(2)
      : value;

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">
        {mostrarValor}
      </p>
    </div>
  );
}
