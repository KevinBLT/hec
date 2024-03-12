/**
 * @typedef {{ affected: number, duration: number } & { [key: string]: any }[]} DatabaseResult
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
   * @param { string } query 
   * @param { any[] }  params 
   * @returns { Promise<DatabaseResult> }
   */
  async query(query, params = []) {
    return Object.assign([], { affected: 0, duration: 0 });
  }
  
  /**
   * @param { (query: (query: string, params: any[]) => Promise<DatabaseResult>, rollback: () => void) => void } steps 
   * @returns { Promise<boolean> }
   */
  async transaction(steps) {
    return false;
  }

  /**
   * @param { string } query 
   * @param { any[] }  params 
   * @returns { AsyncIterable<any> }
   */
  async * stream(query, params = []) {}
}