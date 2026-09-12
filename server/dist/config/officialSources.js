const officialSources = [
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
        source: 'data\\docs\\react'
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
        source: 'data\\docs\\vite' //路径
    },
];
export default officialSources;
//# sourceMappingURL=officialSources.js.map