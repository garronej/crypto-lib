# crypto-lib

An non blocking crypto lib that run on the browser and on node.  
Multi threading enabled by ``child_process`` on node and web workers
in the browser.
If the browser does not support Web worker computation will be done on the  
main thread.

Algorithms implanted AES, RSA and scrypt.

RSA support key generation from seed.  

Light: 542KB minified, 17KB gziped.

Strongly typed.  

[Tests and benchmarks for the browser](https://garronej.github.io/crypto-lib/)

```bash
npm run build
```
OR  

```bash
npm run build -- -w
```

TODO: Try to use native crypto API instead of scrypt ( too slow ).
```typescript

const result = crypto.subtle.deriveBits(
    {
        "name": "PBKDF2",
        "hash": "SHA-256",
        "salt": new Uint8Array(16),
        "iterations": 100000
    },
    await crypto.subtle.importKey(
        "raw",
        (new Uint8Array(Buffer.from("password", "utf8"))).buffer,
        { "name": "PBKDF2" } as any,
        false,
        ["deriveBits"]
    ),
    265
);

```