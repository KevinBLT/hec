import { Database } from '../database.js';
import pg from 'pg';
import QueryStream from 'pg-query-stream';

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

    this.#pool.on('error', console.log);
  }

  async query(query, params) {
    return (await this.#pool.query(query, params)).rows;
  }

  async * stream(query, params) {
    const client = await this.#pool.connect();
  
    yield * client.query(new QueryStream(query, params));

    client.release();
  }
}