import {parse} from "node-html-parser";

/**
 * Add teleports to html
 * @param body
 * @param teleports
 */
export const teleportsInject = (body: string, teleports: Record<string, any> = {}): string => {
    const teleportsKeys = Object.keys(teleports);

    if(teleportsKeys.length) {
        const root = parse(body, {comment: true});

        teleportsKeys.map((key:string) => {
            const el = root.querySelector(key);

            if(el) {

                if(el.childNodes) {
                    el.childNodes.unshift(parse(teleports[key], {comment: true}));
                } else {
                    el.appendChild(parse(teleports[key], {comment: true}));
                }
            }
        });

        return root.toString();
    }

    return body;
};