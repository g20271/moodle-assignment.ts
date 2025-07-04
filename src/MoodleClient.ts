import { ApiClient } from './http/ApiClient';
import { Authenticator } from './auth/Authenticator';
import { MoodleApiService } from './services/MoodleApiService';
import { Session } from './session/Session';
import { Assignment } from './models/Assignment';
import { Course } from './models/Course';

export { Assignment, Course }; // モデルもエクスポートして利用者が型を使えるようにする

export class MoodleClient {
    private readonly apiClient: ApiClient;
    private readonly authenticator: Authenticator;
    private session?: Session;
    private apiService?: MoodleApiService;

    constructor(baseUrl: string) {
        this.apiClient = new ApiClient(baseUrl);
        this.authenticator = new Authenticator(this.apiClient);
    }

    public async login(username: string, password: string): Promise<void> {
        console.log('[INFO] Logging in...');
        this.session = await this.authenticator.login(username, password);
        this.apiService = new MoodleApiService(this.apiClient, this.session);
        console.log('[INFO] Login successful. Session is ready.');
    }

    private ensureReady(): void {
        if (!this.session || !this.apiService) {
            throw new Error('Client is not logged in. Please call login() first.');
        }
    }

    public async getAssignments(options: { from?: Date, to?: Date, limit?: number } = {}): Promise<Assignment[]> {
        this.ensureReady();
        const now = Math.floor(Date.now() / 1000);
        const oneYearLater = now + (365 * 24 * 60 * 60);

        const startTime = options.from ? Math.floor(options.from.getTime() / 1000) : now;
        const endTime = options.to ? Math.floor(options.to.getTime() / 1000) : oneYearLater;
        const limit = options.limit || 50;

        const rawAssignments = await this.apiService!.getAssignments(startTime, endTime, limit);
        return rawAssignments.map(data => new Assignment(data));
    }

    public async getAllAssignments(): Promise<Assignment[]> {
        return this.getAssignments({});
    }

    public async getTodayAssignments(): Promise<Assignment[]> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return this.getAssignments({ from: start, to: end });
    }

    public async getOverdueAssignments(): Promise<Assignment[]> {
        // Moodle APIの`overdue`フラグは未来の課題には適用されないため、
        // 過去から現在までの課題を取得してフィルタリングするのが確実
        const distantPast = new Date();
        distantPast.setFullYear(distantPast.getFullYear() - 1);
        
        const allPastAssignments = await this.getAssignments({ from: distantPast, to: new Date() });
        return allPastAssignments.filter(a => a.isOverdue);
    }
}
