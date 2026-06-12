import { useEffect, useState } from "react";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi, type Testimonial } from "@/lib/api";
import { AdminPageHeader, ConfirmDelete } from "../AdminApp";
import ImageField from "../components/ImageField";

interface FormState {
  text: string;
  customer: string;
  date: string;
  product: string;
  rating: string;
  image: string;
  sortOrder: string;
  active: boolean;
}

const emptyForm: FormState = {
  text: "",
  customer: "",
  date: "",
  product: "",
  rating: "5",
  image: "",
  sortOrder: "0",
  active: true,
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi
      .getTestimonials()
      .then(setItems)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      text: t.text,
      customer: t.customer,
      date: t.date,
      product: t.product,
      rating: String(t.rating),
      image: t.image,
      sortOrder: String(t.sortOrder),
      active: t.active,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.text.trim()) return toast.error("Testimonial text is required");
    setSaving(true);
    try {
      const payload = {
        text: form.text,
        customer: form.customer,
        date: form.date,
        product: form.product,
        rating: Number(form.rating) || 5,
        image: form.image,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };
      if (editingId) {
        await adminApi.updateTestimonial(editingId, payload);
        toast.success("Testimonial updated");
      } else {
        await adminApi.createTestimonial(payload);
        toast.success("Testimonial created");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.deleteTestimonial(id);
      toast.success("Testimonial deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Customer testimonials carousel on the homepage"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1" /> Add testimonial
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Text</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <img
                    src={t.image}
                    alt=""
                    className="w-10 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate text-sm">{t.text}</p>
                  <p className="text-xs text-muted-foreground">{t.product}</p>
                </TableCell>
                <TableCell className="text-sm">{t.customer}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    {t.rating} <Star size={12} className="fill-ochre text-ochre" />
                  </span>
                </TableCell>
                <TableCell>
                  {t.active ? <Badge>Live</Badge> : <Badge variant="outline">Hidden</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <ConfirmDelete
                    what={`testimonial by "${t.customer || "customer"}"`}
                    onConfirm={() => remove(t.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit testimonial" : "Add testimonial"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text *</Label>
              <Textarea
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer name</Label>
                <Input
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date (free text)</Label>
                <Input
                  value={form.date}
                  placeholder="e.g. 12 June 2026"
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Product name</Label>
                <Input
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={form.rating}
                  onValueChange={(v) => setForm({ ...form, rating: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["5", "4", "3", "2", "1"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r} star{r !== "1" ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm pt-6">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                Visible on site
              </label>
            </div>
            <ImageField
              label="Image"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
