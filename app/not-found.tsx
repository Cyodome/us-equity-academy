import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="serif text-5xl font-extrabold text-ink">404</p>
      <p className="mt-4 text-[0.95rem]">このページは見つかりません。URLが変わった可能性があります。</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-ink px-5 py-2.5 font-bold text-paper">
        トップへ戻る
      </Link>
    </main>
  );
}
