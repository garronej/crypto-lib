export declare class Map<K, V> {
    private readonly record;
    constructor();
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    delete(key: K): void;
    keys(): K[];
}
export declare class Set<T> {
    private readonly map;
    has(value: T): boolean;
    add(value: T): void;
    values(): T[];
}
