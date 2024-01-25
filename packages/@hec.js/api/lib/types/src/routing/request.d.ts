export class ApiRequest extends Request {
    /**
     * @param { ApiRequest | URL | string | Request } request
     * @param { RequestInit | undefined } init
     */
    constructor(request: ApiRequest | URL | string | Request, init?: RequestInit | undefined);
    /**
     * @type { function (string): any | undefined }
     */
    param: (arg0: string) => any | undefined;
    /**
     *
     * @param { string } key
     * @returns { string }
     */
    query(key: string): string;
    /**
     * @param { string } key
     * @param { string | undefined } value
     * @returns { void | any }
     */
    prop(key: string, value?: string | undefined): void | any;
    /**
     * @returns { Promise<Uint8Array | { [key: string]: any } | string> }
     */
    data(): Promise<string | Uint8Array | {
        [key: string]: any;
    }>;
    get path(): any;
    #private;
}
