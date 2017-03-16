Heading 1
=========

This is a paragraph of text. So far pretty uninteresting.
If you have GFM enabled, this should be on the next line.


## Subheading (level 2)

> Amazing things happen when people work together!

The above is a quote.


## Formatting

Strikethrough text looks ~~amazing~~ acceptable.

Bolded text is really called **strong**. Italicized text shows *emphasis*.


## Code Blocks

```javascript
// This is JavaScript
console.log("This is JavaScript");
```

And `code()` within normal text is ok too.

    Code without a language should not have special formatting.


## Lists

Careful with lists. There needs to be two blank lines after the ordered list otherwise the ordered list thinks it continues with the unordered list.

1. Ordered list
2. Second item


* Unordered list
* Second item

This list is a bit more complex.

* Heading, unordered
    1. Subheading, ordered
        * Third item, unordered
    2. Subheading 2
        1. Alternate third item, ordered


## Tables

| Heading 1       | Heading 2       |
|-----------------|-----------------|
| Row 1, Column 1 | Row 1, Column 2 |
| Row 2, Column 1 | Row 2, Column 2 |


## Other

This is a horizontal rule.

---

Here is another.

----------

![broken image][IMG] <-- That is a broken image to [this url][IMG] and the "broken_image" alt text is unfortunately lost.

[IMG]: http://example.com/broken-image.png


## Broken Features

<div>
    HTML is copied directly to the text without conversion. HTML tags will be seen in the resulting page.
</div>
