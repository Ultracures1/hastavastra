import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import type { Product } from "@/data/products";
import { adminApi } from "@/lib/api";
import { AdminPageHeader, ConfirmDelete } from "../AdminApp";
import ImageField from "../components/ImageField";

const SECTIONS = [
  { value: "bestseller-sarees", label: "Bestseller Sarees" },
  { value: "bestseller-blouses", label: "Bestseller Blouses" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "ready-to-wear", label: "Ready to Wear" },
];

const CATEGORIES = ["saree", "blouse", "dress", "kurta", "lehenga", "ready-to-wear"];
const BADGES = ["BESTSELLER", "TOP_RATED", "NEW"];

interface FormState {
  name: string;
  type: string;
  price: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  badge: string;
  image: string;
  category: string;
  sizes: string;
  hasBlousePiece: boolean;
  section: string;
  sortOrder: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  type: "",
  price: "",
  originalPrice: "",
  rating: "5",
  reviews: "0",
  badge: "none",
  image: "",
  category: "saree",
  sizes: "",
  hasBlousePiece: false,
  section: "bestseller-sarees",
  sortOrder: "0",
  active: true,
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    type: p.type,
    price: String(p.price),
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    rating: String(p.rating),
    reviews: String(p.reviews),
    badge: p.badge || "none",
    image: p.image,
    category: p.category,
    sizes: p.sizes?.join(", ") || "",
    hasBlousePiece: !!p.hasBlousePiece,
    section: p.section || "bestseller-sarees",
    sortOrder: String(p.sortOrder ?? 0),
    active: p.active !== false,
  };
}

function toPayload(f: FormState): Partial<Product> {
  return {
    name: f.name,
    type: f.type,
    price: Number(f.price),
    originalPrice: f.originalPrice ? Number(f.originalPrice) : undefined,
    rating: Number(f.rating),
    reviews: Number(f.reviews),
    badge: f.badge === "none" ? undefined : (f.badge as Product["badge"]),
    image: f.image,
    category: f.category as Product["category"],
    sizes: f.sizes
      ? f.sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
    hasBlousePiece: f.hasBlousePiece,
    section: f.section,
    sortOrder: Number(f.sortOrder) || 0,
    active: f.active,
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi
      .getProducts()
      .then(setProducts)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(toForm(p));
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.price || Number.isNaN(Number(form.price)))
      return toast.error("Price must be a number");
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        toast.success("Product updated");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Product created");
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
      await adminApi.deleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Products shown in the homepage sections"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1" /> Add product
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
              <TableHead>Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <img
                    src={p.image}
                    alt=""
                    className="w-10 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.type}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {SECTIONS.find((s) => s.value === p.section)?.label || p.section}
                </TableCell>
                <TableCell>₹{p.price.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  {p.badge ? (
                    <Badge variant="secondary">{p.badge.replace("_", " ")}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {p.active !== false ? (
                    <Badge>Live</Badge>
                  ) : (
                    <Badge variant="outline">Hidden</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <ConfirmDelete what={`"${p.name}"`} onConfirm={() => remove(p.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                value={form.type}
                placeholder="e.g. Saree with blouse piece"
                onChange={(e) => set({ type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Original price (₹, for showing a discount)</Label>
              <Input
                type="number"
                value={form.originalPrice}
                onChange={(e) => set({ originalPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Homepage section</Label>
              <Select value={form.section} onValueChange={(v) => set({ section: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set({ category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Badge</Label>
              <Select value={form.badge} onValueChange={(v) => set({ badge: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {BADGES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sizes (comma separated, optional)</Label>
              <Input
                value={form.sizes}
                placeholder="XS, S, M, L, XL"
                onChange={(e) => set({ sizes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => set({ rating: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Number of reviews</Label>
              <Input
                type="number"
                value={form.reviews}
                onChange={(e) => set({ reviews: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort order (lower shows first)</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set({ sortOrder: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.hasBlousePiece}
                  onCheckedChange={(v) => set({ hasBlousePiece: v })}
                />
                Has blouse piece
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => set({ active: v })}
                />
                Visible on site
              </label>
            </div>
            <div className="md:col-span-2">
              <ImageField
                label="Product image"
                value={form.image}
                onChange={(url) => set({ image: url })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
