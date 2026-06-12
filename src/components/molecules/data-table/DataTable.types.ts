export interface ColumnDef<T> {
  /** Unique key for the column, usually mapping to data property */
  key: keyof T | string;
  /** Header label */
  header: React.ReactNode;
  /** Custom render function for the cell */
  render?: (row: T, index?: number) => React.ReactNode;
  /** Custom class for the column */
  className?: string;
  /** Optional fixed width */
  width?: string | number;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Array of data objects */
  data: T[];
  /** Loading state */
  isLoading?: boolean;
  /** Message to display when empty */
  emptyMessage?: string;
  /** Optional callback when a row is clicked */
  onRowClick?: (row: T) => void;
  className?: string;
}
