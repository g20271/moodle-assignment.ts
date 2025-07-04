import { ApiClient } from '../http/ApiClient';
import { Session } from '../session/Session';
import { ApiError } from '../errors/ApiError';
import { HtmlParser } from '../utils/HtmlParser';
import { RawAssignmentEvent } from '../models/Assignment';

export class MoodleApiService {
    private apiClient: ApiClient;
    private session: Session;

    constructor(apiClient: ApiClient, session: Session) {
        this.apiClient = apiClient;
        this.session = session;
    }

    public async getAssignments(from: number, to: number, limit: number = 50): Promise<RawAssignmentEvent[]> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_action_events_by_timesort',
            args: { limitnum: limit, timesortfrom: from, timesortto: to, limittononsuspendedevents: true }
        }];
        const data = await this.callApi(body, 'core_calendar_get_action_events_by_timesort');
        return data.events || [];
    }

    private async callApi(body: object, info: string, retryCount: number = 0): Promise<any> {
        if (retryCount > 1) {
            throw new ApiError('API call failed after retrying with a new session key.');
        }

        const path = `/lib/ajax/service.php?sesskey=${this.session.sesskey}&info=${info}`;
        const response = await this.apiClient.post(path, JSON.stringify(body), {
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        });
        
        const data: any = await response.json();

        if (data[0]?.error) {
            const exception = data[0].exception;
            if (this.isSessionError(exception)) {
                console.warn('[WARN] Session key seems to be expired. Attempting to refresh.');
                await this.refreshSesskey();
                return this.callApi(body, info, retryCount + 1);
            }
            throw new ApiError(exception?.message || 'An unknown API error occurred.');
        }

        return data[0].data;
    }

    private async refreshSesskey(): Promise<void> {
        const response = await this.apiClient.get('/my/');
        const html = await response.text();
        const newSesskey = HtmlParser.extractSesskey(html);
        if (!newSesskey) {
            throw new ApiError('Failed to refresh session key. The main session might have expired.');
        }
        this.session.updateSesskey(newSesskey);
    }

    private isSessionError(exception: any): boolean {
        if (!exception || typeof exception.errorcode !== 'string') return false;
        return exception.errorcode.toLowerCase().includes('invalidsesskey') ||
               exception.errorcode.toLowerCase().includes('requirelogin');
    }
}
