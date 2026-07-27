"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "@/lib/types";

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-border bg-panel px-2 py-1 text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-ink"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre>
        <code className={className}>{text}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[0.95rem] ${
          isUser
            ? "bg-signal/15 border border-signal/30 text-ink rounded-br-sm"
            : "bg-panel border border-border text-ink rounded-bl-sm"
        }`}
      >
        <div className="prose-code">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: ({ children }) => <>{children}</>,
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-") || String(children).includes("\n");
                if (!isBlock) {
                  return (
                    <code className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>
                      {children}
                    </code>
                  );
                }
                return <CodeBlock className={className}>{children}</CodeBlock>;
              },
            }}
          >
            {message.content || (message.streaming ? "…" : "")}
          </ReactMarkdown>
        </div>
        {message.streaming && message.content && (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-signal align-middle" />
        )}
      </div>
    </div>
  );
}
