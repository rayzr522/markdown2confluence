import marked, { Renderer } from 'marked'
import querystring from 'querystring'

import { defaultLanguageMap, LanguageMap } from './language-map'

export interface CodeBlockStyleOptions {
    theme?: string
    borderStyle?: string
    linenumbers?: boolean
    collapse?: boolean
}

export type Rewriter = (input: string) => string

export interface RenderOptions {
    marked: marked.MarkedOptions
    codeLanguageMap: LanguageMap
    codeStyling: CodeBlockStyleOptions
    codeCollapseAt: number
    linkRewrite: Rewriter
    imageRewrite: Rewriter
}

/**
 * This class is how the marked library translsates markdown into something
 * else.
 */
export class ConfluenceRenderer extends Renderer {
    renderOptions: RenderOptions

    /**
     * Creates a new instance. The `options` parameter control a few
     * tweaks that can be applied by the user in order to render better
     * markup.
     *
     * @param {RenderOptions} options
     */
    constructor(options: RenderOptions) {
        super()

        this.renderOptions = options
    }


    /**
     * Blockquote.
     *
     *   > This is a blockquote.
     *
     * is changed into
     *
     *   {quote}
     *   This is a blockquote.
     *   {quote}
     *
     * @param {string} text
     * @return {string}
     */
    blockquote(text: string): string {
        return `{quote}\n${text.trim()}\n{quote}\n\n`
    }


    /**
     * A line break. Supposedly if you have a line with 2 or more spaces
     * followed by a line that doesn't have whitespace, then it turns into
     * this element. I'm failing to reproduce that scenario.
     *
     * @return {string}
     */
    br(): string {
        return '\n'
    }


    /**
     * Code block.
     *
     *   ```js
     *   // JavaScript code
     *   ```
     *
     * is changed into
     *
     *   {code:language=javascript|borderStyle=solid|theme=RDark|linenumbers=true|collapse=false}
     *   // JavaScript code
     *   {code}
     *
     * @param {string} text
     * @param {string} lang
     * @return {string}
     */
    code(text: string, lang: string): string {
        // Simple clone of the options.
        const stylingOptions = JSON.parse(JSON.stringify(this.renderOptions.codeStyling))

        lang = lang || ''
        lang = lang.toLowerCase()
        lang = this.renderOptions.codeLanguageMap[lang] || this.renderOptions.codeLanguageMap['']

        if (lang) {
            stylingOptions.language = lang
        }

        // If too big, collapse.
        if (text.split('\n').length > this.renderOptions.codeCollapseAt) {
            stylingOptions.collapse = true
        }

        // Convert to a string
        let stylingString = querystring.stringify(stylingOptions, '|')

        if (stylingString) {
            stylingString = `:${stylingString}`
        }

        return `{code${stylingString}}\n${text}\n{code}\n\n`
    }


    /**
     * Inline code.
     *
     *   Text that has statements, like `a = true` or similar.
     *
     * turns into
     *
     *   Text that has statements, like {{a = true}} or similar.
     *
     * Be wary. This converts wrong: "Look at `~/file1` or `~/file2`"
     * Confluence thinks it is subscript and converts the markup into
     * "Look at <code><sub>/file1</code> or <code></sub>/file2</code>".
     * That's why some characters need to be escaped.
     *
     * @param {string} text
     * @return {string}
     */
    codespan(text: string): string {
        return `{{${text.replace(/[{}]/g, '\\$&')}}}`
    }


    /**
     * Strikethrough.
     *
     *   Supported ~~everywhere~~ in GFM only.
     *
     * turns into
     *
     *   Supported -everywhere- in GFM only.
     *
     * @param {string} text
     * @return {string}
     */
    del(text: string): string {
        return `-${text}-`
    }


    /**
     * Emphasis.
     *
     *   Typically this is *italicized* text.
     *
     * turns into
     *
     *   Typically this is _italicized_ text.
     *
     * @param {string} text
     * @return {string}
     */
    em(text: string): string {
        return `_${text}_`
    }


    /**
     * Headings 1 through 6.
     *
     *   Heading 1
     *   =========
     *
     *   # Heading 1 alternate
     *
     *   ###### Heading 6
     *
     * turns into
     *
     *   h1. Heading 1
     *
     *   h1. Heading 1 alternate
     *
     *   h6. Heading 6
     *
     * @param {string} text
     * @param {number} level
     * @return {string}
     */
    heading(text: string, level: number): string {
        return `h${level}. ${text}\n\n`
    }


    /**
     * Horizontal rule.
     *
     *   ---
     *
     * turns into
     *
     *   ----
     *
     * @return {string}
     */
    hr(): string {
        return '----\n\n'
    }


    /**
     * Embedded HTML.
     *
     *   <div></div>
     *
     * turns into
     *
     *   <div></div>
     *
     * @param {string} text
     * @return {string}
     */
    html(text: string): string {
        return text
    }


    /**
     * An embedded image.
     *
     *   ![alt-text](image-url)
     *
     * is changed into
     *
     *   !image-url!
     *
     * Markdown supports alt text and titles. Confluence does not.
     *
     * @param {string} href
     * @return {string}
     */
    image(href: string): string {
        href = this.renderOptions.imageRewrite(href)

        return `!${href}!`
    }


    /**
     * Link to another resource.
     *
     *   [Home](/)
     *   [Home](/ "some title")
     *
     * turns into
     *
     *   [Home|/]
     *   [some title|/]
     *
     * @param {string} href
     * @param {string} title
     * @param {string} text
     * @return {string}
     */
    link(href: string, title: string, text: string): string {
        // Sadly, one must choose if the link's title should be displayed
        // or the linked text should be displayed. We picked the linked text.
        text = text || title

        if (text) {
            text += '|'
        }

        href = this.renderOptions.linkRewrite(href)

        return `[${text}${href}]`
    }


    /**
     * Converts a list.
     *
     *     # ordered
     *         * unordered
     *
     * becomes
     *
     *     # ordered
     *     #* unordered
     *
     * Note: This adds an extra "\r" before the list in order to cope
     * with nested lists better. When there's a "\r" in a nested list, it
     * is translated into a "\n". When the "\r" is left in the converted
     * result then it is removed.
     *
     * @param {string} text
     * @param {boolean} ordered
     * @return {string}
     */
    list(text: string, ordered: boolean): string {
        text = text.trim()

        if (ordered) {
            text = text.replace(/^\*/gm, '#')
        }

        return `\r${text}\n\n`
    }


    /**
     * Changes a list item. Always marks it as an unordered list, but
     * list() will change it back.
     *
     * @param {string} text
     * @return {string}
     */
    listitem(text: string): string {
        // If a list item has a nested list, it will have a "\r" in the
        // text. Turn that "\r" into "\n" but trim out other whitespace
        // from the list.
        text = text.replace(/\s*$/, '').replace(/\r/g, '\n')

        // Convert newlines followed by a # or a * into sub-list items
        text = text.replace(/\n([*#])/g, '\n*$1')

        return `* ${text}\n`
    }


    /**
     * A paragraph of text.
     *
     * @param {string} text
     * @return {string}
     */
    paragraph(text: string): string {
        return `${text}\n\n`
    }


    /**
     * Creates strong text.
     *
     *   This is typically **bolded**.
     *
     * becomes
     *
     *   This is typically *bolded*.
     *
     * @param {string} text
     * @return {string}
     */
    strong(text: string): string {
        return `*${text}*`
    }


    /**
     * Renders a table. Most of the work is done in tablecell.
     *
     * @param {string} header
     * @param {string} body
     * @return {string}
     */
    table(header: string, body: string): string {
        return `${header}${body}\n`
    }


    /**
     * Converts a table cell. When this is a header, the cell is prefixed
     * with two bars instead of one.
     *
     * @param {string} text
     * @param {Object} flags
     * @return {string}
     */
    tablecell(text: string, flags: Record<string, any>): string {
        let boundary

        if (flags.header) {
            boundary = '||'
        } else {
            boundary = '|'
        }

        return `${boundary}${text}`
    }


    /**
     * Converts a table row. Most of the work is done in tablecell, however
     * that can't tell if the cell is at the end of a row or not. Get the
     * first cell's leading boundary and remove the double-boundary marks.
     *
     * @param {string} text
     * @return {string}
     */
    tablerow(text: string): string {
        let boundary

        boundary = text.match(/^\|*/)

        if (boundary) {
            boundary = boundary[0]
        } else {
            boundary = '|'
        }

        return `${text}${boundary}\n`
    }


    /**
     * Simple text.
     *
     * @param {string} text
     * @return {string}
     */
    text(text: string): string {
        return text
    }
}


/**
 * Set up a default URI rewriter
 *
 * @param {string} href
 * @return {string}
 */
function defaultHrefRewrite(href: string): string {
    return href
}

export function convert(markdown: Buffer | string, partialOptions: Partial<RenderOptions> = {}): string {
    const options: RenderOptions = {
        marked: {},
        codeLanguageMap: defaultLanguageMap,
        codeStyling: {
            theme: 'RDark',
            linenumbers: true
        },
        codeCollapseAt: 20,
        linkRewrite: defaultHrefRewrite,
        imageRewrite: defaultHrefRewrite,
        ...partialOptions
    }

    // Always override this one property.
    options.marked.renderer = new ConfluenceRenderer(options)

    // Convert Buffers to strings.
    const markdownString = markdown.toString()
        // Replace "\r\n" and "\r" with "\n".
        .replace(/\r\n?/g, '\n')

    return marked(markdownString, options.marked).trim()
        // Fix the \r placeholder for list beginnings. See list() for more info.
        .replace(/\r/g, '')
        // Remove trailing whitespace.
        .trim()
}

export { defaultLanguageMap }

export default convert
