// Parse cookie to object
export const cookieParse =  (str: string| undefined): Record<string, string> => {
    if(!str) {
        return  {};
    }
    return str
        .split(/; */)
        .reduce((obj, part) => {
            const eq = part.indexOf('=');
            const key = (eq >= 0 ? part.slice(0, eq) : part).trim();
            if(!key) {
                return obj;
            }
            const val = (eq >= 0 ? part.slice(eq + 1) : "").trim();
            try {
                obj[key] = decodeURIComponent(val);
            } catch {
                obj[key] = val;
            }
            return obj;
        }, {} as Record<string, string>);
};