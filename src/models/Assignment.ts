import { Course, RawCourseData } from './Course';

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
    public readonly rawData: RawAssignmentEvent;

    constructor(data: RawAssignmentEvent) {
        this.id = data.id;
        this.name = data.activityname;
        this.description = data.description;
        this.dueDate = new Date(data.timestart * 1000);
        this.isOverdue = data.overdue;
        this.course = new Course(data.course);
        this.url = data.url;
        this.rawData = data; // 元データも保持
    }
}
