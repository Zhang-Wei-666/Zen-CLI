

module.exports = {
  // 存放多个应用配置, 默认继承默认配置
  pipe: [
    
  ],
  // 应用默认配置
  config: {
    // 模式
    mode: 'development', // production
    // 入口文件夹
    entry: 'src/',
    // 出口文件夹
    output: 'dist/',
    // 入口文件名
    entryFilename: 'index.js',
    // 出口文件名
    outputFilename: 'index.[chunkhash].js'
  }
}