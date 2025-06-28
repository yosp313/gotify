import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authApi } from "../services/api";

export const Route = createFileRoute("/songs")({
  component: SongsLayout,
  beforeLoad: async ({ navigate }) => {
    if (!authApi.isAuthenticated()) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    try {
      await authApi.getCurrentUser();
    } catch (error) {
      authApi.logout();
      navigate({ to: "/auth", replace: true });
    }
  },
});

function SongsLayout() {
  return <Outlet />;
}
