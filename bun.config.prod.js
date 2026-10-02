const result = await Bun.build({
  entrypoints: ['./src/index.html'],
  root: './src',
  outdir: './dist',
  target: 'browser',
  publicPath: './',
  minify: true
})

if (!result.success) {
  console.error(result.logs)
  process.exitCode = 1
} else {
  console.log('Готовая сборка находится в dist/')
}
