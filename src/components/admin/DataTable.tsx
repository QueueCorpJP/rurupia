import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Search, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export interface Column {
  key: string;
  label: string;
  accessorKey?: string;
  render?: (data: any) => React.ReactNode;
  mobileHidden?: boolean; // Whether to hide this column on mobile
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  sortOptions?: { label: string, value: string }[];
  onSearchChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
  actionMenuItems?: { label: string, onClick: (row: any) => void }[];
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
}

export function DataTable({
  columns,
  data,
  searchPlaceholder = "検索...",
  sortOptions,
  onSearchChange,
  onSortChange,
  actionMenuItems,
  onRowClick,
  isLoading = false
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Helper function to safely get cell content
  const getCellContent = (column: Column, row: any) => {
    try {
      // If column has a render function, call it with the row data
      if (column.render) {
        return column.render({ row });
      }
      
      // If using accessorKey, get the value from row using that key
      if (column.accessorKey && row) {
        return row[column.accessorKey];
      }
      
      // Fallback to using the column key
      return row ? row[column.key] : null;
    } catch (error) {
      console.error(`Error rendering cell for column ${column.key}:`, error);
      return 'Error';
    }
  };

  // Get mobile-visible columns (exclude mobileHidden columns)
  const mobileColumns = columns.filter(col => !col.mobileHidden);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9"
            value={searchTerm}
            onChange={handleSearch}
            disabled={isLoading}
          />
        </div>
        {sortOptions && (
          <Select onValueChange={onSortChange} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {actionMenuItems && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionMenuItems ? 1 : 0)} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">読み込み中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionMenuItems ? 1 : 0)} className="h-24 text-center">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={onRowClick ? () => handleRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {getCellContent(column, row)}
                    </TableCell>
                  ))}
                  {actionMenuItems && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actionMenuItems.map((item, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={() => item.onClick(row)}
                            >
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">読み込み中...</span>
              </div>
            </CardContent>
          </Card>
        ) : data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              データがありません
            </CardContent>
          </Card>
        ) : (
          data.map((row, rowIndex) => (
            <Card 
              key={rowIndex} 
              className={cn(
                "transition-colors",
                onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
              )}
              onClick={onRowClick ? () => handleRowClick(row) : undefined}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {mobileColumns.map((column) => (
                    <div key={column.key} className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.label}
                      </span>
                      <div className="text-sm">
                        {getCellContent(column, row)}
                      </div>
                    </div>
                  ))}
                  
                  {actionMenuItems && (
                    <div className="flex justify-end pt-2 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="ml-2">アクション</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actionMenuItems.map((item, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={() => item.onClick(row)}
                            >
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
