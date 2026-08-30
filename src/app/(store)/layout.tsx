import { StoreFooter } from "@/components/layout/store-footer";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <>{children}<StoreFooter /></>;
}