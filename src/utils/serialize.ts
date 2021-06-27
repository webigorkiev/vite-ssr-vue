const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g
const ESCAPED_CHARS = {
    "<": "\\u003C",
    ">": "\\u003E",
    "/": "\\u002F",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
}
const escape = (unsafeChar: string) => {

    return ESCAPED_CHARS[unsafeChar as keyof typeof ESCAPED_CHARS];
}

/**
 * Serialize state
 * @param state
 * @returns JSON string
 */
export const serialize = (state: any): string => {
    try {

        return JSON.stringify(JSON.stringify(state || {}))
            .replace(
                UNSAFE_CHARS_REGEXP,
                escape
            );
    } catch(e) {

        throw new Error(`[SSR] On state serialization - ${e.message}`);
    }
}

/**
 * Unserialize state
 * @param state
 * @returns unserialize JSON
 */
export const unserialize = (state: string): any => {
    try {

        return JSON.parse(state || "{}")
    } catch(e) {

        throw new Error(`[SSR] On state unserialization - ${e.message}`);
    }
}
