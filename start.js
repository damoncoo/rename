let args = require('node-args')
let image = require('./image')
let classes = require('./class')

let project = "/Users/Darcy/Desktop/AntBrand/ABProject"
let step = args.step

if (step == 1) {
  image.renameAllImagesets(project, {
    old: "twpic",
    new: "sxpic"
  })
} else if (step == 2) {  
  image.renameImages(project, {
    old: "twpic",
    new: "sxpic",
    image: function (images) {
      let filtered = images.filter((classFile) => !/(\.framework|Pods)/.test(classFile))
      return filtered
    },
    classes: function (classes) {
      let filtered = classes.filter((classFile) => !/(\.xcassets|Pods|\.framework)/.test(classFile))
      return filtered
    },
  })
} else if (step == 3) {
  // 
  classes.renameClasses(project, {
    old: "TW",
    new: "SX"
  }, function (classes) {
    let filtered = classes.filter((classFile) => !/(\.framework)|(Pods)/.test(classFile))
    return filtered
  })
} else {
  console.log('NO STEP PASSED')
  process.exit(1)
}