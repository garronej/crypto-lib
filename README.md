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

FIXME: Some types for the sync function are not exported.

[Tests and benchmarks for the browser](https://garronej.github.io/crypto-lib/)

```bash
npm run build
```
OR  

```bash
npm run build -- -w
```