require('@moomfe/zenjs');
const path = require('path');
const fs = require('fs-extra');
const readDir = require('../util/readDir');
const webpackConfig = require('../../config/webpack.config');
const rollupConfig = require('../../config/rollup.config');
const processing = require('../processing/index');


module.exports = async function init( userConfigs ){
  /**
   * 处理完路径信息, 产生的新的配置集
   */
  const configs = initPath( userConfigs, [] );
  /**
   * 根据用户配置, 生成的对应的打包配置
   */
  const webpackRollupConfigs = createConfig( configs, [] );

  // 生成完整的打包配置
  initConfig(
    webpackRollupConfigs
  );
}


/**
 * 初始化入口出口信息
 * 如果是自动搜寻打包模式, 则去搜索入口目录
 * @param {any[]} userConfigs 初始配置集
 * @param {any[]} configs 最终配置集
 */
function initPath( userConfigs, configs ){

  userConfigs.forEach( config => {

    // 当前配置是处理单个文件
    if( config.from ){
      config.from = path.resolve( runCommandPath, config.from );
      config.to = path.resolve( runCommandPath, config.to );
      config.entry = path.dirname( config.from );
      config.output = path.dirname( config.to );
      config.entryFilename = path.basename( config.from );
      config.outputFilename = path.basename( config.to );

      // 添加进最终配置集
      configs.push( config );
    }
    // 当前配置是自动搜寻模式
    else{
      config.entry = path.resolve( runCommandPath, config.entry );
      config.output = path.resolve( runCommandPath, config.output );

      // 删除不相关参数
      config.$delete( 'from', 'to' );

      // 遍历查找所有入口文件
      recursiveEntry( config.entry, config, configs );
    }

  });

  return configs;
}

/**
 * 使用搜索自动搜寻打包模式的配置, 尝试寻找入口文件夹所有匹配的打包入口文件
 * @param {*} entry 入口文件夹
 * @param {*} config 单个自动搜寻打包配置
 * @param {*} configs 最终配置集
 */
function recursiveEntry( entry, config, configs ){
  /** 该文件夹下所有文件及文件夹 */
  const files = readDir( entry );

  files.forEach( name => {
    const path = `${ entry }\\${ name }`;
    const stat = fs.statSync( path );

    // 当前路径是文件夹, 递归继续向内查找
    if( stat.isDirectory() ){
      return recursiveEntry( path, config, configs );
    }

    // 查找到了入口文件
    if( stat.isFile() ){
      if( name.toLowerCase() === config.entryFilename.toLowerCase() ){
        configs.push(
          Object.$assign( {}, config, {
            entry,
            output: entry.replace( config.entry, config.output )
          })
        );
      }
    }
  });
}

/**
 * 初始化配置集到相应的代码打包工具
 * @param {any[]} userConfigs 配置集
 */
function createConfig( userConfigs, webpackRollupConfigs ){
  userConfigs.forEach( config => {
    // 生成对应打包工具的配置
    const webpackRollupConfig = Object.$assign(
      {},
      config.useRollup ? rollupConfig
                       : webpackConfig
    );

    // 用于区分两种配置
    if( !config.useRollup ){
      ZenJS.defineGet( webpackRollupConfig, 'isWebpack', ZenJS.returnTrue );
    }

    // 用户配置与打包配置互相建立引用
    ZenJS.defineGet( webpackRollupConfig, 'Zen-CLI-Config', () => config );
    ZenJS.defineGet( config, 'Webpack-Rollup-Config', () => webpackRollupConfig );

    webpackRollupConfigs.push(
      webpackRollupConfig
    );
  });
  
  return webpackRollupConfigs;
}

function initConfig( webpackRollupConfigs ){
  webpackRollupConfigs.forEach( webpackRollupConfig => {
    const config = webpackRollupConfig['Zen-CLI-Config'];

    // 初始化配置
    processing(
      webpackRollupConfig,
      config
    );

    // 配置其它项
    ExternalProcessing.forEach(({ handler }) => {
      handler(
        webpackRollupConfig,
        config
      );
    });
  });
}


const ExternalProcessing = [
  
];