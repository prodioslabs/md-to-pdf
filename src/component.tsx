import Markdown from 'react-markdown'
import remarkGFM from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import { toc } from 'mdast-util-toc'
import { toMarkdown } from 'mdast-util-to-markdown'
import { fromMarkdown } from 'mdast-util-from-markdown'

type LayoutProps = React.PropsWithChildren<{ css: string }>
export function Layout({ children, css }: LayoutProps) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/vs2015.min.css"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body>{children}</body>
    </html>
  )
}

type MarkdownRendererProps = {
  title: string
  description?: string
  content: string
}

export function MarkdownRenderer({ title, description, content }: MarkdownRendererProps) {
  const tocMarkdown = generateTOC(content)
  return (
    <>
      <div
        className="flex h-screen flex-col items-center justify-center gap-4 border-2"
        style={{ pageBreakAfter: 'always' }}
      >
        <div className="text-3xl font-medium">{title}</div>
        <div className="text-base text-slate-600">{description}</div>
      </div>
      <div className="prose prose-zinc w-full max-w-none prose-h1:text-3xl prose-h1:font-medium prose-h2:font-medium prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-pre:border prose-pre:bg-zinc-900">
        {tocMarkdown ? (
          <>
            <Markdown className="">
              {`
# Table of Content

${tocMarkdown}
        `}
            </Markdown>
            <div style={{ pageBreakAfter: 'always' }} />
          </>
        ) : null}
        <Markdown remarkPlugins={[remarkGFM]} rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}>
          {content}
        </Markdown>
      </div>
    </>
  )
}

function generateTOC(content: string) {
  const tree = fromMarkdown(content)
  const result = toc(tree, { tight: true, maxDepth: 6 })
  if (result.map) {
    const markdown = toMarkdown(result.map)
    return markdown
  }
  return ''
}
