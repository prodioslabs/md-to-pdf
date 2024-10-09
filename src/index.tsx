import React from 'react'
import { renderToString } from 'react-dom/server'
import puppeteer from 'puppeteer'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from '../tailwind.config'

type LayoutProps = React.PropsWithChildren<{ css: string }>
function Layout({ children, css }: LayoutProps) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body className="">{children}</body>
    </html>
  )
}

async function main() {
  const css = await postcss([autoprefixer(), tailwindcss(tailwindConfig)]).process(
    '@tailwind base; @tailwind components; @tailwind utilities;',
    {
      from: undefined,
      map: false,
    },
  )

  const output = renderToString(
    <Layout css={css.css}>
      <div className="bg-red-500 text-green-500">Hello World</div>
    </Layout>,
  )

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setContent(output)
  const buffer = await page.pdf({
    printBackground: true,
    format: 'A4',
  })
  await browser.close()

  const file = Bun.file('output.pdf')
  const writer = file.writer()
  writer.write(buffer)
  writer.flush()
}

main()
