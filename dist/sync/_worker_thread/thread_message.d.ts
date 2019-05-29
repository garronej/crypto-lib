import * as types from "./types";
export declare function prepare<T extends types.Action | types.Response>(data: T): any;
export declare function restore<T extends types.Action | types.Response>(message: any): T;
