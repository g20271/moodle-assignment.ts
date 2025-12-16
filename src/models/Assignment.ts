import { Course, RawCourseData } from './Course';
import { RawCalendarEvent } from '../types/MoodleApiTypes';

export interface RawAssignmentEvent {
    id: number;
    name: string; // "「課題名」の提出期限"
    activityname: string; // "課題名"
    description: string;
    timestart: number; // Unix timestamp
    overdue: boolean;
    course: RawCourseData;
    url: string; // 課題ページへのURL
    // ...その他APIが返すプロパティ
}

export class Assignment {
    public readonly id: number;
    public readonly name: string;
    public readonly description: string;
    public readonly dueDate: Date;
    public readonly isOverdue: boolean;
    public readonly course: Course;
    public readonly url: string;
    public readonly rawData: RawAssignmentEvent | RawCalendarEvent;

    constructor(data: RawAssignmentEvent | RawCalendarEvent) {
        this.id = data.id;

        // RawAssignmentEventの場合はactivityname、RawCalendarEventの場合はname
        if ('activityname' in data) {
            this.name = data.activityname;
        } else {
            this.name = data.name || '';
        }

        this.description = data.description || '';
        this.dueDate = new Date(data.timestart * 1000);

        // RawAssignmentEventの場合はoverdueプロパティがあり、RawCalendarEventにはない
        if ('overdue' in data) {
            this.isOverdue = data.overdue;
        } else {
            // カレンダーイベントの場合、現在時刻と比較して判定
            this.isOverdue = data.timestart < Math.floor(Date.now() / 1000);
        }

        // courseプロパティの処理
        if ('activityname' in data) {
            // RawAssignmentEventの場合、courseはRawCourseData型
            this.course = new Course(data.course);
        } else {
            // RawCalendarEventの場合、courseは詳細な型なので変換
            const courseData: RawCourseData = {
                id: data.course?.id || 0,
                fullname: data.course?.fullname || '',
                shortname: data.course?.shortname || '',
                viewurl: data.course?.viewurl || ''
            };
            this.course = new Course(courseData);
        }

        this.url = data.url || '';
        this.rawData = data;
    }
}
