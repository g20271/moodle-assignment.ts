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

    constructor(data: RawCourseData) {
        this.id = data.id;
        this.fullname = data.fullname;
        this.shortname = data.shortname;
        this.url = data.viewurl;
    }
}
