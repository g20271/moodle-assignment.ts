import { RawCourse } from '../types/MoodleApiTypes';

// 既存のRawCourseData（後方互換性のため保持）
export interface RawCourseData {
    id: number;
    fullname: string;
    shortname: string;
    viewurl: string;
}

export class Course {
    public readonly id: number;
    public readonly fullname: string;
    public readonly shortname: string;
    public readonly url: string;
    public readonly displayname?: string;
    public readonly enrolledUserCount?: number;
    public readonly idNumber?: string;
    public readonly visible: boolean;
    public readonly summary?: string;
    public readonly format?: string;
    public readonly startDate?: Date;
    public readonly endDate?: Date;
    public readonly isFavourite: boolean;
    public readonly hidden: boolean;
    public readonly rawData: RawCourseData | RawCourse;

    constructor(data: RawCourseData | RawCourse) {
        this.id = data.id;
        this.fullname = data.fullname;
        this.shortname = data.shortname;

        // viewurlがある場合はそれを、なければidから構築
        this.url = 'viewurl' in data ? data.viewurl : `/course/view.php?id=${data.id}`;

        // 拡張プロパティ（RawCourseの場合のみ）
        if ('displayname' in data) {
            this.displayname = data.displayname;
            this.enrolledUserCount = data.enrolledusercount;
            this.idNumber = data.idnumber;
            this.visible = data.visible === 1;
            this.summary = data.summary;
            this.format = data.format;
            this.startDate = data.startdate ? new Date(data.startdate * 1000) : undefined;
            this.endDate = data.enddate ? new Date(data.enddate * 1000) : undefined;
            this.isFavourite = data.isfavourite ?? false;
            this.hidden = data.hidden ?? false;
        } else {
            this.visible = true;
            this.isFavourite = false;
            this.hidden = false;
        }

        this.rawData = data;
    }
}
