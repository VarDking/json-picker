/**
 * Created by chen on 2016/9/15.
 */
'use strict';
var _          = require('lodash');
module.exports = picker;

/**
 * pick data from an object and maintain the same structure.
 * @param obj
 * @param {Array}  path
 * @param {Object} [ret]
 */
function pick(obj, path, ret) {
    if (!Array.isArray(path)) {
        throw new Error('path must be array type!');
    }
    ret     = ret || {};
    let len = path.length;
    let key = path.shift();
    obj     = obj[key];

    if (obj && len > 1) {
        if (!ret[key]) {
            ret[key] = {}
        }
        let next = ret[key];
        if (typeof obj === 'object') {
            if (!pick(obj, path, next)) {
                return false
            }
        }
    } else if (obj) {
        ret[key] = obj;
    } else {
        return false;
    }
    return ret;
}

/**
 * insert value into an object with specified path.
 * @param obj
 * @param path
 * @param value
 */
function insert(obj, path, value) {
    let len = path.length;
    let key = path.shift();

    if (len === 1) {
        obj[key] = value;
        return true;
    } else {
        if (!obj[key]) {
            obj[key] = {};
        }
        return insert(obj[key], path, value);
    }
}

/**
 * get object full paths.
 * @param obj
 */
function objFullPaths(obj) {
    function getPath(obj, path) {
        path     = path || '';
        let key  = Object.keys(obj)[0];
        let next = obj[key];
        if (next && isObject(next) && !isEmptyObject(next)) {
            return getPath(next, path + '.' + key);
        } else if (key) {
            delete obj[key];
            return path + '.' + key;
        }
        return false;
    }

    let path;
    let result = [];
    while (path = getPath(obj)) {
        result.push(path);
    }
    return result;
}

/**
 * isObject
 * @param obj
 * @returns {boolean}
 */
function isObject(obj) {
    return typeof obj === 'object';
}

/**
 * isEmptyObject
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    return typeof obj === 'object' && JSON.stringify(obj) === '{}';
}

/**
 *
 * @param obj
 * @param paths
 * @param mode   - greedy or self.Default value is self.
 * @returns {{}}
 */
function picker(obj, paths, mode) {
    let ret           = {};
    mode              = mode || 'self';
    let fullPaths     = objFullPaths(JSON.parse(JSON.stringify(obj)));
    let filteredPaths = filterPaths(fullPaths, paths, mode);

    filteredPaths = filteredPaths.sort().filter((item, index, arr)=> {
        let nextKey = arr[index + 1];
        if (!nextKey) {
            return true;
        } else {
            return !~arr[index + 1].indexOf(item);
        }
    });

    filteredPaths.forEach(fullPath=> {
        pick(obj, fullPath.substring(1).split('.'), ret);
    });
    return ret;
}

/**
 * filter the path we need
 * @param fullPaths
 * @param paths
 * @param mode
 */
function filterPaths(fullPaths, paths, mode) {
    let matchedPaths   = matched(fullPaths, paths);
    let matchedPathSet = new Set(matchedPaths);
    if (mode === 'self') {
        return matchedPaths;
    }

    let brothersPaths  = brothers(fullPaths, paths);
    let brohterPathSet = new Set(brothersPaths);

    return fullPaths.filter(fullPath=> {
        return matchedPathSet.has(fullPath) || !hasPath(brohterPathSet, fullPath);
    });
}

/**
 *
 * @param pathSet
 * @param path
 * @returns {boolean}
 */
function hasPath(pathSet, path) {
    path = path.split('.');
    while (path.length) {
        if (pathSet.has(path.join('.'))) {
            return true;
        }
        path.pop();
    }
    return false;
}

/**
 * filterPaths
 * @param fullPaths
 * @param paths
 */
function brothers(fullPaths, paths) {
    let brothers       = [];
    let matchedPaths   = matched(fullPaths, paths);
    let matchedPathSet = new Set(matchedPaths);

    let prefixSet = new Set(matchedPaths.map(getPrefix));
    fullPaths.forEach(fullPath => {
        let fullPathPrefix = getPrefix(fullPath);
        if (!matchedPathSet.has(fullPath) && prefixSet.has(fullPathPrefix)) {
            brothers.push(fullPath);
        }
    });

    return brothers;
}

/**
 * get path prefix
 * @param path
 * @returns {string}
 */
function getPrefix(path) {
    return path.substring(0, path.lastIndexOf('.'));
}

/**
 * match path
 * @param fullPaths
 * @param paths
 * @returns {Array.<T>|*}
 */
function matched(fullPaths, paths) {
    let result = [];
    paths.forEach(path => {
        let matched = fullPaths.filter(fullPath=> {
            return !!~fullPath.indexOf(path);
        });
        result.push(matched);
    });
    return _.flatten(result);
}