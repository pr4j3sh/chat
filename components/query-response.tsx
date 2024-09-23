import { SetStateAction, useEffect, useState } from "react";
import { marked } from "marked";

export default function QueryResponse({ markdown }: { markdown: string }) {
  const [htmlResponse, setHtmlResponse] = useState<string>("");

  const renderMarkdown = () => {
    const html = marked(markdown);
    setHtmlResponse(html as SetStateAction<string>);
  };

  useEffect(() => {
    if (markdown) {
      renderMarkdown();
    }
  }, [markdown]);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: htmlResponse }}
    />
  );
}
