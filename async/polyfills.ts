
export class Map<K,V> {

    private readonly record: [K, V][]= [];

    constructor(){ }

    public has(key: K): boolean {
        return this.record
            .map(([_key]) => _key)
            .indexOf(key) >= 0;
    }

    public get(key: K): V | undefined {

        const [ entry ]= this.record
            .filter(([_key]) => _key === key)
            ;

        if( entry === undefined ){
            return undefined;
        }

        return entry[1];

    }

    public set(key: K, value: V) {

        const [ entry ]= this.record
            .filter(([_key]) => _key === key)
            ;

        if( entry === undefined ){

            this.record.push([key, value]);

        }else{

            entry[1]= value;

        }

    }

    public delete(key: K){

        const index= this.record.map(([ key])=> key).indexOf(key);

        if( index < 0 ){
            return;
        }

        this.record.splice(index, 1);

    }

    public keys(): K[] {
        return this.record.map(([ key ])=> key);
    }


}

export class Set<T> {

    private readonly map= new Map<T, true>();

    public has(value: T): boolean{
        return this.map.has(value);
    }

    public add(value: T) {
        this.map.set(value, true);
    }

    public values(): T[] {
        return this.map.keys();
    }

}