let fs = require('fs')
let path = require('path')
let find = require('./find')

async function findAllClassFiles(project, callback) {
    let classes = await find.findAllFiles(/\.(h|m|mm|xib|pbxproj|pch|swift)$/, project)
    if (callback != null) {
        classes = callback(classes)
    }
    return classes
}

async function renameFolders(project, option, callback) {
    let origin = option.old
    let replace = option.new
    let folders = await find.findAllFiles(new RegExp(origin, 'g'), project, true)

    if (callback != null) {
        folders = callback(folders)
    }

    folders.forEach(folder => {
        let basename = path.basename(folder) // 最后一层文件夹
        let dirname = path.dirname(folder) // 上层文件夹
        if (new RegExp(origin, 'g').test(basename)) {
            console.log('Rename'+ basename)
            basename = basename.replace(new RegExp(`^${origin}`), replace)
            console.log(folder)
            console.log(`${dirname}/${basename}`)
            fs.renameSync(folder, `${dirname}/${basename}`)
        }
    })
}

module.exports.renameFolders = renameFolders

async function renameClasses(project, option, callback) {

    let origin = option.old
    let replace = option.new
    let classes = await findAllClassFiles(project)

    let dms = await find.findAllFiles(/\.xcdatamodel$/, project, true)
    dms.forEach((dm) => {
        classes.push(`${dm}/contents`)
    })

    if (callback != null) {
        classes = callback(classes)
    }

    // 类名的reg
    let creg = new RegExp(`(?<=([\\s\[\(\)"<,:\*/\\-\?\}\^=]))${origin}(?=([A-Z][\\w\+_]+))`, 'g')
    // 带后缀的h m
    let creghm = new RegExp(`(?<=([\\s\[\(\)"<,:\*/\\-\?\}\^=]))${origin}(?=([A-Z][\\w\+_]+\.(h|m|xib)(\\s|;|")))`, 'g')

    // 类名的plist
    let plistreg = new RegExp(`(?<=([\>]))${origin}(?=([A-Z][\\w\+_]+))`, 'g')

    classes.forEach(classFile => {
        console.log(`${classFile}`)
        console.log('Replacing Content in : ' + classFile + '')

        let ispbxproj = /\.pbxproj$/.test(classFile)
        let isplist = /\.plist$/.test(classFile)
        let content = fs.readFileSync(classFile, 'utf8')
        if (ispbxproj) {
            content = content.replace(creghm, replace)
        } else if (isplist) {
            content = content.replace(plistreg, replace)
        } else {
            content = content.replace(creg, replace)
        }
        fs.writeFileSync(classFile, content)

        let fileName = path.basename(classFile)
        let folder = path.dirname(classFile)

        let preg = new RegExp(`^${origin}[A-Z].*`)
        if (preg.test(fileName)) {
            console.log('Rename ' + fileName)
            fileName = fileName.replace(new RegExp(`^${origin}`), replace)
            fs.renameSync(classFile, `${folder}/${fileName}`)
        }
    })

}

exports.renameClasses = renameClasses