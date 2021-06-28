/**
 * Find last script type="module" from template
 * @param template
 */
export const entryFromTemplate = (template: string) => {
    const matches = template
        .substr(template.lastIndexOf('script type="module"'))
        .match(/src="(.*)">/i);

    return matches?.[1];
};