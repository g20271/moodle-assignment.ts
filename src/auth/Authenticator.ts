import { ApiClient } from '../http/ApiClient';
import { HtmlParser } from '../utils/HtmlParser';
import { LoginError } from '../errors/LoginError';
import { Session } from '../session/Session';
import { Response } from 'node-fetch';

export class Authenticator {
    private apiClient: ApiClient;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    public async login(username: string, password: string): Promise<Session> {
        const loginToken = await this.fetchLoginToken();
        const redirectResponse = await this.postCredentials(username, password, loginToken);
        const sesskey = await this.fetchSesskeyFromDashboard(redirectResponse);
        return new Session(sesskey);
    }

    private async fetchLoginToken(): Promise<string> {
        const response = await this.apiClient.get('/login/index.php');
        const html = await response.text();
        const token = HtmlParser.extractLoginToken(html);
        if (!token) throw new LoginError('Could not find login token.');
        return token;
    }

    private async postCredentials(username: string, password: string, logintoken: string): Promise<Response> {
        const formData = new URLSearchParams();
        formData.append('anchor', '');
        formData.append('logintoken', logintoken);
        formData.append('username', username);
        formData.append('password', password);

        const response = await this.apiClient.post('/login/index.php', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            redirect: 'manual'
        });

        if (response.status !== 303) {
            throw new LoginError('Login failed. Check username/password or Moodle version.');
        }
        return response;
    }

    private async fetchSesskeyFromDashboard(redirectResponse: Response): Promise<string> {
        const redirectUrl = redirectResponse.headers.get('location');
        if (!redirectUrl) throw new LoginError('No redirect URL found after login.');

        const dashboardResponse = await this.apiClient.get(redirectUrl);
        const html = await dashboardResponse.text();
        const sesskey = HtmlParser.extractSesskey(html);

        if (!sesskey) throw new LoginError('Could not find session key (sesskey) after login.');
        return sesskey;
    }
}
