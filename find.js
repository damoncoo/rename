
let find = require('find')
/* 
    找到匹配的文件
    match 正则或者文件名
    directory 根文件夹
    isDir 是否是文件夹
 */
function findAllFiles(match, directory, isDir = false) {
    var p = new Promise(function (resolve, reject) {
        if (isDir) {
            find.dir(match, directory, function (files) {
                resolve(files)
            })
        } else {
            find.file(match, directory, function (files) {
                resolve(files)
            })
        }
    })
    return p
}
exports.findAllFiles = findAllFiles