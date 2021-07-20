/**
 * Parse coockie string to object
 * @param str
 */
export const cookieParse =  (str: string| undefined): Record<string, any> => {

    if(!str) {
        return  {};
    }

    return str.split(/; */).reduce((obj: Record<string, any>, str) => {

        if(str === "") {
            return obj;
        }
        const eq = str.indexOf('=');
        const key: string = eq > 0 ? str.slice(0, eq) : str;
        let val = eq > 0 ? str.slice(eq + 1) : null;

        if(val != null) {
            try {
                val = decodeURIComponent(val);
            } catch(ex) { /* pass */ }
        }
        obj[key] = val;

        return obj;
    }, {});
};