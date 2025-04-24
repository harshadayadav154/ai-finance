"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { Checkbox } from "@/src/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/src/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { bulkDeleteTransactions } from "@/actions/account";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
    error: deleteError,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by recurring
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") {
          return transaction.isRecurring;
        }
        return !transaction.isRecurring;
      });
    }

    // Filter by type
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const handlesort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field == field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((transaction) => transaction.id)
    );
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }
    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully!");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      {/* Filters */}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">EXPENSE</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non-recurring </SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                {" "}
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border"></div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                onCheckedChange={handleSelectAll}
                checked={
                  selectedIds.length === filteredAndSortedTransactions.length &&
                  filteredAndSortedTransactions.length > 0
                }
              />
            </TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handlesort("date")}
            >
              <div className="flex items-center">
                Date{""}
                {sortConfig.field === "date" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handlesort("category")}
            >
              <div className="flex items-center">
                Category{" "}
                {sortConfig.field === "category" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handlesort("amount")}
            >
              <div className="flex items-center justify-end">
                Amount{" "}
                {sortConfig.field === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>

            <TableHead>Recurring</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                    onCheckedChange={() => handleSelect(transaction.id)}
                    checked={selectedIds.includes(transaction.id)}
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.date), "PP")}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="capitalize">
                  <span
                    style={{ background: categoryColors[transaction.category] }}
                    className="px-2 py-1 rounded text-white text-sm"
                  >
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell
                  className="text-right font-medium"
                  style={{
                    color: transaction.type === "EXPENSE" ? "red" : "green",
                  }}
                >
                  {transaction.type === "EXPENSE" ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {transaction.isRecurring ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">Next Date: </div>
                            <div>
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "PP"
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      One-time
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/transactions/create?edit=${transaction.id}`
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteFn([transaction.id])}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
