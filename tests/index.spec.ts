import {fetch, testsConfig} from "../scripts/jest.setup";

describe("SSR", () => {
    const url = new URL(testsConfig.host);

    it("ssr 200", async() => {
        const response = await fetch(url.toString());

        expect(response.headers.get("content-type")).toContain("text/html");
        expect(response.ok).toEqual(true);
    });
    it("ssr body", async() => {
        const response = await fetch(url.toString());
        const body = await response.text();

        expect(body).toContain("Hello World!");
        expect(response.ok).toEqual(true);
    });
});

describe("Client", () => {
    beforeAll(async() => {
        await page.goto(testsConfig.host);
    });
    it(`should be titled "Test vite-ssr-vue app"`, async() => {
        await expect(page.title()).resolves.toMatch("Test vite-ssr-vue app");
    });
    it(`should display "Hello World!" text on page`, async() => {
        await expect(page).toMatch("Hello World!");
    });
});