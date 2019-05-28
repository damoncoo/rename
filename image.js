let fs = require('fs')
let path = require('path')
let finder = require('./find')
let find = require('find')

/* 
    重命名所有的匹配的图片文件
 */
function processAllImages(files, option, renameFolder = false) {
    let origin = option.old
    let replace = option.new
    let imageReg = new RegExp(`^${origin}`)
    let p = new Promise(function (resolve, reject) {
        files.forEach(file => {
            let fileName = path.basename(file) //文件名
            let folder = path.dirname(file) // 文件夹
            fileName = fileName.replace(imageReg, replace)
            fs.renameSync(file, `${folder}/${fileName}`)
        })
        resolve(1)
    })
    return p
}

/* 
    替换类文件中所有的匹配image文件名
 */
function substituteImageName(classes, option) {

    let origin = option.old
    let replace = option.new
    let imageReg = new RegExp(`${origin}(?=_)`, 'g')
    classes.forEach(classFile => {
        console.log('Replacing Content in :' + classFile + '')
        let content = fs.readFileSync(classFile, 'utf8')

        content = content.replace(imageReg, replace)
        fs.writeFileSync(classFile, content)
    })
}

/* 
    替换类文件中所有的匹配image文件名
    重命名所有的匹配的图片文件
 */
async function renameImages(projectPath, option = {}) {

    let imageCallback = option.image
    let classCallback = option.classes

    try {
        let images = await finder.findAllFiles(/\.(png|jpg|jpeg)/, projectPath)
        if (imageCallback != null) {
            images = imageCallback(images)
        }

        let classFiles = await finder.findAllFiles(/\.(h|m|xib|pbxproj)/, projectPath)
        if (classCallback != null) {
            classFiles = classCallback(classFiles)
        }
        
        await substituteImageName(classFiles, option)
        await processAllImages(images, option)

        console.log('替换图片完成。。。')

    } catch (error) {
        console.log('替换图片失败。。。')
        console.log(error)
    }
}

exports.renameImages = renameImages

/* 
  整理所有的imagesets，使图片名和文件夹保持一致
 */
async function renameAllImagesets(projectPath, option = {}) {

    let origin = option.old
    let replace = option.new
    let imageSetReg = /\.(imageset)$/
    let imageRegGlobal1 = /(?<=")[\w\s_\-\u4e00-\u9fa5]+(?=(\.(png|jpg|jpeg)))/ //全局匹配图片的reg
    let imageRegGlobal2 = /(?<=")[\w\s_\-\u4e00-\u9fa5]+(?=(@2x\.(png|jpg|jpeg)))/ //全局匹配图片的reg
    let imageRegGlobal3 = /(?<=")[\w\s_\-\u4e00-\u9fa5]+(?=(@3x\.(png|jpg|jpeg)))/ //全局匹配图片的reg

    let imageReg = /[\w\s_\-\u4e00-\u9fa5]+(?=(@[23]x)?\.(png|jpg|jpeg))/ //匹配图片的reg
    try {

        let folders = await finder.findAllFiles(imageSetReg, projectPath, true)
        // 找到所有的imageset文件夹  
        // 遍历imageset 取出用到的名字
        folders.forEach(folder => {

            let fileName = path.basename(folder) // 文件名            
            let folderName = path.dirname(folder) // imageset目录名
            fileName = fileName.replace(imageSetReg, '') // 去掉后缀

            if (fileName != 'AppIcon') {
                if (origin && origin.length) {
                    fileName = fileName.replace(new RegExp(`^${origin}`), replace)
                }

                //更改文件夹里内容统一名字
                let subfiles = find.fileSync(/\.(png|jpg|jpeg)$/, folder)
                subfiles.forEach(subfile => {
                    let imageName = path.basename(subfile) //文件名           
                    imageName = imageName.replace(imageReg, fileName)
                    fs.renameSync(subfile, `${folder}/${imageName}`)
                })

                //更改contents.json 统一文件名
                let contentsJsonPath = `${folder}/Contents.json`
                if (fs.existsSync(contentsJsonPath)) {
                    let content = fs.readFileSync(contentsJsonPath, 'utf8')
                    let contentNew = content.replace(imageRegGlobal1, fileName)
                    contentNew = contentNew.replace(imageRegGlobal2, fileName)
                    contentNew = contentNew.replace(imageRegGlobal3, fileName)
                    fs.writeFileSync(contentsJsonPath, contentNew)
                }
                fs.renameSync(folder, `${folderName}/${fileName}.imageset`)
            }
        })
        console.log('重命名Imageset图片完成。。。')
    } catch (error) {
        console.log(error)
        console.log('重命名Imageset图片失败。。。')
    }
}

module.exports.renameAllImagesets = renameAllImagesets