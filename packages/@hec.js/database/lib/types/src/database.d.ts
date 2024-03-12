/**
 * @typedef {{ affected: number, duration: number } & { [key: string]: any }[]} DatabaseResult
 */
export class Database {
    /** @param {Partial<Database> } connection */
    constructor(connection: Partial<Database>);
    /** @type { string } */
    host: string;
    /** @type { number } */
    port: number;
    /** @type { string } */
    database: string;
    /** @type { string } */
    user: string;
    /** @type { string } */
    password: string;
    /** @type { number } */
    pool: number;
    /**
     * @param { string } query
     * @param { any[] }  params
     * @returns { Promise<DatabaseResult> }
     */
    query(query: string, params?: any[]): Promise<DatabaseResult>;
    /**
     * @param { (query: (query: string, params: any[]) => Promise<DatabaseResult>, rollback: () => void) => void } steps
     * @returns { Promise<boolean> }
     */
    transaction(steps: (query: (query: string, params: any[]) => Promise<DatabaseResult>, rollback: () => void) => void): Promise<boolean>;
    /**
     * @param { string } query
     * @param { any[] }  params
     * @returns { AsyncIterable<any> }
     */
    stream(query: string, params?: any[]): AsyncIterable<any>;
}
export type DatabaseResult = {
    affected: number;
    duration: number;
} & {
    [key: string]: any;
}[];
