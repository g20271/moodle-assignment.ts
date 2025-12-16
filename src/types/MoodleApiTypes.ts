// Moodle Web Service API の型定義
// AJAX対応関数のみを定義

// ==================== コース関連 ====================

export interface RawCourse {
    id: number;
    shortname: string;
    fullname: string;
    displayname?: string;
    enrolledusercount?: number;
    idnumber?: string;
    visible?: number;
    summary?: string;
    summaryformat?: number;
    format?: string;
    showgrades?: boolean;
    lang?: string;
    enablecompletion?: boolean;
    startdate?: number;
    enddate?: number;
    marker?: number;
    lastaccess?: number;
    isfavourite?: boolean;
    hidden?: boolean;
    overviewfiles?: Array<{
        filename: string;
        filepath: string;
        filesize: number;
        fileurl: string;
        timemodified: number;
        mimetype?: string;
    }>;
}

// ==================== ユーザー関連 ====================

export interface RawUser {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
    fullname: string;
    email?: string;
    department?: string;
    institution?: string;
    idnumber?: string;
    firstaccess?: number;
    lastaccess?: number;
    auth?: string;
    suspended?: boolean;
    confirmed?: boolean;
    lang?: string;
    theme?: string;
    timezone?: string;
    description?: string;
    descriptionformat?: number;
    profileimageurl?: string;
    profileimageurlsmall?: string;
}

export interface RawUserPreference {
    name: string;
    value: string;
}

// ==================== カレンダー関連 ====================

export interface RawCalendarEvent {
    id: number;
    name: string;
    description?: string;
    descriptionformat?: number;
    location?: string;
    categoryid?: number;
    groupid?: number;
    userid?: number;
    repeatid?: number;
    eventcount?: number;
    component?: string;
    modulename?: string;
    instance?: number;
    eventtype?: string;
    timestart: number;
    timeduration: number;
    timesort?: number;
    visible?: number;
    timemodified?: number;
    icon?: {
        key: string;
        component: string;
        alttext: string;
    };
    category?: {
        id: number;
        name: string;
        idnumber: string;
        description?: string;
        parent: number;
        coursecount: number;
        visible: number;
        timemodified: number;
        depth: number;
        nestedname: string;
        url: string;
    };
    course?: {
        id: number;
        fullname: string;
        shortname: string;
        idnumber: string;
        summary: string;
        summaryformat: number;
        startdate: number;
        enddate: number;
        visible: boolean;
        fullnamedisplay: string;
        viewurl: string;
        courseimage: string;
        progress?: number;
        hasprogress: boolean;
        isfavourite: boolean;
        hidden: boolean;
        showshortname: boolean;
        coursecategory: string;
    };
    subscription?: {
        displayeventsource: boolean;
    };
    canedit?: boolean;
    candelete?: boolean;
    deleteurl?: string;
    editurl?: string;
    viewurl?: string;
    formattedtime?: string;
    isactionevent?: boolean;
    iscourseevent?: boolean;
    iscategoryevent?: boolean;
    normalisedeventtype?: string;
    normalisedeventtypetext?: string;
    action?: {
        name: string;
        url: string;
        itemcount: number;
        actionable: boolean;
        showitemcount: boolean;
    };
    url?: string;
}

export interface RawCalendarDayView {
    events: RawCalendarEvent[];
    defaulteventcontext: number;
    filter_selector: string;
    courseid: number;
    categoryid?: number;
    isloggedin: boolean;
    date: {
        seconds: number;
        minutes: number;
        hours: number;
        mday: number;
        wday: number;
        mon: number;
        year: number;
        yday: number;
        weekday: string;
        month: string;
        timestamp: number;
    };
}

export interface RawCalendarMonthlyView {
    url: string;
    courseid: number;
    categoryid?: number;
    filter_selector?: string;
    weeks: Array<{
        prepadding: number[];
        postpadding: number[];
        days: Array<{
            seconds: number;
            minutes: number;
            hours: number;
            mday: number;
            wday: number;
            mon: number;
            year: number;
            yday: number;
            weekday: string;
            month: string;
            timestamp: number;
            neweventtimestamp: number;
            viewdaylink?: string;
            events: RawCalendarEvent[];
            hasevents: boolean;
            calendareventtypes: string[];
            previousperiod: number;
            nextperiod: number;
            navigation: string;
            haslastdayofevent: boolean;
        }>;
    }>;
    daynames: Array<{
        dayno: number;
        shortname: string;
        fullname: string;
    }>;
    view: string;
    date: {
        seconds: number;
        minutes: number;
        hours: number;
        mday: number;
        wday: number;
        mon: number;
        year: number;
        yday: number;
        weekday: string;
        month: string;
        timestamp: number;
    };
    periodname: string;
    includenavigation: boolean;
    initialeventsloaded: boolean;
    previousperiod?: {
        seconds: number;
        minutes: number;
        hours: number;
        mday: number;
        wday: number;
        mon: number;
        year: number;
        yday: number;
        weekday: string;
        month: string;
        timestamp: number;
    };
    nextperiod?: {
        seconds: number;
        minutes: number;
        hours: number;
        mday: number;
        wday: number;
        mon: number;
        year: number;
        yday: number;
        weekday: string;
        month: string;
        timestamp: number;
    };
}

// ==================== グループ関連 ====================

export interface RawGroup {
    id: number;
    courseid: number;
    name: string;
    description?: string;
    descriptionformat?: number;
    enrolmentkey?: string;
    idnumber?: string;
    timecreated?: number;
    timemodified?: number;
}

// ==================== 検索結果関連 ====================

export interface RawSearchResult {
    total: number;
    warnings?: Array<{
        item?: string;
        itemid?: number;
        warningcode: string;
        message: string;
    }>;
}

export interface RawCourseSearchResult extends RawSearchResult {
    courses: RawCourse[];
}

export interface RawUserSearchResult {
    users: RawUser[];
}
