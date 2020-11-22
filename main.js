const { info } = require("console");
const marked = require("marked")
const fs = require('fs').promises;
const mdFilePath = "assets/presentation.md"
const cssFilePath = "assets/presentation.css"
const jsFilePath = "assets/presentation.js"
const outputPath = "assets/presentation.html"
const attrs_matcher = /\&lt;\&lt;\S*\&gt;\&gt;/g
const fontawesome_matcher = /\[\[[^\n]*\]\]/g

const renderer = {
    heading(text, level) {
        const fontawesome_loaded = loadFontAwesome(text)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<h${level} class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</h${level}>`
    },
    code(code, infostring, escaped) {
        const fontawesome_loaded = loadFontAwesome(infostring)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const language_class = attrs_loaded.without_attrs ? "language-" + attrs_loaded.without_attrs : ""
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<pre><code class="${language_class} ${classes}" id="${ids}">${code}</code></pre>`
    },
    blockquote(quote) {
        const fontawesome_loaded = loadFontAwesome(quote)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<p><code class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</code></p>`
    },
    listitem(text, task, checked) {
        const fontawesome_loaded = loadFontAwesome(text)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<p class="list ${classes}" id="${ids}"><i class="list-icon fas fa-caret-right"></i>${attrs_loaded.without_attrs}</p>`
    },
    paragraph(text) {
        const fontawesome_loaded = loadFontAwesome(text)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<p class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</p>`
    },
    tablecell(content, flags) {
        const fontawesome_loaded = loadFontAwesome(content)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        const tag = flags.header ? "th" : "td"
        return `<${tag} class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</${tag}>`
    },
    hr() {
        return `</div><div class="slide">`
    },
    image(href, title, text) {
        const fontawesome_loaded = loadFontAwesome(text)
        const attrs_loaded = loadAttrs(fontawesome_loaded)
        const classes = attrs_loaded.attrs.class.join(" ")
        const ids = attrs_loaded.attrs.id.join(" ")
        return `<img class="${classes}" id="${ids}" src="${href}" alt="${attrs_loaded.without_attrs}">`
    }
}
marked.use({
  renderer,
  gfm: true
})

const loadAttrs = text => {
    const attrs_segments = text.match(attrs_matcher)
    if(!attrs_segments) return {
        is_found_attrs: false,
        without_attrs: text,
        attrs: {
            class: [],
            id: []
        }
    }

    const without_attrs = text.replace(attrs_matcher, "")
    const attrs = getClassAndId(attrs_segments.join(""))

    return {
        is_found_attrs: true,
        without_attrs,
        attrs
    }
}

const loadFontAwesome = text => {
    const matched = text.match(fontawesome_matcher)
    let loaded = text
    if(matched) for(const match of matched) {
        const fontawesome_classes = match.replace(/\[|\]/g, "")
        const fontawesome = `<i class="${fontawesome_classes}"></i>`
        loaded = loaded.replace(match, fontawesome)
    }

    return loaded
}

const getClassAndId = text => {
    const attributes = text.replace(/\&lt;|\&gt;/g, "").split(/(?=\.)|(?=\#)/)
    let classes = []
    let ids = []

    for(const attr of attributes) {
        if(attr[0] == ".") classes.push(attr.slice(1))
        else if(attr[0] == "#") ids.push(attr.slice(1))
    }

    return {
        class: classes,
        id: ids
    }
}

const main = async () => {
    const markdown = await fs.readFile(mdFilePath, "utf-8")
    const css = (await fs.readFile(cssFilePath, "utf-8")).replace(/\n/g, "")
    const js = (await fs.readFile(jsFilePath, "utf-8"))

    const generated_html = marked(markdown)
    const header = `<head>
    <meta http-equiv="content-type" charset="utf-8">
    <script src="https://code.jquery.com/jquery-3.0.0.min.js"></script>
    <script src="https://kit.fontawesome.com/93db328445.js" crossorigin="anonymous"></script>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100&family=M+PLUS+1p:wght@300&display=swap" rel="stylesheet">
    <style type="text/css">${css}</style>
    <script>${js}</script>
</head>`

    await fs.writeFile(outputPath, `<!DOCTYPE html>\n<html>\n${header}\n<body>\n<div class="slide">${generated_html}</div>\n</body>\n</html>`)

}

main()