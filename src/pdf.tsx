import { renderToString } from 'react-dom/server'
import puppeteer from 'puppeteer'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import tailwindConfig from '../tailwind.config'
import { Layout, MarkdownRenderer } from './component'

const css = postcss([tailwindcss(tailwindConfig)]).process(
  '@tailwind base; @tailwind components; @tailwind utilities;',
  {
    from: undefined,
    map: false,
  },
)

export async function generateMarkdownContent({
  content,
  title,
  description,
}: {
  content: string
  title: string
  description?: string
}) {
  const cssContent = await css
  const pageContent = renderToString(
    <Layout css={cssContent.css}>
      <MarkdownRenderer content={content} title={title} description={description} />
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
    <style>
      #header {
        padding: 0px;
      }
    </style>
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
      top: '40px',
      bottom: '40px',
      right: '32px',
      left: '32px',
    },
  })
  await browser.close()

  return buffer
}
