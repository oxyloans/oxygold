import React, {
  memo,
  useRef,
  type ComponentPropsWithoutRef,
  type DetailedHTMLProps,
  type AnchorHTMLAttributes,
  type ImgHTMLAttributes,
} from "react";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github-dark.css";
import { Download } from "lucide-react";
import "katex/dist/katex.min.css";

interface Props {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<Props> = memo(
  ({ content, className = "" }) => {
    const CodeBlock = ({
      inline,
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
      const preRef = useRef<HTMLPreElement>(null);

      return inline ? (
        <code className="rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-300 px-1 py-0.5 text-sm font-mono">
          {children}
        </code>
      ) : (
        <div className="relative group my-4">
          <pre
            ref={preRef}
            className="bg-[#f9f9f9] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 px-4 py-3 rounded-xl shadow-sm overflow-x-auto text-sm font-mono whitespace-pre-wrap"
          >
            <code {...props} className="break-words">
              {children}
            </code>
          </pre>
        </div>
      );
    };

    const LinkRenderer = ({
      href,
      children,
      ...rest
    }: DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >) => {
      const isExternal = href?.startsWith("http");
      const isYouTube =
        href?.includes("youtube.com/watch") || href?.includes("youtu.be");

      // Auto-embed YouTube
      // Auto-embed YouTube with smaller width
      if (isYouTube && href) {
        const videoId = href.split("v=")[1] || href.split("/").pop();
        return (
          <div className="my-4 flex justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full max-w-xl aspect-video rounded-xl shadow-md"
              style={{ maxHeight: "360px" }}
              allowFullScreen
            ></iframe>
          </div>
        );
      }
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          {...rest}
        >
          {children}
          {isExternal && <span className="ml-1 text-xs">↗</span>}
        </a>
      );
    };
    // Flowchart renderer
    // const FlowchartRenderer = ({ children }: { children: string }) => {
    //   const chartId = `flowchart-${Math.random().toString(36).substr(2, 9)}`;

    //   useEffect(() => {
    //     try {
    //       mermaid.initialize({ startOnLoad: true });
    //       mermaid.contentLoaded();
    //     } catch (err) {
    //       console.error("Mermaid render error:", err);
    //     }
    //   }, []);

    //   return (
    //     <div className="my-4 overflow-auto">
    //       <div className="flowchart" id={chartId}>
    //         {children}
    //       </div>
    //     </div>
    //   );
    // };
    const ImageRenderer = ({
      src,
      alt,
    }: ImgHTMLAttributes<HTMLImageElement>) => (
      <div className="my-4 relative group flex justify-center">
        <img
          src={src || ""}
          alt={alt || ""}
          className="max-w-full h-auto rounded-lg border shadow-md dark:border-gray-700 max-h-96 object-contain"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (src) {
              const a = document.createElement("a");
              a.href = src;
              a.download = alt || "downloaded-image.png";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
          title="Download image"
        >
          <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    );

    return (
      <div
        className={`prose prose-sm sm:prose-base lg:prose-lg max-w-full dark:prose-invert break-words text-gray-800 dark:text-gray-100 ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mt-10 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-semibold mt-5 mb-2">{children}</h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-semibold mt-4 mb-1">{children}</h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium mt-3 mb-1 text-gray-500 dark:text-gray-400">
                {children}
              </h6>
            ),
            p: ({ children }) => (
              <p className="leading-relaxed text-[16px] text-gray-800 dark:text-gray-200 mb-4">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => (
              <del className="line-through">{children}</del>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800/30 p-4 my-4 italic text-gray-700 dark:text-gray-300 rounded-r-md">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc ml-4 space-y-1 text-gray-800 dark:text-gray-200">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 space-y-1 text-gray-800 dark:text-gray-200">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed text-gray-800 dark:text-gray-200 pl-2">
                {children}
              </li>
            ),
            code: CodeBlock,
            a: LinkRenderer,
            img: ImageRenderer,
            // div: ({ className, children }) => {
            //   if (className?.includes("flowchart")) {
            //     return (
            //       <FlowchartRenderer>{children as string}</FlowchartRenderer>
            //     );
            //   }
            //   return <div className={className}>{children}</div>;
            // },
            details: ({ children }) => (
              <details className="my-4 rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                {children}
              </details>
            ),
            summary: ({ children }) => (
              <summary className="font-semibold cursor-pointer text-blue-600 dark:text-blue-400">
                {children}
              </summary>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white dark:bg-gray-800/50">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 font-medium border-r border-gray-200 dark:border-gray-700 text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700">
                {children}
              </td>
            ),
            input: ({ type, checked, ...props }) =>
              type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mr-2 text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
                  {...props}
                />
              ) : (
                <input type={type} {...props} />
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

export default MarkdownRenderer;
