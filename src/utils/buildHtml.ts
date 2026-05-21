const defaultHtmlParts = [
    "headTags",
    "headPreloadTags",
    "body",
    "bodyAttrs",
    "htmlAttrs",
    "initialState",
].reduce(
    (acc, item) => ({ ...acc, [item]: `\${${item}}` }),
    {} as Record<string, string>
);

export const buildHtml = (template: string, parts = defaultHtmlParts): string => {
    return template
        .replace("<html", `<html${parts.htmlAttrs}`)
        .replace("<body", `<body${parts.bodyAttrs}`)
        .replace("<head>", `<head>${parts.headPreloadTags ? `\n${parts.headPreloadTags}`: ""}`)
        .replace("</head>", `${parts.headTags ? `${parts.headTags}\n`: ""}</head>`)
        .replace(
            "<div id=\"app\"></div>",

            // eslint-disable-next-line max-len
            `<div id="app" data-server-rendered="true">${parts.body}</div><script>window.__INITIAL_STATE__=${parts.initialState}</script>`
        );
};
