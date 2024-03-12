/**
 * @param { { driver: 'postgres' | 'cockroach' } & Partial<Database> } connection
 * @returns { Database }
 */
export function database(connection: {
    driver: 'postgres' | 'cockroach';
} & Partial<Database>): Database;
export { Database } from "./database.js";
import { Database } from "./database.js";
