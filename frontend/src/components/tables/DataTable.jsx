import EmptyState from '../common/EmptyState';

export default function DataTable({ columns, rows, keyField = 'id', emptyTitle, emptyDescription }) {
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {rows.map((row) => (
            <tr key={row[keyField]} className="transition hover:bg-zinc-50/80">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 align-top text-sm text-zinc-700">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
