import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { remarkCompany } from "@/lib/remark-company";
import type { CompanyId } from "@/lib/companies";
import { CompanyChip } from "./CompanyChip";
import { Chart } from "./charts";
import { Mermaid } from "./Mermaid";
import { CompanySheet } from "./CompanySheet";
import { Glossary } from "./Glossary";

type HNode = { type: string; tagName?: string; value?: string; children?: HNode[] };
const textOf = (n?: HNode): string => (!n ? "" : n.type === "text" ? n.value ?? "" : (n.children ?? []).map(textOf).join(""));

const components: Components & Record<string, unknown> = {
  p({ node, children }) {
    const t = textOf(node as HNode).trim();
    const chart = t.match(/^\{\{chart:(\w+)\}\}$/);
    if (chart) return <Chart id={chart[1]} />;
    if (t === "{{companysheet}}") return <CompanySheet />;
    if (t === "{{glossary}}") return <Glossary />;
    return <p>{children}</p>;
  },
  blockquote({ node, children }) {
    const t = textOf(node as HNode).trim();
    if (t.startsWith("投資判断への直結")) {
      return (
        <aside className="not-prose relative overflow-hidden rounded-2xl bg-hero p-5 text-hero-ink sm:p-6" aria-label="投資判断への直結">
          <div className="takeaway space-y-2 text-[0.92rem] leading-[1.85] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.85em] [&_li]:before:h-[5px] [&_li]:before:w-[5px] [&_li]:before:rounded-full [&_li]:before:bg-amber [&_p:first-child]:serif [&_p:first-child]:text-[1.05rem] [&_p:first-child]:font-extrabold [&_p:first-child]:text-amber [&_strong]:bg-none [&_strong]:text-amber [&_ul]:space-y-2">
            {children}
          </div>
        </aside>
      );
    }
    if (t.startsWith("前提")) {
      return <div className="rounded-xl border border-amber/50 bg-amber-soft px-4 py-3 text-[0.9rem] [&_strong]:bg-none">{children}</div>;
    }
    return <div className="formula">{children}</div>;
  },
  table({ children }) {
    return (
      <div className="table-wrap thin-scroll">
        <table>{children}</table>
      </div>
    );
  },
  code({ className, children }) {
    const lang = /language-(\w+)/.exec(className || "")?.[1];
    const code = String(children).replace(/\n$/, "");
    if (lang === "mermaid") return <Mermaid code={code} />;
    return <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.88em]">{children}</code>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
  a({ href, children }) {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  "co-ref"(props: { co?: CompanyId; children?: React.ReactNode }) {
    return <CompanyChip id={props.co as CompanyId}>{props.children}</CompanyChip>;
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose-jp">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkCompany]} components={components as Components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
