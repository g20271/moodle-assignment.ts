import { RawUser } from '../types/MoodleApiTypes';

export class User {
    public readonly id: number;
    public readonly username?: string;
    public readonly firstname?: string;
    public readonly lastname?: string;
    public readonly fullname: string;
    public readonly email?: string;
    public readonly department?: string;
    public readonly institution?: string;
    public readonly idNumber?: string;
    public readonly firstAccess?: Date;
    public readonly lastAccess?: Date;
    public readonly auth?: string;
    public readonly suspended: boolean;
    public readonly confirmed: boolean;
    public readonly lang?: string;
    public readonly theme?: string;
    public readonly timezone?: string;
    public readonly description?: string;
    public readonly profileImageUrl?: string;
    public readonly profileImageUrlSmall?: string;
    public readonly rawData: RawUser;

    constructor(data: RawUser) {
        this.id = data.id;
        this.username = data.username;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.fullname = data.fullname;
        this.email = data.email;
        this.department = data.department;
        this.institution = data.institution;
        this.idNumber = data.idnumber;
        this.firstAccess = data.firstaccess ? new Date(data.firstaccess * 1000) : undefined;
        this.lastAccess = data.lastaccess ? new Date(data.lastaccess * 1000) : undefined;
        this.auth = data.auth;
        this.suspended = data.suspended ?? false;
        this.confirmed = data.confirmed ?? true;
        this.lang = data.lang;
        this.theme = data.theme;
        this.timezone = data.timezone;
        this.description = data.description;
        this.profileImageUrl = data.profileimageurl;
        this.profileImageUrlSmall = data.profileimageurlsmall;
        this.rawData = data;
    }
}
