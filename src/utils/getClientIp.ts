import type http from "node:http";

export const getClientIp = (req: http.IncomingMessage) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        if (Array.isArray(forwarded)) {
            return forwarded[0]?.split(',')[0].trim();
        }
        return forwarded.split(',')[0].trim();
    }
    const rawIp = req.socket.remoteAddress;
    if (rawIp === '::1') {
        return '127.0.0.1';
    }
    if (rawIp && rawIp.startsWith('::ffff:')) {
        return rawIp.split('::ffff:')[1];
    }
    return rawIp || "";
};