describe("SSR", () => {
    const url = new URL("http://localhost:3000");

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
})