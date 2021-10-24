import crossFetch from "cross-fetch";

const testsConfig = {
    mode: "development",
    host: "http://localhost:3000",
};
const fetch = async(
    input: RequestInfo,
    init: RequestInit = {}
) => crossFetch(input, Object.assign({}, init));

// Fix: Augmentations for the global scope can only be directly nested in external modules or ambient module declarations
export {testsConfig, fetch};