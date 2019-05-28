let fs = require('fs')
let path = require('path')
let find = require('./find')

async function findAllClassFiles(project, callback) {
    let classes = await find.findAllFiles(/\.(h|m|mm|xib|pbxproj|pch)/, project)
    if (callback != null) {
        classes = callback(classes)
    }
    return classes
}

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

    classes.forEach(classFile => {
        console.log('Replacing Content in : ' + classFile + '')

        let ispbxproj = /\.pbxproj$/.test(classFile)
        let content = fs.readFileSync(classFile, 'utf8')
        if (ispbxproj) {
            content = content.replace(creghm, replace)
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