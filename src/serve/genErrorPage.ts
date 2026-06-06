import type { IncomingMessage } from 'http';

interface ErrorPageOptions {
    error: any;
    req: IncomingMessage;
    url: string;
    context: any;
}

export function genErrorPage({ error, req, url, context }: ErrorPageOptions): string {
    const messageShort = (error.message || '').slice(0, 50);
    const errorName = error.name || 'Error';
    const errorMessage = error.message || '';
    const stackTrace = error.stack || 'Стек трейс отсутствует';

    const cookiesJson = JSON.stringify(context.cookies, null, 2);
    const headersJson = JSON.stringify(req.headers, null, 2);

    return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>💥 SSR Debugger: ${messageShort}</title>
        <style>
            :root {
                --bg: #0f172a;
                --panel-bg: #1e293b;
                --text: #f1f5f9;
                --text-muted: #94a3b8;
                --red: #f43f5e;
                --amber: #f59e0b;
                --cyan: #06b6d4;
                --code-bg: #020617;
            }
            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                padding: 30px;
                margin: 0;
                line-height: 1.5;
            }
            .badge {
                background: var(--red);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .error-title {
                font-size: 28px;
                color: #ffffff;
                margin: 15px 0 5px 0;
                font-weight: 700;
                word-break: break-word;
            }
            .error-sub {
                color: var(--red);
                font-size: 18px;
                margin-bottom: 30px;
            }
            .grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 25px;
            }
            @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
            .panel {
                background: var(--panel-bg);
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                border: 1px solid #334155;
            }
            .panel-title {
                font-size: 16px;
                font-weight: bold;
                color: var(--cyan);
                margin-top: 0;
                margin-bottom: 15px;
                border-bottom: 1px solid #334155;
                padding-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            pre {
                background: var(--code-bg);
                padding: 15px;
                border-radius: 6px;
                overflow-x: auto;
                font-size: 13px;
                color: #e2e8f0;
                border: 1px solid #1e293b;
                margin: 0;
                white-space: pre-wrap;
                word-break: break-all;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
            }
            .info-table td {
                padding: 8px 0;
                border-bottom: 1px solid #334155;
                font-size: 13px;
                vertical-align: top;
            }
            .info-table td:first-child {
                color: var(--text-muted);
                width: 30%;
                font-weight: bold;
            }
            .info-table tr:last-child td { border: none; }
        </style>
    </head>
    <body>
        <div style="margin-bottom: 20px;">
            <span class="badge">Vue SSR Error</span>
        </div>
        <div class="error-title">${errorName}</div>
        <div class="error-sub">${errorMessage}</div>

        <div class="grid">
            <div class="panel">
                <div class="panel-title">Стек вызовов (Stack Trace)</div>
                <pre><code>${stackTrace}</code></pre>
            </div>

            <div style="display: flex; flex-direction: column; gap: 25px;">
                <div class="panel">
                    <div class="panel-title">Данные запроса</div>
                    <table class="info-table">
                        <tr><td>URL</td><td style="color: var(--amber);">${url}</td></tr>
                        <tr><td>Method</td><td>${req.method || 'GET'}</td></tr>
                        <tr><td>Client IP</td><td>${context.ip || 'unknown'}</td></tr>
                        <tr><td>Status</td><td>${context.statusCode}</td></tr>
                    </table>
                </div>

                <div class="panel">
                    <div class="panel-title">Cookies</div>
                    <pre style="font-size: 11px; max-height: 200px;">${cookiesJson}</pre>
                </div>

                <div class="panel">
                    <div class="panel-title">HTTP Headers</div>
                    <pre style="font-size: 11px; max-height: 300px;">${headersJson}</pre>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}