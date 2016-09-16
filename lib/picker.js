/**
 * Created by chen on 2016/9/15.
 */
'use strict';
var _ = require('lodash');
module.exports = picker;

/**
 * pick data from an object and maintain the same structure.
 * @param obj
 * @param {Array}  path
 * @param {Object} [ret]
 */
function pick(obj, path, ret){
    if(!Array.isArray(path)){
        throw new Error('path must be array type!');
    }
    ret = ret || {};
    let len = path.length;
    let key = path.shift();
    obj = obj[key];

    if(obj && len > 1){
        let next = ret[key] = {};
        if(typeof obj === 'object'){
            if(!pick(obj, path, next)){
                return false
            }
        }
    } else if(obj){
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
function insert(obj, path, value){
    let len = path.length;
    let key = path.shift();

    if(len === 1){
        obj[key] = value;
        return true;
    } else {
        if(!obj[key]){
            obj[key] = {};
        }
        return insert(obj[key], path, value);
    }
}

/**
 * get object full paths.
 * @param obj
 */
function fullPaths(obj){
    function getPath(obj, path){
        path = path || '';
        let key = Object.keys(obj)[0];
        let next = obj[key];
        if(next && isObject(next) && !isEmptyObject(next)){
            return getPath(next, path + '.' + key);
        } else if(key){
            delete obj[key];
            return path + '.' + key;
        }
        return false;
    }

    let path;
    let result = [];
    while(path = getPath(obj)){
        result.push(path);
    }
    return result;
}

/**
 * isObject
 * @param obj
 * @returns {boolean}
 */
function isObject(obj){
    return typeof obj === 'object';
}

/**
 * isEmptyObject
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj){
    return typeof obj === 'object' && JSON.stringify(obj) === '{}';
}

/**
 *
 * @param obj
 * @param paths
 * @param mode   -select mode, only-key or only self
 * @returns {{}}
 */
function picker(obj, paths, mode){
    let ret = {};
    var result;
    let objFullPaths = fullPaths(JSON.parse(JSON.stringify(obj)));
    paths.forEach(path=>{
        if(!result){
            result = filterPaths(objFullPaths, path, mode);
        }else{
            console.error('result1', result);
            result = _.intersection(result,filterPaths(objFullPaths, path, mode));
        }
        console.error('result', result);
    });
    result.forEach(fullPath=>{
        console.error('fullpath',fullPath);
        return pick(obj, fullPath.substring(1).split('.'), ret)
    });
    return ret;
}

/**
 * filterPaths
 * @param fullPaths
 * @param path
 * @param [mode]  -选择模式 without-brother or only self(default value)
 */
function filterPaths(fullPaths, path, mode){
    mode = mode || 'self';
    let bestMatch;
    let brothers = [];
    let matched = fullPaths.filter(fullPath=>!!~fullPath.indexOf(path));
    matched.forEach(item=>{
        if(!bestMatch || item.length <= bestMatch.length){
            bestMatch = item;
        }
    });
    let prefix = bestMatch.substring(0, bestMatch.lastIndexOf('.'));
    fullPaths.forEach(fullPath =>{
        if(fullPath.indexOf(prefix) !== -1 && matched.indexOf(fullPath) === -1){
            brothers.push(fullPath);
        }
    });
    brothers.push(prefix);
    return mode === 'self' ? matched : _.xor(fullPaths, brothers);
}
