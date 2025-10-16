"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with GitHub Flavored Markdown support
 * Used for displaying guides and insights
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          // eslint-disable-next-line jsx-a11y/heading-has-content
          h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          // eslint-disable-next-line jsx-a11y/heading-has-content
          h2: ({ ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
          // eslint-disable-next-line jsx-a11y/heading-has-content
          h3: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,

          // Customize paragraph spacing
          p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,

          // Customize list styles
          ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
          li: ({ ...props }) => <li className="ml-4" {...props} />,

          // Customize code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props}>
                {children}
              </code>
            );
          },

          // Customize blockquotes
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />
          ),

          // Customize tables
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ ...props }) => <td className="border border-border px-4 py-2" {...props} />,

          // Customize links
          a: ({ ...props }) => (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Customize horizontal rules
          hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
