import * as types from "../../dist/sync/_worker_thread/types";
export declare type SerializableUint8Array = {
    type: "Uint8Array";
    data: number[];
};
export declare namespace SerializableUint8Array {
    function match(value: any): value is SerializableUint8Array;
    function build(value: Uint8Array): SerializableUint8Array;
    function restore(value: SerializableUint8Array): Uint8Array;
}
export declare function prepare<T extends types.Action | types.Response>(data: T): any;
export declare function restore<T extends types.Action | types.Response>(message: any): T;
