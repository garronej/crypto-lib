"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Map = /** @class */ (function () {
    function Map() {
        this.record = [];
    }
    Map.prototype.has = function (key) {
        return this.record
            .map(function (_a) {
            var _key = _a[0];
            return _key;
        })
            .indexOf(key) >= 0;
    };
    Map.prototype.get = function (key) {
        var entry = this.record
            .filter(function (_a) {
            var _key = _a[0];
            return _key === key;
        })[0];
        if (entry === undefined) {
            return undefined;
        }
        return entry[1];
    };
    Map.prototype.set = function (key, value) {
        var entry = this.record
            .filter(function (_a) {
            var _key = _a[0];
            return _key === key;
        })[0];
        if (entry === undefined) {
            this.record.push([key, value]);
        }
        else {
            entry[1] = value;
        }
    };
    Map.prototype.delete = function (key) {
        var index = this.record.map(function (_a) {
            var key = _a[0];
            return key;
        }).indexOf(key);
        if (index < 0) {
            return;
        }
        this.record.splice(index, 1);
    };
    Map.prototype.keys = function () {
        return this.record.map(function (_a) {
            var key = _a[0];
            return key;
        });
    };
    return Map;
}());
exports.Map = Map;
var Set = /** @class */ (function () {
    function Set() {
        this.map = new Map();
    }
    Set.prototype.has = function (value) {
        return this.map.has(value);
    };
    Set.prototype.add = function (value) {
        this.map.set(value, true);
    };
    Set.prototype.values = function () {
        return this.map.keys();
    };
    return Set;
}());
exports.Set = Set;
