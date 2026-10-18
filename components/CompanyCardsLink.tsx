"use client";

import { CompanyCards } from "./CompanySheet";
import { useDrawer } from "./Providers";

export function CompanyCardsLink() {
  const d = useDrawer();
  return <CompanyCards onPick={(id) => d.show(id, "pl")} />;
}
