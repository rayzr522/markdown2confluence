import marked from 'marked'

import { defaultLanguageMap } from './language-map'
import { ConfluenceRenderer, RenderOptions } from './renderer'

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

    const renderer = new ConfluenceRenderer(options)

    // Convert Buffers to strings.
    const markdownString = markdown.toString()
        // Replace "\r\n" and "\r" with "\n".
        .replace(/\r\n?/g, '\n')

    return marked(markdownString, {...options.marked, renderer}).trim()
        // Fix the \r placeholder for list beginnings. See list() for more info.
        .replace(/\r/g, '')
        // Remove trailing whitespace.
        .trim()
}

export { defaultLanguageMap }

export default convert
