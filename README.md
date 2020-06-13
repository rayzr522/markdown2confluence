<h1 align="center">Markdown2Confluence</h1>
<p align="center">
    <a href="https://npmjs.org/package/@rayzr/minecraft2confluence">
        <img alt="npm version" src="https://img.shields.io/npm/v/@rayzr/markdown2confluence.svg"/>
    </a>
    <a href="https://david-dm.org/Rayzr522/markdown2confluence">
        <img alt="dependencies" src="https://img.shields.io/david/Rayzr522/markdown2confluence.svg"/>
    </a>
    <a href="https://david-dm.org/Rayzr522/markdown2confluence#info=devDependencies">
        <img alt="dev dependencies" src="https://img.shields.io/david/dev/Rayzr522/markdown2confluence.svg"/>
    </a>
</p>

> Convert [Markdown] to [Confluence Wiki Markup]. This is an updated version of [markdown2confluence-cws](https://github.com/connected-world-services/markdown2confluence-cws), which is a continuation of the original [markdown2confluence](https://github.com/chunpu/markdown2confluence) project.

## Overview

Using [Markdown] is fast becoming a standard for open-source projects and their documentation. There are a few variants, such as [GitHub Flavored Markdown], which add additional features.

Atlassian's Confluence has a different way of writing documentation, according to their [Confluence Wiki Markup] and [later pages](https://confluence.atlassian.com/display/DOC/Confluence+Wiki+Markup) and [references](https://roundcorner.atlassian.net/secure/WikiRendererHelpAction.jspa?section=all).

This project contains a library and a command-line tool that bridges the gap and converts from Markdown to Confluence.


## Library Use

Use `npm` to install this package easily.

```bash
$ npm install --save @rayzr/markdown2confluence
```

Now you write some JavaScript to load Markdown content and convert.

```js
// Import the module
const { convert } = require('@rayzr/markdown2confluence')
// You can also import as 'markdown2confluence' and then do 'markdown2confluence.convert'

// Read some input
const markdownInput = fs.readFileSync("README.md")

// Convert to Confluence format
const confluenceOutput = convert(markdownInput)

// Converted!
console.log(confluenceOutput)
```

Alternately, you can use TypeScript as well.

```ts
// Import the module
import convert from '@rayzr/markdown2confluence'

// Read some input
const markdownInput = fs.readFileSync("README.md")

// Convert to Confluence format
const confluenceOutput = markdown2confluence(markdown)

// Converted!
console.log(confluenceOutput)
```

This uses the wonderful [marked](https://www.npmjs.com/package/marked) library to parse and reformat the Markdown text. Because of this, you are welcome to pass additional options to the conversion function. See the marked package for options. Besides configuring marked, you can also change additional behavior.

```js
// Showing how to set two of the options for the marked library.
confluence = convert(markdown, {
    // When code has more than this many lines, set the collapse property
    // so Confluence shows a shorter block of code.
    codeCollapseAt: 20,

    // Map between Markdown and Confluence languages. There's a healthy
    // number of these defined. Setting this property overrides the
    // default mapping. If you want to augment the map, you could
    // add them to markdown2confluence.defaultLanguageMap.
    codeLanguageMap: {
        markdownLanguage: 'confluenceLanguage'
    },

    // Additional code styling options.
    codeStyling: {
        linenumbers: true,
        theme: 'RDark'
    },

    // Rewrite image urls using your own custom logic.
    imageRewrite: href => {
        return href
    },

    // Rewrite link urls using your own custom logic.
    linkRewrite: href => {
        return href
    },

    // These options are passed to marked.
    marked: {
        gfm: true,
        tables: true
    }
})
```

## Supported Markdown

The aim of this library is to convert as much Markdown to Confluence Wiki Markup. As such, most Markdown is supported but there are going to be rare cases that are not supported (such as code blocks within lists) or other scenarios that people find.

If it is possible to convert the Markdown to Confluence Wiki Markup (without resorting to HTML), then this library should be able to do it. If you find anything wrong, it is likely a bug and should be reported. I would need a sample of Markdown, the incorrect translation and the correct way to represent that in Confluence. Please file an issue with this information in order to help replicate and fix the issue.

A good demonstration chunk of markdown is available in [demo.md](demo.md).

**What does not work?**

* HTML. It is copied verbatim to the output text.
* Did you find anything else? Please tell us about it by opening an issue.


## License

This software is licensed under an [ISC license][LICENSE].


[Markdown]: http://daringfireball.net/projects/markdown/syntax
[Confluence Wiki Markup]: https://confluence.atlassian.com/display/CONF42/Confluence+Wiki+Markup
[GitHub Flavored Markdown]: https://guides.github.com/features/mastering-markdown/
[LICENSE]: LICENSE.md
