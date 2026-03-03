import { useAuth } from "@/contexts/AuthContext";
import { Users, Calendar, TrendingUp, Scissors } from "lucide-react";

const stats = [
  { label: "Total Customers", value: "—", icon: Users },
  { label: "Bookings Today", value: "—", icon: Calendar },
  { label: "Revenue", value: "—", icon: TrendingUp },
  { label: "Services", value: "—", icon: Scissors },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Branch: {user?.branch_id}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 glass-card p-8 text-center">
        <p className="text-muted-foreground">
          Booking engine and analytics coming soon.
        </p>
      </div>
    </div>
  );
}
