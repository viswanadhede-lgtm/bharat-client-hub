import { useState, useEffect, useCallback } from "react";
import { apiPost } from "@/utils/apiClient";
import { CustomerTable, Customer } from "@/components/CustomerTable";
import { CustomerModal } from "@/components/CustomerModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PaginationControls } from "@/components/PaginationControls";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("https://dev.bharathbots.com/webhook/get-customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status === "all" ? undefined : status,
          search: search || undefined,
          page,
          limit,
        }),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (data?.success !== undefined) {
        setCustomers(data.data || []);
        setTotalPages(data.total_pages || 1);
      } else {
        setCustomers(data.customers || data.data || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEdit = (c: Customer) => {
    setEditCustomer(c);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditCustomer(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiPost("/webhook/delete-customer", {
        customer_id: deleteTarget.customer_id,
      });
      toast.success("Customer deleted");
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your salon customers</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : (
          <>
            <CustomerTable
              customers={customers}
              onEdit={handleEdit}
              onDelete={(c) => setDeleteTarget(c)}
            />
            <div className="px-6 pb-4">
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customer={editCustomer}
        onSuccess={fetchCustomers}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action will soft-delete the customer.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
