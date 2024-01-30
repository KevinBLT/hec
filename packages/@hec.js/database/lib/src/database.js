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
   * @returns { Promise<any[]> }
   */
  async query(query, params) {
    return [];
  }


}