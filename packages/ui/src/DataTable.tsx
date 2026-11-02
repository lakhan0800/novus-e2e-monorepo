import type { ReactNode } from "react";

export interface Column<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
}

interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  emptyText?: string;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  emptyText = "Nothing here yet.",
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <p className="fn-muted">{emptyText}</p>;
  }
  return (
    <table className="fn-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
