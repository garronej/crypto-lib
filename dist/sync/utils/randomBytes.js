"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement_1 = require("./environnement");
function randomBytes(size, callback) {
    var MAX_UINT32 = randomBytes.MAX_UINT32, MAX_BYTES = randomBytes.MAX_BYTES, getRandomValues = randomBytes.getRandomValues, getNodeRandomBytes = randomBytes.getNodeRandomBytes;
    if (environnement_1.environnement.type === "NODE") {
        var toLocalBufferImplementation_1 = function (nodeBufferInst) { return Buffer.from(nodeBufferInst.buffer, nodeBufferInst.byteOffset, nodeBufferInst.length); };
        var nodeRandomBytes = getNodeRandomBytes();
        if (callback !== undefined) {
            nodeRandomBytes(size, function (err, buf) { return callback(err, !!buf ? toLocalBufferImplementation_1(buf) : buf); });
            return;
        }
        var nodeBufferInst = nodeRandomBytes(size);
        return toLocalBufferImplementation_1(nodeBufferInst);
    }
    // phantomjs needs to throw
    if (size > MAX_UINT32) {
        throw new RangeError('requested too many random bytes');
    }
    var bytes = Buffer.allocUnsafe(size);
    if (size > 0) { // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
            // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
            for (var generated = 0; generated < size; generated += MAX_BYTES) {
                // buffer.slice automatically checks if the end is past the end of
                // the buffer so we don't have to here
                getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
            }
        }
        else {
            getRandomValues(bytes);
        }
    }
    if (typeof callback === "function") {
        /*
        NOTE:If liquid core it will crash, it's ok
        liquid core is not supposed to do anything async
        */
        setTimeout(function () { return callback(null, bytes); }, 0);
        return;
    }
    return bytes;
}
exports.randomBytes = randomBytes;
(function (randomBytes) {
    // limit of Crypto.getRandomValues()
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    randomBytes.MAX_BYTES = 65536;
    // Node supports requesting up to this number of bytes
    // https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
    randomBytes.MAX_UINT32 = 4294967295;
    randomBytes.getRandomValues = (function () {
        //NOTE: Used when in edge in a service worker or with LiquidCore.
        var nonCryptographicGetRandomValue = function (abv) {
            var l = abv.length;
            while (l--) {
                abv[l] = Math.floor(Math.random() * 256);
            }
            return abv;
        };
        var browserGetRandomValues = (function () {
            if (typeof crypto === "object" && !!crypto.getRandomValues) {
                return crypto.getRandomValues.bind(crypto);
            }
            else if (typeof msCrypto === "object" && !!msCrypto.getRandomValues) {
                return msCrypto.getRandomValues.bind(msCrypto);
            }
            else if (typeof self === "object" && typeof self.crypto === "object" && !!self.crypto.getRandomValues) {
                return self.crypto.getRandomValues.bind(self.crypto);
            }
            else {
                return undefined;
            }
        })();
        return !!browserGetRandomValues ?
            browserGetRandomValues :
            nonCryptographicGetRandomValue;
    })();
    randomBytes.getNodeRandomBytes = (function () {
        var nodeRandomBytes = undefined;
        return function () {
            if (nodeRandomBytes === undefined) {
                nodeRandomBytes = require("crypto" + "").randomBytes;
            }
            return nodeRandomBytes;
        };
    })();
})(randomBytes = exports.randomBytes || (exports.randomBytes = {}));
