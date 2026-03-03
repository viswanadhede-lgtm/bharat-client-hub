import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiPost } from "@/utils/apiClient";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail, Tag, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/components/CustomerTable";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiPost("/webhook/get-customers", {
          search: id,
          page: 1,
          limit: 1,
        });
        const list = res.customers || res.data || [];
        const found = list.find((c: Customer) => c.customer_id === id) || list[0];
        setCustomer(found || null);
      } catch (err: any) {
        toast.error(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 lg:p-8">
        <Link to="/customers" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <p className="text-muted-foreground">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <Link to="/customers" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      {/* Profile Card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-semibold">{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {customer.email}
                </div>
              )}
              {customer.tags && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> {customer.tags}
                </div>
              )}
              {customer.created_at && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Joined {customer.created_at}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold">{customer.total_visits ?? 0}</p>
              <p className="text-xs text-muted-foreground">Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">₹{customer.total_spent ?? 0}</p>
              <p className="text-xs text-muted-foreground">Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="glass-card p-8 text-center mt-4">
          <p className="text-muted-foreground">Booking history will appear here once the booking engine is integrated.</p>
        </TabsContent>
        <TabsContent value="memberships" className="glass-card p-8 text-center mt-4">
          <p className="text-muted-foreground">Membership details coming soon.</p>
        </TabsContent>
        <TabsContent value="badges" className="glass-card p-8 text-center mt-4">
          <p className="text-muted-foreground">Customer badges coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
