import marked from 'marked'
import ent from 'ent'

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
        // Replace existing HTML entity codes with things that will be ignored by ent
        .replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/ig, '&\0$1;')

    const renderedConfluence = marked(markdownString, {...options.marked, renderer}).trim()
        // Fix the \r placeholder for list beginnings. See list() for more info.
        .replace(/\r/g, '')
        // Remove trailing whitespace.
        .trim()

    return ent.decode(renderedConfluence)
        // Put intentional HTML entity codes back :)
        .replace(/&\0([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/ig, '&$1;')
}

export { defaultLanguageMap }

export default convert
