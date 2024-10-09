import Markdown from 'react-markdown'
import remarkGFM from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkToc from 'remark-toc'
import rehypeRaw from 'rehype-raw'
import { cn } from './utils'

type LayoutProps = React.PropsWithChildren<{ css: string }>
export function Layout({ children, css }: LayoutProps) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/tokyo-night-dark.min.css"
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
  className?: string
}

export function MarkdownRenderer({ title, description, content, className }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[
        remarkGFM,
        [remarkToc, { tight: true, maxDepth: 6, ordered: true, skip: 'CoverPage|TocPageBreak' }],
      ]}
      rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings, rehypeRaw]}
      remarkRehypeOptions={{
        allowDangerousHtml: true,
      }}
      className={cn('prose w-full max-w-none', className)}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h1: ({ children, node, ...rest }) => {
          const elements = [
            <h1 className="text-3xl font-semibold" {...rest} key="content">
              {children}
            </h1>,
          ]
          return <>{elements}</>
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h2: ({ children, node, ...rest }) => (
          <h2 className="text-2xl font-semibold" {...rest}>
            {children}
          </h2>
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h3: ({ children, node, ...rest }) => (
          <h3 className="text-xl font-semibold" {...rest}>
            {children}
          </h3>
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h4: ({ children, node, ...rest }) => (
          <h4 className="text-lg font-semibold" {...rest}>
            {children}
          </h4>
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h6: ({ children, node, ...rest }) => {
          if (rest.id === 'table-of-contents') {
            return (
              <h1 className="text-3xl font-semibold" {...rest}>
                {children}
              </h1>
            )
          }
          if (rest.id === 'tocpagebreak') {
            return <div style={{ pageBreakAfter: 'always' }}></div>
          }
          if (rest.id === 'coverpage') {
            return (
              <div
                className="flex h-screen flex-col items-center justify-center gap-4"
                style={{ pageBreakAfter: 'always' }}
              >
                <div className="text-3xl font-medium">{title}</div>
                <div className="text-base text-slate-600">{description}</div>
              </div>
            )
          }
          return <h6 {...rest}>{children}</h6>
        },
      }}
    >
      {/*
      This is a very weird hack to add a page break after the TOC
      The table of contents heading is required to render the contents
      The tocpagebreak is required to add a page break after the TOC
      The coverpage is required to render the cover page
       */}
      {`
###### CoverPage
###### Table of Contents
###### TocPageBreak

${content}
      `}
    </Markdown>
  )
}
