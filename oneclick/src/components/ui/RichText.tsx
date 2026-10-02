/** Renders the tiny content format used by guides/legal: "## " heading, "- " list item. Text only, no HTML. */
export function RichText({ paragraphs }: { paragraphs: string[] }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${key}`}>
          {list.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  paragraphs.forEach((p, i) => {
    if (p.startsWith("- ")) {
      list.push(p.slice(2));
      return;
    }
    flush(String(i));
    if (p.startsWith("## ")) blocks.push(<h2 key={i}>{p.slice(3)}</h2>);
    else blocks.push(<p key={i}>{p}</p>);
  });
  flush("end");
  return <div className="prose-oc">{blocks}</div>;
}
