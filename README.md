# Introduction
json-picker is a tool to help pick value from JSON data.   
You can use it to custom your json data conveniently.   
It is a simple tool or a middleware for express and koa.   

## Example
1.  Use it as a library.  

```
 npm install json-picker

var picker = require('json-picker');

var sourceData  = {
    "post"    : [
        {"id": 1, "title": "posts1", "author": "Jack"},
        {"id": 2, "title": "posts2", "author": "Tom"}
    ],
    "comments": [
        {"id": 1, "body": "some comment1", "postId": 1, author: "Alan"},
        {"id": 2, "body": "some comment2", "postId": 2, author: "Hero"}
    ],
    "profile" : {
        "name": "Jack", "email": "jack@gmail.com", "followers": [
            {"userId": 1, "userName": "Alice", "Tel": "12324556"},
            {"userId": 2, "userName": "Linus", "Tel": "1222222"}
        ]
    }
};

var customData = picker(sourceData,['post[].id','post[].author'])
// returns { post: [ { author: 'Jack', id: 1 }, { author: 'Tom', id: 2 } ] }

```
