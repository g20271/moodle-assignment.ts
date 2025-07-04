# moodle-assignment.ts

TypeScript library for interacting with Moodle assignments and calendar events.

## Installation

```bash
npm install @g20271/moodle-assignment.ts
```

## Usage

```typescript
import { MoodleClient } from 'moodle-assignment';

const client = new MoodleClient('https://your-moodle-site.com');

async function example() {
  // Login
  await client.login('username', 'password');
  
  // Get all upcoming assignments
  const assignments = await client.getAllAssignments();
  
  // Get today's assignments
  const todayAssignments = await client.getTodayAssignments();
  
  // Get overdue assignments
  const overdueAssignments = await client.getOverdueAssignments();
}
```

## API

### MoodleClient

- `login(username: string, password: string): Promise<void>`
- `getAllAssignments(): Promise<Assignment[]>`
- `getTodayAssignments(): Promise<Assignment[]>`
- `getOverdueAssignments(): Promise<Assignment[]>`
- `getAssignments(options: { from?: Date, to?: Date, limit?: number }): Promise<Assignment[]>`

### Assignment

Properties:
- `id: number`
- `name: string`
- `description: string`
- `dueDate: Date`
- `isOverdue: boolean`
- `course: Course`
- `url: string`

### Course

Properties:
- `id: number`
- `fullname: string`
- `shortname: string`
- `url: string`

## Development

### Running the example

First, create a `.env` file with your Moodle credentials:

```env
MOODLE_URL=https://your-moodle-site.com
MOODLE_USERNAME=your_username
MOODLE_PASSWORD=your_password
```

Then run:

```bash
npm run dev
```

### Building

```bash
npm run build
```

