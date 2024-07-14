import fastify from "fastify"
import { prisma } from "./lib/prisma"

const app = fastify()

app.get('/teste', () => {
    return 'hello world'
})

app.get('/cadastrar', () => {
prisma.trip.create({data: {
    destination: 'Taubaté',
    
}})
})

app.get('/listar', () => {
    return 'hello world'
})

app.listen({ port: 3333 }).then(() => {
    console.log('server running')
})