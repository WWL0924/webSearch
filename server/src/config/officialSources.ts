//来源配置文件

type officialSourcesType = {
  key: string,
  name: string,
  aliases: string[],
  source: string,
  baseUrl: string,
  urlPrefix: string
}

const officialSources: officialSourcesType[] = [
  {
    key: 'react',
    name: 'React',
    aliases: ['react',
      'usestate',
      'useeffect',
      'usereducer',
      'usecontext',
      'useref',
      'usememo',
      'usecallback',
      'suspense',
      'strictmode',
      'jsx',],
    source: 'data\\docs\\react',
    baseUrl: 'https://react.dev',
    urlPrefix: '/reference'
  },
  {
    key: 'vite', //内部标识
    name: 'Vite',
    aliases: ['vite',
      'vite.config',
      'defineConfig',
      'HMR',
      'import.meta.env',
      'VITE_',
      'optimizeDeps',
      'create-vite',], //识别该来源的别名
    source: 'data\\docs\\vite', //路径
    baseUrl: 'https://vite.dev',
    urlPrefix: ''
  },
]

export default officialSources
