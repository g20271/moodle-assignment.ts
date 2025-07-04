import fetch, { RequestInit, Response } from 'node-fetch';

export class ApiClient {
    private readonly baseUrl: string;
    private cookieMap: Map<string, string> = new Map();

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    public async get(path: string, options: RequestInit = {}): Promise<Response> {
        return this.request(path, { ...options, method: 'GET' });
    }

    public async post(path: string, body: any, options: RequestInit = {}): Promise<Response> {
        return this.request(path, { ...options, method: 'POST', body });
    }

    private async request(path: string, options: RequestInit): Promise<Response> {
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
        
        const mergedOptions: RequestInit = {
            ...options,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Node.js) Moodle-Client/2.0',
                ...options.headers,
                'Cookie': this.getCookieString(),
            },
        };
        
        const response = await fetch(url, mergedOptions);
        this.updateCookies(response);
        return response;
    }

    private updateCookies(response: Response): void {
        const setCookieHeaders = response.headers.raw()['set-cookie'];
        if (!setCookieHeaders) {
            return;
        }
        
        setCookieHeaders.forEach(cookieString => {
            const [nameValue] = cookieString.split(';');
            const [name, value] = nameValue.split('=', 2);
            if (name && value) {
                this.cookieMap.set(name.trim(), value.trim());
            }
        });
    }

    private getCookieString(): string {
        return Array.from(this.cookieMap)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
    }
}
