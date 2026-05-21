const defaultHtmlParts = [
    "headTags",
    "body",
    "bodyAttrs",
    "htmlAttrs",
    "initialState",
].reduce(
    (acc, item) => ({ ...acc, [item]: `\${${item}}` }),
    {} as Record<string, string>
);

// TODO проблема что мы внедряем дополнительные head теги + в </head>
// Это после загрузки основного js и стилей
// HTML уже дополнен и мы добавляем только в конец </head>
export const buildHtml = (template: string, parts = defaultHtmlParts): string => {

    return template
        .replace("<html", `<html${parts.htmlAttrs}`)
        .replace("<body", `<body${parts.bodyAttrs}`)
        .replace("</head>", `${parts.headTags ? `${parts.headTags}\n`: ""}</head>`) // TODO
        .replace(
            "<div id=\"app\"></div>",

            // eslint-disable-next-line max-len
            `<div id="app" data-server-rendered="true">${parts.body}</div><script>window.__INITIAL_STATE__=${parts.initialState}</script>`
        );
};
