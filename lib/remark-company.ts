import { visit, SKIP } from "unist-util-visit";
import { companyNamePattern, nameToId } from "./companies";

// 段落・箇条書きの中の社名を <co-ref> 要素に置き換える（表と見出しは対象外）
type Node = { type: string; value?: string; children?: Node[]; data?: Record<string, unknown> };

export function remarkCompany() {
  return (tree: Node) => {
    visit(tree as never, (node: Node) => {
      if (node.type === "companyRef" || node.type === "table" || node.type === "heading" || node.type === "code" || node.type === "link") return SKIP;
      if (!node.children) return;
      const out: Node[] = [];
      let changed = false;
      for (const child of node.children) {
        if (child.type !== "text" || !child.value) {
          out.push(child);
          continue;
        }
        const parts = child.value.split(companyNamePattern);
        if (parts.length === 1) {
          out.push(child);
          continue;
        }
        changed = true;
        for (const part of parts) {
          if (!part) continue;
          if (nameToId[part]) {
            out.push({
              type: "companyRef",
              data: { hName: "co-ref", hProperties: { co: nameToId[part] } },
              children: [{ type: "text", value: part }],
            });
          } else out.push({ type: "text", value: part });
        }
      }
      if (changed) node.children = out;
    });
  };
}
