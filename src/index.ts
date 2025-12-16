export { MoodleClient } from './MoodleClient';
export { Assignment } from './models/Assignment';
export { Course } from './models/Course';
export { User } from './models/User';
export { Group } from './models/Group';

// エラークラスもエクスポート
export { MoodleError } from './errors/MoodleError';
export { ApiError } from './errors/ApiError';
export { LoginError } from './errors/LoginError';

// 型定義もエクスポート
export type { RawAssignmentEvent } from './models/Assignment';
export type { RawCourseData } from './models/Course';
export type {
    RawCourse,
    RawUser,
    RawGroup,
    RawCalendarEvent,
    RawUserPreference
} from './types/MoodleApiTypes';
