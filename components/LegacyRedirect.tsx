"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 旧サイト（#ch1 などのハッシュ形式）のURLを新しい章ページへ転送する
export function LegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    const m = window.location.hash.match(/^#(ch\d{1,2}|intro|appendix)$/);
    if (m) router.replace(`/chapters/${m[1]}/`);
  }, [router]);
  return null;
}
