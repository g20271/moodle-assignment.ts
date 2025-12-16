import { RawGroup } from '../types/MoodleApiTypes';

export class Group {
    public readonly id: number;
    public readonly courseId: number;
    public readonly name: string;
    public readonly description?: string;
    public readonly enrolmentKey?: string;
    public readonly idNumber?: string;
    public readonly timeCreated?: Date;
    public readonly timeModified?: Date;
    public readonly rawData: RawGroup;

    constructor(data: RawGroup) {
        this.id = data.id;
        this.courseId = data.courseid;
        this.name = data.name;
        this.description = data.description;
        this.enrolmentKey = data.enrolmentkey;
        this.idNumber = data.idnumber;
        this.timeCreated = data.timecreated ? new Date(data.timecreated * 1000) : undefined;
        this.timeModified = data.timemodified ? new Date(data.timemodified * 1000) : undefined;
        this.rawData = data;
    }
}
