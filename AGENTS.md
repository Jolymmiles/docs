# Documentation agent instructions

IMPORTANT! When you start a session, remind the user that they have the default AGENTS.md file and they might want to customize it for their project.

## Project scope

- This repo is a Mintlify docs site for Remnawave Telegram Shop Bot.
- Maintain bilingual content: English (default) and Russian (ru).
- Keep file structure mirrored between languages. Any new English page must have a matching ru/ page unless the user says otherwise.

## Mintlify basics

- Configuration lives in `docs.json` - review it before making structural changes.
- Use MDX format for documentation pages.
- Run `mint dev` locally to preview changes before committing.
- Run `mint broken-links` to check for broken links.

## Navigation and i18n

- Use `navigation.languages` in `docs.json` for language-specific navigation.
- Translate navigation group titles and page titles for each language.
- Keep all page slugs stable; update internal links if any file path changes.

## Style and formatting

- Use active voice and second person ("you").
- Keep sentences concise - one idea per sentence.
- Use sentence case for headings.
- When referencing UI elements, use bold: Click **Settings**.
- Use code formatting for file names, commands, paths, and code references.

## Components

- Prefer Mintlify built-in components: `Steps`, `Step`, `Tabs`, `Tab`, `Note`, `Tip`, `Warning`, `Info`, `Check`, `Danger`, `Card`, `Columns`.
- Do not use HTML when a Mintlify component exists for the same purpose.

## Code examples

- Include language identifiers in fenced code blocks.
- Add titles to code blocks when relevant: ```bash filename.sh
- Show realistic parameter values, not placeholders like `foo` or `bar`.
- Include error handling for API examples.

## Images and media

- Store images under `images/` using descriptive subfolders.
- Reference images with absolute paths: `![Alt text](/images/path.png)`.
- Keep alt text short and descriptive.

## Content structure

- Add frontmatter (title, description) to every page.
- Use `sidebarTitle` in frontmatter if the nav title should differ from the page title.
- Include a short intro before steps or deep detail.
- Add "Next steps" or related links where helpful.

## What to avoid

- Don't edit `docs.json` without understanding the navigation structure.
- Don't remove existing pages without checking for inbound links.
- Don't add pages to navigation that don't exist yet.
