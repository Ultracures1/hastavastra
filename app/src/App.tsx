import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Storefront from "@/pages/Storefront";

const AdminApp = lazy(() => import("@/admin/AdminApp"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="*" element={<Storefront />} />
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
                Loading admin…
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
