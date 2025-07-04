// ライブラリとして使用する場合のインポート例
// import { MoodleClient, Assignment } from 'moodle-assignment';

// ローカル開発用のインポート
import { MoodleClient, Assignment } from './src/MoodleClient';
import * as dotenv from 'dotenv';

// .envファイルを読み込み
dotenv.config();

// 環境変数から設定値を取得
const MOODLE_URL = process.env.MOODLE_URL as string;
const MOODLE_USERNAME = process.env.MOODLE_USERNAME as string;
const MOODLE_PASSWORD = process.env.MOODLE_PASSWORD as string;

// 必要な環境変数が設定されているかチェック
if (!MOODLE_URL || !MOODLE_USERNAME || !MOODLE_PASSWORD) {
    console.error('Error: Required environment variables are missing. Please check your .env file.');
    console.error('Required variables: MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD');
    process.exit(1);
}

async function main() {
    const client = new MoodleClient(MOODLE_URL);

    try {
        await client.login(MOODLE_USERNAME, MOODLE_PASSWORD);

        console.log('\n--- Fetching all upcoming assignments ---');
        const allAssignments = await client.getAllAssignments();
        console.log(`Found ${allAssignments.length} upcoming assignments.`);
        if (allAssignments.length > 0) {
            printAssignments(allAssignments.slice(0, 3)); // 最初の3件だけ表示
        }

        console.log('\n--- Fetching today\'s assignments ---');
        const todayAssignments = await client.getTodayAssignments();
        console.log(`Found ${todayAssignments.length} assignments due today.`);
        if (todayAssignments.length > 0) {
            printAssignments(todayAssignments);
        }
        
    } catch (error) {
        console.error('\n[ERROR] An error occurred during the process:');
        console.error(error);
    }
}

function printAssignments(assignments: Assignment[]): void {
    assignments.forEach(assignment => {
        console.log('------------------------------------');
        console.log(`  Course: ${assignment.course.fullname}`);
        console.log(`  Name: ${assignment.name}`);
        console.log(`  Due: ${assignment.dueDate.toLocaleString('ja-JP')}`);
        console.log(`  URL: ${assignment.url}`);
    });
    console.log('------------------------------------');
}

main();
