import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CustomerData {
  customer_id?: string;
  name: string;
  phone: string;
  email: string;
  tags?: string;
  status?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerData | null;
  onSuccess: () => void;
}

export function CustomerModal({ open, onOpenChange, customer, onSuccess }: Props) {
  const isEdit = !!customer?.customer_id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CustomerData>({ name: "", phone: "", email: "", tags: "" });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        tags: customer.tags || "",
        customer_id: customer.customer_id,
        status: customer.status,
      });
    } else {
      setForm({ name: "", phone: "", email: "", tags: "" });
    }
  }, [customer, open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }
    try {
      const endpoint = isEdit
        ? "https://dev.bharathbots.com/webhook/edit-customer"
        : "https://dev.bharathbots.com/webhook/register-customer";

      const body = isEdit
        ? {
            customer_id: form.customer_id,
            name: form.name,
            phone: form.phone,
            email: form.email,
            tags: form.tags,
          }
        : {
            name: form.name,
            phone: form.phone,
            email: form.email,
            tags: form.tags,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (!isEdit && data?.message?.toLowerCase().includes("already exists")) {
        toast.error("Customer already exists");
        setLoading(false);
        return;
      }

      toast.success(isEdit ? "Customer updated" : "Customer created");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof CustomerData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={form.tags || ""} onChange={(e) => update("tags", e.target.value)} placeholder="VIP, Regular" />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={form.status || ""} disabled className="bg-muted" />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={loading} onClick={() => handleSubmit()}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
