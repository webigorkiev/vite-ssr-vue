/**
 * Get file type by extension
 * @param file
 */
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
// TODO находит только динамические зависимости
// TODO основной чанк вроде /assets/index-Dl-OT3Uw.js и /assets/index-DM2ukRVC.css отсутствует в манифесте
export const findDependencies = (
    modules: string[],
    manifest: Record<string, string[]>,
    shouldPreload?:(file: string, type: string) => boolean,
    shouldPrefetch?:(file: string, type: string) => boolean
): {
    preload: Array<string>,
    prefetch: Array<string>
} => {
    const preload = new Set<string>();
    const prefetch = new Set<string>();

    for(const id of modules || []) {
        for(const file of manifest[id] || []) {
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

    for(const id of Object.keys(manifest)) {
        for(const file of manifest[id]) {
            if(!preload.has(file)) {
                const asType = fileType(file);

                // by default no prefetch links
                if(!shouldPrefetch) {
                    continue;
                }

                if(shouldPrefetch && !shouldPrefetch(file, asType)) {
                    continue;
                }

                prefetch.add(file);
            }
        }
    }

    return {preload: [...preload], prefetch: [...prefetch]};
};

// TODO разобраться с типами файлов
export const renderPreloadLinks = (files: string[]): Array<string> => {
    const link = [];

    for(const file of files || []) {
        const asType = fileType(file);
        const ext = file.split(".").pop()?.toLowerCase() || "";

        if(asType === "script") {
            link.push(`<link rel="modulepreload" crossorigin href="${file}">`); // Правильно (основной файл js подключает уже готовые модули)
        } else if(asType === "style") {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
            link.push(`<link rel="stylesheet" href="${file}">`); // Не правильно, просто подключается файл
        } else if(asType === "font") {
            link.push(`<link rel="stylesheet" href="${file}" type="font/${ext}" crossorigin>`); // Не правильно
        } else {
            link.push(`<link rel="stylesheet" href="${file}">`); // Определяются типы "script"|"style"|"font"|"image" // TODO типы не расширяемые
        }
    }

    return link;
};

/**
 * Form Prefetch links
 * @param files
 * @returns array of strings html
 */
export const renderPrefetchLinks = (files: string[]): Array<string> => {
    const link = [];

    for(const file of files || []) {
        link.push(`<link rel="prefetch" href="${file}">`);
    }

    return link;
};
