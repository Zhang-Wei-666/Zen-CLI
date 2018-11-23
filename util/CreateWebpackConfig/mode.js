

module.exports = function( NewWebpackConfig, config ){
  // 生产环境
  if( config.mode === true || config.mode === 'production' ){
    NewWebpackConfig.mode = 'production';
  }
  // 开发模式 ( 默认模式 )
  else{
    NewWebpackConfig.mode = 'development';
  }
}