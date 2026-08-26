import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/components/admin/Dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | GGH Management Portal" },
      { name: "description", content: "Garowe General Hospital operational management dashboard." },
    ],
  }),
  component: DashboardPage,
});
