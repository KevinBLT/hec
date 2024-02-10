export class ApiRequest extends Request {
  #props   = null;
  #query   = null;
  #data    = null;
  #url     = null;
  #cookies = null;

  /** @type { function (string): any | undefined } */
  param;

  /**
   * @param { ApiRequest | URL | string | Request } request 
   * @param { RequestInit | undefined } init 
   */
  constructor(request, init = null) {
    super(request, init);
  }

  /**
   * @param { string } key 
   * @returns { string }
   */
  query(key) {
    this.#url   ??= new URL(this.url);
    this.#query ??= this.#url.searchParams;
  
    return this.#query.get(key);
  }

  /**
   * @param { string } key 
   * @returns { string }
   */
  cookie(key) {
    this.#cookies ??= Object.fromEntries(
      (this.headers.get('cookie') ?? '').split(';').map(e => e.split('=').map(v => v.trim()))
    );
  
    return this.#cookies[key];
  }
  
  /**
   * @param { string } key 
   * @param { any } value 
   * @returns { void | any }
   */
  prop(key, value = undefined) {
    this.#props ??= new Map();
  
    return value !== undefined ? this.#props.set(key, value) : this.#props.get(key);
  }

  /**
   * @returns { Promise<Uint8Array | { [key: string]: any } | string> }
   */
  async data() {
    
    if (!this.#data) {
      const contentType = this.headers.get('content-type');
  
      if (contentType?.includes('/json')) {
        this.#data = await this.json();
      } else if (contentType?.includes('/x-www-form-urlencoded')) {
        this.#data = Object.fromEntries(new URLSearchParams(await this.text()).entries());
      } else if (contentType?.includes('text/')) {
        this.#data = await this.text();
      } else if (this.body) {
        const buffer = [];

        /* @ts-ignore */
        for await (const bytes of this.body) {
          buffer.push(...bytes);
        }

        this.#data = new Uint8Array(buffer);
      }
    }

    return this.#data;
  }

  get path() {
    this.#url ??= new URL(this.url);
  
    return this.#url.pathname;
  }
  
}
