import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from "react-router";
import type { ReactNode } from "react";
import {
  Package,
  LayoutGrid,
  MessageSquareQuote,
  PanelsTopLeft,
  KeyRound,
  LogOut,
  Store,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { getToken, setToken } from "@/lib/api";
import LoginPage from "./LoginPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContentPage from "./pages/ContentPage";
import AccountPage from "./pages/AccountPage";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

const NAV_ITEMS = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/content", label: "Site Content", icon: PanelsTopLeft },
  { to: "/admin/account", label: "Account", icon: KeyRound },
];

function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-beige text-charcoal font-sans flex">
      <aside className="w-60 shrink-0 bg-charcoal text-paper flex flex-col min-h-screen">
        <div className="px-5 py-6 border-b border-paper/10">
          <h1 className="font-serif text-xl tracking-wide">Hastavastra</h1>
          <p className="text-[11px] uppercase tracking-[2px] text-paper/50 mt-1">
            Admin Panel
          </p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-ochre text-paper"
                    : "text-paper/70 hover:text-paper hover:bg-paper/5"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-paper/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-1 py-2 text-sm text-paper/70 hover:text-paper"
          >
            <Store size={16} /> View store
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-1 py-2 text-sm text-paper/70 hover:text-paper w-full text-left"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h2 className="font-serif text-3xl">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ConfirmDelete({
  what,
  onConfirm,
}: {
  what: string;
  onConfirm: () => void;
}) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        if (window.confirm(`Delete ${what}? This cannot be undone.`)) {
          onConfirm();
        }
      }}
    >
      Delete
    </Button>
  );
}

export default function AdminApp() {
  return (
    <>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/admin/products" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
