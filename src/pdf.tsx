import { renderToString } from 'react-dom/server'
import puppeteer from 'puppeteer'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from '../tailwind.config'
import { Layout, MarkdownRenderer } from './component'

const css = postcss([autoprefixer(), tailwindcss(tailwindConfig)]).process(
  '@tailwind base; @tailwind components; @tailwind utilities;',
  {
    from: undefined,
    map: false,
  },
)

export async function generateMarkdownContent({ content, title }: { content: string; title: string }) {
  const cssContent = await css
  const pageContent = renderToString(
    <Layout css={cssContent.css}>
      <MarkdownRenderer content={content} title={title} />
    </Layout>,
  )

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setContent(pageContent)
  await page.waitForNetworkIdle()
  const buffer = await page.pdf({
    printBackground: true,
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: `
    <style>${css}</style>
    <style>
      #header {
        padding: 0px;
      }
    </style>
    <div class="header w-full text-center text-[14px] px-[32px]">
      <div class="border-b py-[12px]">
        ${title}
      </div>
    </div>
  `,
    footerTemplate: `
    <style>
    ${css}
    </style>
    <style>
      #footer {
        padding: 0px;
      }
    </style>
    <div class="footer text-right w-full px-[32px] text-[12px]">
      <div class="py-[12px] border-t">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    </div>
  `,
    margin: {
      top: '80px',
      bottom: '80px',
      right: '32px',
      left: '32px',
    },
  })
  await browser.close()

  return buffer
}

export async function generateCoverPage({ title, description }: { title: string; description: string }) {
  const cssContent = await css
  const pageContent = renderToString(
    <Layout css={cssContent.css}>
      <div className="h-screen p-4">
        <div className="flex h-full flex-col items-center justify-center gap-2 border-2 border-orange-500">
          <div className="text-3xl font-medium text-slate-900">{title}</div>
          <div className="text-lg text-slate-600">{description}</div>
        </div>
      </div>
    </Layout>,
  )

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setContent(pageContent)
  await page.waitForNetworkIdle()
  const buffer = await page.pdf({
    printBackground: true,
    format: 'A4',
  })
  await browser.close()

  return buffer
}
