import { ApiClient } from './http/ApiClient';
import { Authenticator } from './auth/Authenticator';
import { MoodleApiService } from './services/MoodleApiService';
import { Session } from './session/Session';
import { Assignment } from './models/Assignment';
import { Course } from './models/Course';
import { User } from './models/User';
import { Group } from './models/Group';

export { Assignment, Course, User, Group }; // モデルもエクスポートして利用者が型を使えるようにする

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

    // ==================== コース関連メソッド ====================

    /**
     * 全てのコースを取得
     */
    public async getAllCourses(): Promise<Course[]> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getCourses();
        return rawCourses.map(data => new Course(data));
    }

    /**
     * 特定のコースを取得
     */
    public async getCourse(courseId: number): Promise<Course | null> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getCourses({ ids: [courseId] });
        return rawCourses.length > 0 ? new Course(rawCourses[0]) : null;
    }

    /**
     * 進行中のコースを取得
     */
    public async getMyInProgressCourses(): Promise<Course[]> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getEnrolledCoursesByTimeline('inprogress');
        return rawCourses.map(data => new Course(data));
    }

    /**
     * 過去のコースを取得
     */
    public async getMyPastCourses(): Promise<Course[]> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getEnrolledCoursesByTimeline('past');
        return rawCourses.map(data => new Course(data));
    }

    /**
     * 未来のコースを取得
     */
    public async getMyFutureCourses(): Promise<Course[]> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getEnrolledCoursesByTimeline('future');
        return rawCourses.map(data => new Course(data));
    }

    /**
     * 最近アクセスしたコースを取得
     */
    public async getRecentCourses(limit: number = 10): Promise<Course[]> {
        this.ensureReady();
        const rawCourses = await this.apiService!.getRecentCourses(limit);
        return rawCourses.map(data => new Course(data));
    }

    /**
     * コースを検索
     */
    public async searchCourses(searchTerm: string): Promise<Course[]> {
        this.ensureReady();
        const result = await this.apiService!.searchCourses('search', searchTerm);
        return result.courses.map(data => new Course(data));
    }

    // ==================== カレンダー・課題関連メソッド ====================

    /**
     * コース内の課題（カレンダーイベント）を取得
     */
    public async getCourseAssignments(courseId: number, from?: Date, to?: Date): Promise<Assignment[]> {
        this.ensureReady();
        const now = Math.floor(Date.now() / 1000);
        const oneYearLater = now + (365 * 24 * 60 * 60);

        const timesortfrom = from ? Math.floor(from.getTime() / 1000) : now;
        const timesortto = to ? Math.floor(to.getTime() / 1000) : oneYearLater;

        const result = await this.apiService!.getActionEventsByCourse(courseId, timesortfrom, timesortto);
        return result.events.map(event => new Assignment(event));
    }

    /**
     * ID指定で課題（カレンダーイベント）を取得
     */
    public async getAssignmentById(eventId: number): Promise<Assignment> {
        this.ensureReady();
        const result = await this.apiService!.getCalendarEventById(eventId);
        return new Assignment(result.event);
    }

    /**
     * 月別の課題を取得
     */
    public async getMonthlyAssignments(year: number, month: number, courseId?: number): Promise<Assignment[]> {
        this.ensureReady();
        const result = await this.apiService!.getCalendarMonthlyView(year, month, courseId);

        const assignments: Assignment[] = [];
        for (const week of result.weeks) {
            for (const day of week.days) {
                for (const event of day.events) {
                    assignments.push(new Assignment(event));
                }
            }
        }
        return assignments;
    }

    /**
     * 日別の課題を取得
     */
    public async getDailyAssignments(year: number, month: number, day: number, courseId?: number): Promise<Assignment[]> {
        this.ensureReady();
        const result = await this.apiService!.getCalendarDayView(year, month, day, courseId);
        return result.events.map(event => new Assignment(event));
    }

    // ==================== ユーザー関連メソッド ====================

    /**
     * ユーザー名でユーザーを取得
     */
    public async getUserByUsername(username: string): Promise<User | null> {
        this.ensureReady();
        const rawUsers = await this.apiService!.getUsersByField('username', [username]);
        return rawUsers.length > 0 ? new User(rawUsers[0]) : null;
    }

    /**
     * IDでユーザーを取得
     */
    public async getUserById(userId: number): Promise<User | null> {
        this.ensureReady();
        const rawUsers = await this.apiService!.getUsersByField('id', [userId.toString()]);
        return rawUsers.length > 0 ? new User(rawUsers[0]) : null;
    }

    /**
     * メールアドレスでユーザーを取得
     */
    public async getUserByEmail(email: string): Promise<User | null> {
        this.ensureReady();
        const rawUsers = await this.apiService!.getUsersByField('email', [email]);
        return rawUsers.length > 0 ? new User(rawUsers[0]) : null;
    }

    /**
     * ユーザー設定を取得
     */
    public async getUserPreferences(name?: string): Promise<Array<{ name: string; value: string }>> {
        this.ensureReady();
        const result = await this.apiService!.getUserPreferences(name);
        return result.preferences;
    }

    // ==================== グループ・参加者関連メソッド ====================

    /**
     * コースのグループ一覧を取得
     */
    public async getCourseGroups(courseId: number): Promise<Group[]> {
        this.ensureReady();
        const rawGroups = await this.apiService!.getCourseGroups(courseId);
        return rawGroups.map(data => new Group(data));
    }

    /**
     * コース参加者を検索
     */
    public async searchCourseParticipants(courseId: number, searchTerm: string): Promise<User[]> {
        this.ensureReady();
        const result = await this.apiService!.searchCourseUsers(courseId, searchTerm);
        return (result.users || []).map(data => new User(data));
    }
}
