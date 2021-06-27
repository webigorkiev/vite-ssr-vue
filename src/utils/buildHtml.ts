const defaultHtmlParts = [
    "headTags",
    "body",
    "bodyAttrs",
    "htmlAttrs",
    "initialState",
].reduce(
    (acc, item) => ({ ...acc, [item]: `\${${item}}` }),
    {} as Record<string, string>
)

/**
 * Replace replace inserts to the value or!!! to the name of params
 * @param template
 * @param parts
 * @returns html strings
 */
export const buildHtml = (template: string, parts = defaultHtmlParts): string => {

    return template
        .replace("<html", `<html ${parts.htmlAttrs} `)
        .replace("<body", `<body ${parts.bodyAttrs} `)
        .replace("</head>", `${parts.headTags}\n</head>`)
        .replace(
            "<div id=\"app\"></div>",
            `<div id="app" data-server-rendered="true">${parts.body}</div>\n\n<script>window.__INITIAL_STATE__=${parts.initialState}</script>`
        )
}
