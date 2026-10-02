import index from './src/index.html'

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  routes: {
    '/': index
  },

  development: { hmr: false }
})

console.log(`Biological Signal Station: ${server.url}`)
