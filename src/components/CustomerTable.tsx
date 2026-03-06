import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface Customer {
  customer_id: string;
  branch_id?: string;
  name: string;
  phone: string;
  email: string;
  tags?: string;
  status: string;
  total_visits?: number;
  total_spent?: number;
  last_visit?: string;
  created_at?: string;
}

interface Props {
  customers: Customer[];
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

export function CustomerTable({ customers, onEdit, onDelete }: Props) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-foreground">No customers found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Tags</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Visits</TableHead>
            <TableHead className="font-semibold text-right">Spent</TableHead>
            <TableHead className="font-semibold">Last Visit</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.customer_id} className="group">
              <TableCell>
                <Link
                  to={`/customers/${c.customer_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {c.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.phone}</TableCell>
              <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{c.tags || "—"}</TableCell>
              <TableCell><StatusBadge status={c.status} /></TableCell>
              <TableCell className="text-right">{c.total_visits ?? 0}</TableCell>
              <TableCell className="text-right">₹{c.total_spent ?? 0}</TableCell>
              <TableCell className="text-muted-foreground">{c.last_visit || "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(c)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
