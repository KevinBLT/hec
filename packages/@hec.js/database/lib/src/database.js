/**
 * @template T
 * @typedef {{ affected: number, duration: number } & ({ [key: string]: any } & T)[]} DatabaseResult
 */

export class Database {
  
  /** @type { string } */
  host;

  /** @type { number } */
  port;

  /** @type { string } */
  database;

  /** @type { string } */
  user;

  /** @type { string } */
  password;

  /** @type { number } */
  pool = 4;

  /** @param {Partial<Database> } connection */
  constructor(connection) {
    Object.assign(this, connection);
  }

  /**
   * @template T
   * @param { string } query 
   * @param { any[] }  params 
   * @returns { Promise<DatabaseResult<T>> }
   */
  async query(query, params = []) {
    return Object.assign([], { affected: 0, duration: 0 });
  }
  
  /**
   * @template T
   * @param { (query: (query: string, params: any[]) => Promise<DatabaseResult<T>>, rollback: () => void) => void } steps 
   * @returns { Promise<boolean> }
   */
  async transaction(steps) {
    return false;
  }

  /**
   * @template T
   * @param { string } query 
   * @param { any[] }  params 
   * @returns { AsyncIterable<T> }
   */
  async * stream(query, params = []) {}
}