import { Database } from '../database.js';
import QueryStream from 'pg-query-stream';
import pg from 'pg';

export class PostgresDB extends Database {

  /** @type { pg.Pool } */
  #pool;

  constructor(connection) {
    super(connection);

    this.#pool = new pg.Pool({
      host: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
      database: this.database,
      max: this.pool
    });

    this.#pool.on('error', console.error);
  }

  async transaction(steps) {
    let client   = await this.#pool.connect(),
        rollback = false;

    await client.query('BEGIN');

    try {
      await steps(
        async (query, params) => this.query(query, params, client), 
        () => rollback = true
      );
    } catch (e) {
      console.error(e);

      rollback = true;
    }

    rollback ? await client.query('ROLLBACK') : await client.query('COMMIT');

    return !rollback;
  }

  async query(query, params, client = null) {
    const start  = Date.now(),
          result = await (client ? client.query(query, params) : this.#pool.query(query, params));
    
    return Object.assign(result.rows, { 
      affected: result.rowCount, 
      duration: new Date().valueOf() - start.valueOf() 
    });

  }

  async * stream(query, params) {
    const client = await this.#pool.connect();
  
    try {
      yield * client.query(new QueryStream(query, params));
    } finally {
      client.release();
    }
  }
}