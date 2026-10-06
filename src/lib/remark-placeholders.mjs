// Remark plugin: turns [[TYPE: note]] inside Markdown text into placeholder markup.
import { PLACEHOLDER_RE, placeholderHtml } from './placeholders.mjs';

function transform(node) {
  if (!node.children) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text' && child.value.includes('[[')) {
      let last = 0;
      for (const m of child.value.matchAll(PLACEHOLDER_RE)) {
        if (m.index > last) next.push({ type: 'text', value: child.value.slice(last, m.index) });
        next.push({ type: 'html', value: placeholderHtml(m[1], m[2]) });
        last = m.index + m[0].length;
      }
      if (last < child.value.length) next.push({ type: 'text', value: child.value.slice(last) });
    } else {
      transform(child);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkPlaceholders() {
  return (tree) => transform(tree);
}
