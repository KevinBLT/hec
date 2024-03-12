import { Database } from "./database.js";
import { PostgresDB } from "./driver/postgres.js";

export { Database } from "./database.js";


/**
 * @param { { driver: 'postgres' | 'cockroach' } & Partial<Database> } connection 
 * @returns { Database }
 */
export function database(connection) {

  if (['postgres', 'cockroach'].includes(connection.driver)) {
    return new PostgresDB(connection);
  }

  throw new Error(`Dabase driver "${connection.driver}" not found!`);
}