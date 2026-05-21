const fileType = (file: string): "script"|"style"|"font"|"image"| "" => {
    const ext = file.split(".").pop()?.toLowerCase() || "";

    if(ext === "js") {
        return "script";
    } else if(ext === "css") {
        return "style";
    } else if(/jpe?g|png|svg|gif|webp|ico/.test(ext)) {
        return "image";
    } else if(/woff2?|ttf|otf|eot/.test(ext)) {
        return "font";
    }

    return "";
};

// Find addition dependencies
export const findDependencies = (
    modules: string[],
    ssrManifest: Record<string, string[]>,
    shouldPreload?:(file: string, type: string) => boolean,
    shouldPrefetch?:(file: string, type: string) => boolean
): {
    preload: Array<string>,
    prefetch: Array<string>
} => {
    const preload = new Set<string>();
    const prefetch = new Set<string>();

    for(const id of modules || []) {
        for(const file of ssrManifest[id] || []) {
            const asType = fileType(file);

            // by default only scripts or css
            if(!shouldPreload && asType !== "script" && asType !== "style") {
                continue;
            }

            if(typeof shouldPreload === "function" && !shouldPreload(file, asType)) {
                continue;
            }
            preload.add(file);
        }
    }
    for(const id of Object.keys(ssrManifest)) {
        for(const file of ssrManifest[id]) {
            if(!preload.has(file)) {
                const asType = fileType(file);
                if(!shouldPrefetch) { // by default no prefetch links
                    continue;
                }
                if(shouldPrefetch && !shouldPrefetch(file, asType)) {
                    continue;
                }
                prefetch.add(file);
            }
        }
    }
    // Сортировка файлов по типу
    const priority: Record<string, number> = {
        "font": 1,
        "style": 2,
        "image": 3,
        "script": 4,
        "": 5
    };
    const preloadSorted = [...preload].sort((a, b) => {
        const typeA = fileType(a);
        const typeB = fileType(b);
        const priorityA = priority[typeA] ?? 99;
        const priorityB = priority[typeB] ?? 99;
        return priorityA - priorityB;
    });
    const prefetchSorted = [...prefetch].sort((a, b) => {
        const typeA = fileType(a);
        const typeB = fileType(b);
        const priorityA = priority[typeA] ?? 99;
        const priorityB = priority[typeB] ?? 99;
        return priorityA - priorityB;
    });

    return {preload: preloadSorted, prefetch: prefetchSorted};
};

// TODO разобраться с типами файлов
export const renderPreloadLinks = (files: string[]): Array<string> => {
    const links = [];

    for(const file of files || []) {
        const asType = fileType(file);
        const ext = file.split(".").pop()?.toLowerCase() || "";

        //  Тут реч идет о динамических зависимостях (мы загружаем то, что зависит от роута)
        if(asType === "script") {
            links.push(`<link rel="modulepreload" crossorigin href="${file}">`); // Правильно (основной файл js подключает уже готовые модули)
        } else if(asType === "style") {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
            links.push(`<link rel="stylesheet" href="${file}">`); // TODO Не правильно, просто подключается файл // Возможно так просто быстрее
        } else if(asType === "font") {
            links.push(`<link rel="stylesheet" href="${file}" type="font/${ext}" crossorigin>`); // TODO Не правильно // Скорее всего шрифт так и не загрузится
        } else {
            links.push(`<link rel="stylesheet" href="${file}">`); // Определяются типы "script"|"style"|"font"|"image" // TODO типы не расширяемые
        }
    }

    return links;
};

// HTML for prefetch links
export const renderPrefetchLinks = (files: string[]): Array<string> => {
    const link = [];

    for(const file of files || []) {
        link.push(`<link rel="prefetch" href="${file}">`);
    }

    return link;
};

// Основные чанки для index.html
export const findIndexHtmlDependencies = (manifest: Record<string, any>,): string[] => {
    const output: string[] = [];
    const indexHtmlDependencies = manifest["index.html"] || {};
    indexHtmlDependencies.css && indexHtmlDependencies.css.length && output.push(...indexHtmlDependencies.css); // Сначала всегда css
    indexHtmlDependencies.file && output.push(indexHtmlDependencies.file);
    // Файлы в манифесте без открывающего слеша
    output.forEach((file, index) => {
        if(!/^\//.test(file)) {
            output[index] = `/${file}`;
        }
    })
    return output;
}

export const renderPreloadLinksIndexHtml = (files: string[]) => {
    const links = [];
    for(const file of files || []) {
        const asType = fileType(file);
        if(asType === "script") {
            links.push(`<link rel="modulepreload" crossorigin href="${file}">`); // Правильно (основной файл js подключает уже готовые модули)
        } else if(asType === "style") {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
            links.push(`<link rel="preload" href="${file}" as="style">`);
        }
    }

    return links;
}
