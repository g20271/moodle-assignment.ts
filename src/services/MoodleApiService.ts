import { ApiClient } from '../http/ApiClient';
import { Session } from '../session/Session';
import { ApiError } from '../errors/ApiError';
import { HtmlParser } from '../utils/HtmlParser';
import { RawAssignmentEvent } from '../models/Assignment';
import {
    RawCourse,
    RawUser,
    RawUserPreference,
    RawCalendarEvent,
    RawCalendarDayView,
    RawCalendarMonthlyView,
    RawGroup,
    RawCourseSearchResult,
    RawUserSearchResult
} from '../types/MoodleApiTypes';

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

    // ==================== コース関連メソッド (AJAX対応) ====================

    /**
     * コース一覧を取得
     * AJAX: Yes (core_course_get_courses)
     */
    public async getCourses(options?: { ids?: number[] }): Promise<RawCourse[]> {
        const body = [{
            index: 0,
            methodname: 'core_course_get_courses',
            args: options?.ids ? { options: { ids: options.ids } } : {}
        }];
        const data = await this.callApi(body, 'core_course_get_courses');
        return data || [];
    }

    /**
     * タイムライン分類別に登録コースを取得
     * AJAX: Yes (core_course_get_enrolled_courses_by_timeline_classification)
     * @param classification 'inprogress' | 'past' | 'future'
     */
    public async getEnrolledCoursesByTimeline(
        classification: 'inprogress' | 'past' | 'future',
        limit?: number,
        offset?: number
    ): Promise<RawCourse[]> {
        const body = [{
            index: 0,
            methodname: 'core_course_get_enrolled_courses_by_timeline_classification',
            args: {
                classification,
                limit: limit || 0,
                offset: offset || 0
            }
        }];
        const data = await this.callApi(body, 'core_course_get_enrolled_courses_by_timeline_classification');
        return data?.courses || [];
    }

    /**
     * 最近アクセスしたコースを取得
     * AJAX: Yes (core_course_get_recent_courses)
     */
    public async getRecentCourses(limit?: number, offset?: number): Promise<RawCourse[]> {
        const body = [{
            index: 0,
            methodname: 'core_course_get_recent_courses',
            args: {
                limit: limit || 0,
                offset: offset || 0
            }
        }];
        const data = await this.callApi(body, 'core_course_get_recent_courses');
        return data || [];
    }

    /**
     * コースを検索
     * AJAX: Yes (core_course_search_courses)
     */
    public async searchCourses(
        criterianame: 'search' | 'modulelist' | 'blocklist' | 'tagid',
        criteriavalue: string,
        page?: number,
        perpage?: number
    ): Promise<RawCourseSearchResult> {
        const body = [{
            index: 0,
            methodname: 'core_course_search_courses',
            args: {
                criterianame,
                criteriavalue,
                page: page || 0,
                perpage: perpage || 0
            }
        }];
        const data = await this.callApi(body, 'core_course_search_courses');
        return data || { total: 0, courses: [], warnings: [] };
    }

    // ==================== カレンダー関連メソッド (AJAX対応) ====================

    /**
     * コース別のアクションイベントを取得
     * AJAX: Yes (core_calendar_get_action_events_by_course)
     */
    public async getActionEventsByCourse(
        courseId: number,
        timesortfrom?: number,
        timesortto?: number
    ): Promise<{ events: RawCalendarEvent[]; firstid: number; lastid: number }> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_action_events_by_course',
            args: {
                courseid: courseId,
                timesortfrom: timesortfrom,
                timesortto: timesortto
            }
        }];
        const data = await this.callApi(body, 'core_calendar_get_action_events_by_course');
        return data || { events: [], firstid: 0, lastid: 0 };
    }

    /**
     * 複数コースのアクションイベントを取得
     * AJAX: Yes (core_calendar_get_action_events_by_courses)
     */
    public async getActionEventsByCourses(
        courseIds: number[],
        timesortfrom?: number,
        timesortto?: number
    ): Promise<{ events: RawCalendarEvent[]; firstid: number; lastid: number }> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_action_events_by_courses',
            args: {
                courseids: courseIds,
                timesortfrom: timesortfrom,
                timesortto: timesortto
            }
        }];
        const data = await this.callApi(body, 'core_calendar_get_action_events_by_courses');
        return data || { events: [], firstid: 0, lastid: 0 };
    }

    /**
     * 日別カレンダービューを取得
     * AJAX: Yes (core_calendar_get_calendar_day_view)
     */
    public async getCalendarDayView(
        year: number,
        month: number,
        day: number,
        courseId?: number
    ): Promise<RawCalendarDayView> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_calendar_day_view',
            args: {
                year,
                month,
                day,
                courseid: courseId || 1
            }
        }];
        const data = await this.callApi(body, 'core_calendar_get_calendar_day_view');
        return data;
    }

    /**
     * 月別カレンダービューを取得
     * AJAX: Yes (core_calendar_get_calendar_monthly_view)
     */
    public async getCalendarMonthlyView(
        year: number,
        month: number,
        courseId?: number
    ): Promise<RawCalendarMonthlyView> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_calendar_monthly_view',
            args: {
                year,
                month,
                courseid: courseId || 1,
                includenavigation: true,
                mini: false
            }
        }];
        const data = await this.callApi(body, 'core_calendar_get_calendar_monthly_view');
        return data;
    }

    /**
     * ID指定でカレンダーイベントを取得
     * AJAX: Yes (core_calendar_get_calendar_event_by_id)
     */
    public async getCalendarEventById(eventId: number): Promise<{ event: RawCalendarEvent }> {
        const body = [{
            index: 0,
            methodname: 'core_calendar_get_calendar_event_by_id',
            args: {
                eventid: eventId
            }
        }];
        const data = await this.callApi(body, 'core_calendar_get_calendar_event_by_id');
        return data;
    }

    // ==================== ユーザー関連メソッド (AJAX対応) ====================

    /**
     * フィールド指定でユーザーを検索
     * AJAX: Yes (core_user_get_users_by_field)
     */
    public async getUsersByField(
        field: 'id' | 'idnumber' | 'username' | 'email',
        values: string[]
    ): Promise<RawUser[]> {
        const body = [{
            index: 0,
            methodname: 'core_user_get_users_by_field',
            args: {
                field,
                values
            }
        }];
        const data = await this.callApi(body, 'core_user_get_users_by_field');
        return data || [];
    }

    /**
     * ユーザー設定を取得
     * AJAX: Yes (core_user_get_user_preferences)
     */
    public async getUserPreferences(name?: string, userId?: number): Promise<{
        preferences: RawUserPreference[];
        warnings?: any[];
    }> {
        const body = [{
            index: 0,
            methodname: 'core_user_get_user_preferences',
            args: {
                name: name || '',
                userid: userId || 0
            }
        }];
        const data = await this.callApi(body, 'core_user_get_user_preferences');
        return data || { preferences: [], warnings: [] };
    }

    // ==================== グループ・参加者関連メソッド (AJAX対応) ====================

    /**
     * コースのグループ一覧を取得
     * AJAX: Yes (core_group_get_course_groups)
     */
    public async getCourseGroups(courseId: number): Promise<RawGroup[]> {
        const body = [{
            index: 0,
            methodname: 'core_group_get_course_groups',
            args: {
                courseid: courseId
            }
        }];
        const data = await this.callApi(body, 'core_group_get_course_groups');
        return data || [];
    }

    /**
     * コース参加者を検索
     * AJAX: Yes (core_enrol_search_users)
     */
    public async searchCourseUsers(
        courseId: number,
        search: string,
        searchAnywhere?: boolean,
        page?: number,
        perpage?: number
    ): Promise<RawUserSearchResult> {
        const body = [{
            index: 0,
            methodname: 'core_enrol_search_users',
            args: {
                courseid: courseId,
                search,
                searchanywhere: searchAnywhere ?? true,
                page: page || 0,
                perpage: perpage || 25
            }
        }];
        const data = await this.callApi(body, 'core_enrol_search_users');
        return data || { users: [] };
    }
}
