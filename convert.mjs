import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const SRC = '/Users/jesus/GolandProjects/docs/ru'
const DEST = '/Users/jesus/GolandProjects/docs-vitepress/ru'

function convertMdx(content) {
  // Keep icon in frontmatter (used by PageHeader component)

  // Convert callouts to native VitePress containers
  content = content.replace(/<Note>\s*\n?([\s\S]*?)<\/Note>/g, (_, body) => {
    return `::: info Примечание\n${body.trim()}\n:::\n`
  })
  content = content.replace(/<Warning>\s*\n?([\s\S]*?)<\/Warning>/g, (_, body) => {
    return `::: warning Внимание\n${body.trim()}\n:::\n`
  })
  content = content.replace(/<Tip>\s*\n?([\s\S]*?)<\/Tip>/g, (_, body) => {
    return `::: tip Совет\n${body.trim()}\n:::\n`
  })

  // Convert <Columns cols={N}> + <Card> → markdown link cards
  content = content.replace(/<Columns\s+cols=\{(\d+)\}>\s*\n?([\s\S]*?)<\/Columns>/g, (_, cols, body) => {
    return body
  })

  // Convert standalone <Card title="..." icon="..." href="...">content</Card>
  content = content.replace(/<Card\s+title="([^"]*)"(?:\s+icon="[^"]*")?(?:\s+href="([^"]*)")?\s*>\s*\n?([\s\S]*?)<\/Card>/g, (_, title, href, body) => {
    const desc = body.trim()
    if (href) {
      return `- **[${title}](${href})** — ${desc}\n`
    }
    return `- **${title}** — ${desc}\n`
  })

  // Convert <Steps>/<Step> to numbered markdown
  let stepCounter = 0
  content = content.replace(/<Steps>\s*/g, () => { stepCounter = 0; return '\n' })
  content = content.replace(/\s*<\/Steps>/g, '\n')
  content = content.replace(/<Step\s+title="([^"]*)">\s*/g, (_, title) => {
    stepCounter++
    return `**Шаг ${stepCounter}: ${title}**\n\n`
  })
  content = content.replace(/\s*<\/Step>/g, '\n')

  // Convert <Tabs>/<Tab> to sections
  content = content.replace(/<Tabs>\s*/g, '\n')
  content = content.replace(/\s*<\/Tabs>/g, '\n')
  content = content.replace(/<Tab\s+title="([^"]*)">\s*/g, (_, title) => {
    return `\n##### ${title}\n\n`
  })
  content = content.replace(/\s*<\/Tab>/g, '\n')

  // Convert <Accordion title="..."> to <details>
  content = content.replace(/<Accordion\s+title="([^"]*)">\s*\n?([\s\S]*?)<\/Accordion>/g, (_, title, body) => {
    return `<details>\n<summary>${title}</summary>\n\n${body.trim()}\n\n</details>\n`
  })

  // Convert JSX style={{...}} to HTML style="..."
  content = content.replace(/style=\{\{([^}]*)\}\}/g, (_, cssObj) => {
    // Convert camelCase CSS to kebab-case and format as HTML style
    const css = cssObj
      .split(',')
      .map(s => s.trim())
      .map(s => {
        const [key, val] = s.split(':').map(p => p.trim().replace(/['"]/g, ''))
        const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${kebab}: ${val}`
      })
      .join('; ')
    return `style="${css}"`
  })

  // Remove indentation (4+ spaces) from non-code-block lines
  // This fixes content that was indented inside <Tab>/<Step> in MDX
  const lines = content.split('\n')
  let inCodeBlock = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
    }
    if (!inCodeBlock) {
      // Remove leading 4+ spaces (tab-level indentation from MDX nesting)
      lines[i] = lines[i].replace(/^ {4,}/, '')
    }
  }
  content = lines.join('\n')

  // Clean up excessive blank lines
  content = content.replace(/\n{4,}/g, '\n\n\n')

  // Trim trailing spaces
  content = content.replace(/[ \t]+$/gm, '')

  return content
}

function processDir(srcDir, destDir) {
  const entries = readdirSync(srcDir)
  for (const entry of entries) {
    const srcPath = join(srcDir, entry)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      mkdirSync(join(destDir, entry), { recursive: true })
      processDir(srcPath, join(destDir, entry))
    } else if (entry.endsWith('.mdx')) {
      const content = readFileSync(srcPath, 'utf-8')
      const converted = convertMdx(content)
      const destPath = join(destDir, entry.replace('.mdx', '.md'))
      writeFileSync(destPath, converted)
      console.log(`  ${relative(DEST, destPath)}`)
    }
  }
}

console.log('Converting MDX files...')
mkdirSync(DEST, { recursive: true })
processDir(SRC, DEST)
console.log('Done!')
