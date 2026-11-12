import type { Metadata } from "next";
import { DashboardApp } from "./app";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

// Dashboard solo in italiano: la usano Marco e Anna.
export default function Dashboard() {
  return <DashboardApp />;
}
