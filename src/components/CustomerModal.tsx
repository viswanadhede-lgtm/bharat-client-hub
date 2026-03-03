import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [form, setForm] = useState<CustomerData>({ name: "", phone: "", email: "", tags: "", status: "active" });

  useEffect(() => {
    if (customer) {
      setForm({
        name: String(customer.name ?? ""),
        phone: String(customer.phone ?? ""),
        email: String(customer.email ?? ""),
        tags: String(customer.tags ?? ""),
        customer_id: customer.customer_id,
        status: customer.status === "inactive" ? "inactive" : "active",
      });
    } else {
      setForm({ name: "", phone: "", email: "", tags: "", status: "active" });
    }
  }, [customer, open]);

  const handleUpdate = async () => {
    console.log("[CustomerModal] Update clicked", { isEdit, form });

    const name = String(form.name ?? "").trim();
    const phone = String(form.phone ?? "").trim();
    const email = String(form.email ?? "").trim();
    const tags = String(form.tags ?? "").trim();
    const status = form.status === "inactive" ? "inactive" : "active";

    if (!name || !phone) {
      toast.error("Name and Phone are required");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("auth_token");
    console.log("[CustomerModal] Token found:", !!token);

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
            name,
            phone,
            email,
            tags,
            status,
          }
        : {
            name,
            phone,
            email,
            tags,
          };

      console.log("[CustomerModal] Calling endpoint:", endpoint, "Body:", JSON.stringify(body));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log("[CustomerModal] Response status:", res.status);
      const data = await res.json();
      console.log("[CustomerModal] Response data:", JSON.stringify(data));

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
      console.error("[CustomerModal] Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof CustomerData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={String(form.name ?? "")} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" value={String(form.phone ?? "")} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={String(form.email ?? "")} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={String(form.tags ?? "")} onChange={(e) => update("tags", e.target.value)} placeholder="VIP, Regular" />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status || "active"} onValueChange={(v) => update("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={loading} onClick={handleUpdate}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
