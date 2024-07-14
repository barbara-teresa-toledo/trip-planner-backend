import fastify from "fastify"

const app = fastify()

app.get('/teste', () => {
    return 'hello world'
})

app.listen({ port: 3333 }).then(() => {
    console.log('server running')
})