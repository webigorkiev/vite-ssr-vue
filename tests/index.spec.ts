import {fetch, testsConfig} from "../scripts/jest.setup";

/**
 * Admin navigation array
 */
describe("Admin/Index::navigation", () => {
    const url = new URL(testsConfig.host + "/");

    it("ssr", async() => {
        const response = await fetch(url.toString());

        expect(response.headers.get("content-type")).toContain("text/html");
        expect(response.ok).toEqual(true);
    });
});