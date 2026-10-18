import type { Quote } from "@/lib/quotes";

export function QuoteBlock({ q }: { q: Quote }) {
  return (
    <figure className="relative my-14 px-2 text-center sm:px-8">
      <div className="mx-auto mb-5 h-px w-16 bg-amber" aria-hidden />
      <blockquote>
        <p className="serif text-[1.28rem] font-extrabold leading-[1.75] text-ink sm:text-[1.42rem]">{q.ja}</p>
        <p className="mt-3 text-[0.86rem] italic leading-relaxed text-muted" lang="en">
          “{q.en}”
        </p>
      </blockquote>
      <figcaption className="mt-3 text-[0.8rem] text-text">
        ― {q.who}
        <span className="block text-[0.72rem] text-muted">{q.source}</span>
      </figcaption>
    </figure>
  );
}
