import bodyParser from 'body-parser'
import express from 'express'

import { createWriteStream } from 'node:fs'
const output = createWriteStream('output.ndjson')

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 1000, // 1 sec
    max: 30, // Limit each IP to 30 requests per `window` (here, per second)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()
app.use(bodyParser.json())
app.use(limiter)

const PORT = 3030

app.post('/', async (req, res) => {
    const { id, first_name } = req.body
    console.log('Received >>> ', id, first_name, new Date().toISOString())
    output.write(JSON.stringify({ id, first_name }) + '\n')

    return res.send('Ok!')
})

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
})