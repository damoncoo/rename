#!/usr/bin/env node

let program = require('commander')
let image = require('./image')
let classes = require('./class')

program
  .command('assets <project>')
  .option('-o, --old [type]', 'origin prefix')
  .option('-n, --new [type]', 'new prefix')
  .action((project, cmdObj) => {
    console.log('Renameing Assets...')
    image.renameAllImagesets(project, {
      old: cmdObj.old,
      new: cmdObj.new
    })
  })

program
  .command('images <project>')
  .option('-o, --old [type]', 'origin prefix')
  .option('-n, --new [type]', 'new prefix')
  .action((project, cmdObj) => {
    console.log('Renameing Images...')
    image.renameImages(project, {
      old: cmdObj.old,
      new: cmdObj.new,
      image: function (images) {
        let filtered = images.filter((classFile) => !/(\.framework|Pods)/.test(classFile))
        return filtered
      },
      classes: function (classes) {
        let filtered = classes.filter((classFile) => !/(\.xcassets|Pods|\.framework)/.test(classFile))
        return filtered
      },
    })
  })

program
  .command('classes <project>')
  .option('-o, --old [type]', 'origin prefix')
  .option('-n, --new [type]', 'new prefix')
  .option('-e, --extra [type]', 'extra classes')
  .action((project, cmdObj) => {
    console.log('Renameing Classes...')
    classes.renameClasses(project, {
      old: cmdObj.old,
      new: cmdObj.new
    }, function (classes) {
      let filtered = classes.filter((classFile) => !/(\.framework)|(Pods)/.test(classFile))
      if (cmdObj.extra && cmdObj.extra.length) {
        filtered.push(cmdObj.extra)
      }
      return filtered
    })
  })


program.parse(process.argv)