import { resolve } from 'node:path'
import { unlink } from 'node:fs/promises'
import { Command, Option } from 'commander'
import { generateCoverPage, generateMarkdownContent } from './pdf'
import PDFMerger from 'pdf-merger-js'

const program = new Command()
const merger = new PDFMerger()

program
  .name('md-to-pdf')
  .description('Convert markdown to PDF')
  .version('0.1.0')
  .argument('<file>', 'Markdown file')
  .addOption(new Option('-o, --output <file>', 'Output file').default('./output.pdf'))
  .addOption(new Option('-T, --title <title>', 'Title of the document').default(''))
  .addOption(new Option('-D, --description <description>', 'Description of the document').default(''))
  .action(async (file, options) => {
    const inputFilePath = resolve(process.cwd(), file)
    const inputFile = Bun.file(inputFilePath)
    if (!(await inputFile.exists())) {
      console.error(`File not found: ${inputFilePath}`)
      process.exit(1)
    }
    const content = await inputFile.text()

    const outputFilePath = resolve(process.cwd(), options.output)
    const outputFile = Bun.file(outputFilePath)
    if (await outputFile.exists()) {
      console.warn(`File already exists: ${outputFilePath}. Overwriting...`)
      await unlink(outputFilePath)
    }

    const coverPageBuffer = await generateCoverPage({ title: options.title, description: options.description })
    await merger.add(coverPageBuffer)

    const markdownBuffer = await generateMarkdownContent({ content, title: options.title })
    await merger.add(markdownBuffer)

    const writer = outputFile.writer()
    writer.write(await merger.saveAsBuffer())
    writer.flush()
    console.log(`PDF generated at ${outputFilePath}`)
  })
  .showHelpAfterError()

program.parse(Bun.argv)
