// app/dashboard/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Taskbar from '@/components/dashboard/taskbar';

type Permissions = {
  view_orders: boolean;
  view_history: boolean;
  view_menu: boolean;
  view_reviews: boolean;
  view_super: boolean;
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Helper: get first allowed dashboard route
  function getAllowedRoute(perms?: Permissions) {
    if (!perms) return null;
    if (perms.view_orders) return "/dashboard/orders";
    if (perms.view_menu) return "/dashboard/menu";
    if (perms.view_history) return "/dashboard/history";
    if (perms.view_reviews) return "/dashboard/reviews";
    if (perms.view_super) return "/dashboard/view-accounts";
    return null;
  }
  // Cookie-based authentication: get user_id from cookie
  let permissions: Permissions = {
    view_orders: false,
    view_history: false,
    view_menu: false,
    view_reviews: false,
    view_super: false,
  };

  try {
    const cookieStore = await cookies();
    const user_id = cookieStore.get('user_id')?.value ?? null;
    // Debug log user_id
    // @ts-ignore
    if (typeof console !== 'undefined') console.log('user_id from cookie:', user_id);
    if (user_id) {
      const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
      const supabase = createServerComponentClient({ cookies });
      const { data: permData } = await supabase
        .from('adminusers')
        .select('view_orders, view_history, view_menu, view_reviews, view_super')
        .eq('user_id', user_id)
        .single();
      // Debug log permData
      // @ts-ignore
      if (typeof console !== 'undefined') console.log('permData from adminusers:', permData);
      if (permData) {
        permissions = {
          view_orders: Boolean(permData.view_orders),
          view_history: Boolean(permData.view_history),
          view_menu: Boolean(permData.view_menu),
          view_reviews: Boolean(permData.view_reviews),
          view_super: Boolean(permData.view_super),
        };
      }
    }
  } catch {
    // fallback to all false permissions
  }

  /*
  // Original permissions logic (disabled for now)
  try {
    // Correct cookie extraction for Next.js server component
    const cookieStore = cookies();
    user_id = cookieStore.get('user_id')?.value ?? null;

    if (user_id) {
      const supabase = createServerComponentClient({ cookies });
      const { data: permData } = await supabase
        .from('adminusers')
        .select('view_orders, view_history, view_menu, view_reviews, view_super')
        .eq('user_id', user_id)
        .single();
      if (permData) {
        permissions = {
          view_orders: Boolean(permData.view_orders),
          view_history: Boolean(permData.view_history),
          view_menu: Boolean(permData.view_menu),
          view_reviews: Boolean(permData.view_reviews),
          view_super: Boolean(permData.view_super),
        };
      }
    }
  } catch {
    // If Supabase or env vars are missing, fallback to default permissions
    // Optionally log error for debugging
  }
  */


  return (
    <>
      <Taskbar permissions={permissions || {
        view_orders: false,
        view_history: false,
        view_menu: false,
        view_reviews: false,
        view_super: false,
      }} />
      {/* Route-level access control */}
      {(() => {
        const perms = permissions || {
          view_orders: false,
          view_history: false,
          view_menu: false,
          view_reviews: false,
          view_super: false,
        };
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        const allowedRoute = getAllowedRoute(perms);
        const allFalse = !perms.view_orders && !perms.view_menu && !perms.view_history && !perms.view_reviews && !perms.view_super;
        if (allFalse) {
          return <div style={{ padding: 32, textAlign: 'center', color: '#c00' }}>No dashboard permissions for this account.</div>;
        }
        if (typeof window !== "undefined" && allowedRoute && currentPath !== allowedRoute) {
          window.location.href = allowedRoute;
          return null;
        }
        return children;
      })()}
    </>
  );
}