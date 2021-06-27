export const createUrl = (url?: string | URL) => {
    url = url || "/";

    if(url instanceof URL) {

        return url;
    }

    if (!(url || '').includes('://')) {

        url = 'http://e.g' + (url.startsWith("/") ? url : `/${url}`);
    }

    return new URL(url);
}