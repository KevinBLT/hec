export class PostgresDB extends Database {
    constructor(connection: any);
    transaction(steps: any): Promise<boolean>;
    query(query: any, params: any, client?: any): Promise<any>;
    stream(query: any, params: any): AsyncGenerator<any, void, any>;
    #private;
}
import { Database } from '../database.js';
