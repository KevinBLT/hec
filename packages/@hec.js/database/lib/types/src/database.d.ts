/**
 * @template T
 * @typedef {{ affected: number, duration: number } & ({ [key: string]: any } & T)[]} DatabaseResult
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
     * @template T
     * @param { string } query
     * @param { any[] }  params
     * @returns { Promise<DatabaseResult<T>> }
     */
    query<T>(query: string, params?: any[]): Promise<DatabaseResult<T>>;
    /**
     * @template T
     * @param { (query: (query: string, params: any[]) => Promise<DatabaseResult<T>>, rollback: () => void) => void } steps
     * @returns { Promise<boolean> }
     */
    transaction<T_1>(steps: (query: (query: string, params: any[]) => Promise<DatabaseResult<T_1>>, rollback: () => void) => void): Promise<boolean>;
    /**
     * @template T
     * @param { string } query
     * @param { any[] }  params
     * @returns { AsyncIterable<T> }
     */
    stream<T_2>(query: string, params?: any[]): AsyncIterable<T_2>;
}
export type DatabaseResult<T> = {
    affected: number;
    duration: number;
} & ({
    [key: string]: any;
} & T)[];
