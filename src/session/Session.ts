export class Session {
    private _sesskey: string;

    constructor(initialSesskey: string) {
        this._sesskey = initialSesskey;
    }

    public get sesskey(): string {
        return this._sesskey;
    }

    public updateSesskey(newSesskey: string): void {
        this._sesskey = newSesskey;
        console.log(`[INFO] Session key has been refreshed.`);
    }
}
