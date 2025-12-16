// 新機能検証プログラム
import { MoodleClient, Course, User, Group, Assignment } from './src/MoodleClient';
import * as dotenv from 'dotenv';

dotenv.config();

const MOODLE_URL = process.env.MOODLE_URL as string;
const MOODLE_USERNAME = process.env.MOODLE_USERNAME as string;
const MOODLE_PASSWORD = process.env.MOODLE_PASSWORD as string;

if (!MOODLE_URL || !MOODLE_USERNAME || !MOODLE_PASSWORD) {
    console.error('Error: Required environment variables are missing.');
    console.error('Required: MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD');
    process.exit(1);
}

async function main() {
    const client = new MoodleClient(MOODLE_URL);

    try {
        console.log('='.repeat(60));
        console.log('Moodle新機能検証プログラム');
        console.log('='.repeat(60));

        await client.login(MOODLE_USERNAME, MOODLE_PASSWORD);
        console.log('✓ ログイン成功\n');

        // ==================== コース関連のテスト ====================
        await testCourses(client);

        // ==================== カレンダー・課題関連のテスト ====================
        await testCalendarAndAssignments(client);

        // ==================== ユーザー関連のテスト ====================
        await testUsers(client);

        // ==================== グループ・参加者関連のテスト ====================
        await testGroupsAndParticipants(client);

        console.log('\n' + '='.repeat(60));
        console.log('すべてのテストが完了しました！');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n[ERROR] エラーが発生しました:');
        console.error(error);
        process.exit(1);
    }
}

// ==================== コース関連のテスト ====================
async function testCourses(client: MoodleClient) {
    console.log('\n' + '-'.repeat(60));
    console.log('【1】コース関連機能のテスト');
    console.log('-'.repeat(60));

    let allCourses: Course[] = [];
    let inProgressCourses: Course[] = [];

    // 全コース取得
    try {
        console.log('\n▶ getAllCourses() - 全コース取得');
        allCourses = await client.getAllCourses();
        console.log(`  ✓ ${allCourses.length}件のコースを取得`);
        if (allCourses.length > 0) {
            console.log(`  例: ${allCourses[0].fullname}`);
        }
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // 進行中のコース取得
    try {
        console.log('\n▶ getMyInProgressCourses() - 進行中のコース取得');
        inProgressCourses = await client.getMyInProgressCourses();
        console.log(`  ✓ ${inProgressCourses.length}件の進行中コースを取得`);
        if (inProgressCourses.length > 0) {
            printCourses(inProgressCourses.slice(0, 3));
        }
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // 最近アクセスしたコース取得
    try {
        console.log('\n▶ getRecentCourses() - 最近アクセスしたコース取得');
        const recentCourses = await client.getRecentCourses(5);
        console.log(`  ✓ ${recentCourses.length}件の最近アクセスしたコースを取得`);
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // 過去のコース取得
    try {
        console.log('\n▶ getMyPastCourses() - 過去のコース取得');
        const pastCourses = await client.getMyPastCourses();
        console.log(`  ✓ ${pastCourses.length}件の過去のコースを取得`);
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // 未来のコース取得
    try {
        console.log('\n▶ getMyFutureCourses() - 未来のコース取得');
        const futureCourses = await client.getMyFutureCourses();
        console.log(`  ✓ ${futureCourses.length}件の未来のコースを取得`);
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // 特定のコースを取得（進行中のコースを使用）
    if (inProgressCourses.length > 0) {
        try {
            const testCourseId = inProgressCourses[0].id;
            console.log(`\n▶ getCourse(${testCourseId}) - 特定のコース取得`);
            const course = await client.getCourse(testCourseId);
            if (course) {
                console.log(`  ✓ コース取得成功: ${course.fullname}`);
            }
        } catch (error: any) {
            console.error(`  ✗ エラー: ${error.message}`);
        }
    }

    // コース検索（進行中のコースがあれば、その名前で検索）
    if (inProgressCourses.length > 0) {
        try {
            const searchTerm = inProgressCourses[0].fullname.substring(0, 5);
            console.log(`\n▶ searchCourses("${searchTerm}") - コース検索`);
            const searchResults = await client.searchCourses(searchTerm);
            console.log(`  ✓ ${searchResults.length}件のコースが見つかりました`);
            if (searchResults.length > 0) {
                console.log(`  例: ${searchResults[0].fullname}`);
            }
        } catch (error: any) {
            console.error(`  ✗ エラー: ${error.message}`);
        }
    }
}

// ==================== カレンダー・課題関連のテスト ====================
async function testCalendarAndAssignments(client: MoodleClient) {
    console.log('\n' + '-'.repeat(60));
    console.log('【2】カレンダー・課題関連機能のテスト');
    console.log('-'.repeat(60));

    try {
        // 進行中のコースを取得
        const courses = await client.getMyInProgressCourses();

        if (courses.length === 0) {
            console.log('  ⚠ 進行中のコースがないため、スキップします');
            return;
        }

        const testCourse = courses[0];
        console.log(`\nテスト対象コース: ${testCourse.fullname}`);

        // コース内の課題取得
        console.log('\n▶ getCourseAssignments() - コース内の課題取得');
        const courseAssignments = await client.getCourseAssignments(testCourse.id);
        console.log(`  ✓ ${courseAssignments.length}件の課題を取得`);
        if (courseAssignments.length > 0) {
            printAssignments(courseAssignments.slice(0, 2));
        }

        // 月別課題取得
        const now = new Date();
        console.log(`\n▶ getMonthlyAssignments(${now.getFullYear()}, ${now.getMonth() + 1}) - 月別課題取得`);
        const monthlyAssignments = await client.getMonthlyAssignments(
            now.getFullYear(),
            now.getMonth() + 1,
            testCourse.id
        );
        console.log(`  ✓ ${monthlyAssignments.length}件の課題を取得`);

        // 日別課題取得
        console.log(`\n▶ getDailyAssignments() - 今日の課題取得`);
        const dailyAssignments = await client.getDailyAssignments(
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate(),
            testCourse.id
        );
        console.log(`  ✓ ${dailyAssignments.length}件の課題を取得`);

        // 特定の課題を取得（月別課題があればそれを使用）
        const availableAssignments = courseAssignments.length > 0 ? courseAssignments : monthlyAssignments;
        if (availableAssignments.length > 0) {
            console.log(`\n▶ getAssignmentById(${availableAssignments[0].id}) - ID指定で課題取得`);
            const assignment = await client.getAssignmentById(availableAssignments[0].id);
            console.log(`  ✓ 課題取得成功: ${assignment.name}`);
        }

        // 複数コースのイベント取得（内部的にgetCourseAssignmentsを複数回実行して確認）
        if (courses.length >= 2) {
            console.log(`\n▶ 複数コース対応の確認 - 2つのコースから課題取得`);
            const course1Assignments = await client.getCourseAssignments(courses[0].id);
            const course2Assignments = await client.getCourseAssignments(courses[1].id);
            console.log(`  ✓ コース1: ${course1Assignments.length}件、コース2: ${course2Assignments.length}件`);
        }

    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }
}

// ==================== ユーザー関連のテスト ====================
async function testUsers(client: MoodleClient) {
    console.log('\n' + '-'.repeat(60));
    console.log('【3】ユーザー関連機能のテスト');
    console.log('-'.repeat(60));

    try {
        // ユーザー名で検索
        console.log(`\n▶ getUserByUsername("${MOODLE_USERNAME}") - ユーザー名で検索`);
        const user = await client.getUserByUsername(MOODLE_USERNAME);
        if (user) {
            console.log(`  ✓ ユーザー取得成功`);
            printUser(user);

            // IDでユーザー取得
            console.log(`\n▶ getUserById(${user.id}) - IDでユーザー取得`);
            const userById = await client.getUserById(user.id);
            if (userById) {
                console.log(`  ✓ ユーザー取得成功: ${userById.fullname}`);
            }

            // メールアドレスで検索（メールがある場合）
            if (user.email) {
                console.log(`\n▶ getUserByEmail("${user.email}") - メールで検索`);
                const userByEmail = await client.getUserByEmail(user.email);
                if (userByEmail) {
                    console.log(`  ✓ ユーザー取得成功: ${userByEmail.fullname}`);
                }
            }
        } else {
            console.log(`  ✗ ユーザーが見つかりませんでした`);
        }

        // ユーザー設定取得
        console.log(`\n▶ getUserPreferences() - ユーザー設定取得`);
        const preferences = await client.getUserPreferences();
        console.log(`  ✓ ${preferences.length}件の設定を取得`);
        if (preferences.length > 0) {
            console.log(`  例: ${preferences[0].name} = ${preferences[0].value}`);
        }

    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }
}

// ==================== グループ・参加者関連のテスト ====================
async function testGroupsAndParticipants(client: MoodleClient) {
    console.log('\n' + '-'.repeat(60));
    console.log('【4】グループ・参加者関連機能のテスト');
    console.log('-'.repeat(60));

    const courses = await client.getMyInProgressCourses();

    if (courses.length === 0) {
        console.log('  ⚠ 進行中のコースがないため、スキップします');
        return;
    }

    const testCourse = courses[0];
    console.log(`\nテスト対象コース: ${testCourse.fullname}`);

    // グループ一覧取得
    try {
        console.log(`\n▶ getCourseGroups(${testCourse.id}) - グループ一覧取得`);
        const groups = await client.getCourseGroups(testCourse.id);
        console.log(`  ✓ ${groups.length}件のグループを取得`);
        if (groups.length > 0) {
            printGroups(groups.slice(0, 3));
        }
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }

    // コース参加者検索（空文字で全員取得を試みる）
    try {
        console.log(`\n▶ searchCourseParticipants() - コース参加者検索`);
        const participants = await client.searchCourseParticipants(testCourse.id, '');
        console.log(`  ✓ ${participants.length}件の参加者を取得`);
        if (participants.length > 0) {
            console.log(`  参加者例:`);
            participants.slice(0, 3).forEach(p => {
                console.log(`    - ${p.fullname} (${p.username || 'N/A'})`);
            });
        }
    } catch (error: any) {
        console.error(`  ✗ エラー: ${error.message}`);
    }
}

// ==================== ヘルパー関数 ====================
function printCourses(courses: Course[]): void {
    courses.forEach(course => {
        console.log(`  - [${course.id}] ${course.fullname}`);
        if (course.startDate) {
            console.log(`    開始: ${course.startDate.toLocaleDateString('ja-JP')}`);
        }
    });
}

function printAssignments(assignments: Assignment[]): void {
    assignments.forEach(assignment => {
        console.log(`  - ${assignment.name}`);
        console.log(`    コース: ${assignment.course.fullname}`);
        console.log(`    期限: ${assignment.dueDate.toLocaleString('ja-JP')}`);
        console.log(`    期限切れ: ${assignment.isOverdue ? 'はい' : 'いいえ'}`);
    });
}

function printUser(user: User): void {
    console.log(`  - ID: ${user.id}`);
    console.log(`  - 名前: ${user.fullname}`);
    console.log(`  - ユーザー名: ${user.username || 'N/A'}`);
    console.log(`  - メール: ${user.email || 'N/A'}`);
    if (user.lastAccess) {
        console.log(`  - 最終アクセス: ${user.lastAccess.toLocaleString('ja-JP')}`);
    }
}

function printGroups(groups: Group[]): void {
    groups.forEach(group => {
        console.log(`  - [${group.id}] ${group.name}`);
        if (group.description) {
            console.log(`    説明: ${group.description.substring(0, 50)}...`);
        }
    });
}

main();
