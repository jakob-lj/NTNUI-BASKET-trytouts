

const express = require('express')
var bodyParser = require('body-parser')

const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'db',
    database: 'postgres',
    password: 'pgspass',
    port: 5432,
})

client.connect()

const cors = require('cors')
const app = express()


var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use(bodyParser.json())

app.get('/api', async (req, res) => {
    res.send('Hello')
})

app.get('/api/db', async (req, res) => {
    let teamId = ''
    try {
        const r = await client.query('select t.id, t.time, t.date, team.name, count(j.id) as availableSpots from times as t inner join teams as team on team.id = t.teamid left join joining as j on t.id = j.tid where t.teamid = $1::uuid group by t.id, t.time, team.name, t.date', [teamId])
        
        res.send(r.rows)

    } catch (e) {
        res.send({error: true})
    }
    
})


app.get('/api/team/:teamId/', async (req, res) => {
    let teamId = req.params.teamId
    try {
        const r = await client.query('select t.id, t.time, t.date, team.name, (select availablespots from times where times.id = t.id)-count(j.id) as count from times as t inner join teams as team on team.id = t.teamid left join joining as j on t.id = j.tid where t.teamid = $1::uuid group by t.id, t.time, team.name, t.date', [teamId])
        res.send(r.rows)

    } catch (e) {
        res.send({error: true})
    }
})

app.post('/api/attend/:timeId/', async (req, res) => {
    const {timeId, name, email, phone} = req.body


    if (timeId !== '' && name !== '' && email !== '' && phone !== ''&& timeId !== undefined && name !== undefined && email !== undefined && phone !== undefined) {

        const checkToSeeIfAvailable = await client.query('select (select availablespots from times where times.id = joining.tid) - count(joining.id) as count from joining where joining.tid = $1::uuid group by joining.tid', [timeId])
        if (checkToSeeIfAvailable.rows.length === 0 || checkToSeeIfAvailable.rows[0].count > 0) {
            const result = await client.query('insert into joining(tid, name, email, phone) values ($1::uuid, $2::text, $3::text, $4::text) RETURNING *', [timeId, name, email, phone])
            const retResult = await client.query('select * from times where id = $1::uuid', [result.rows[0].tid])
    
            res.send({...result.rows[0], ...retResult.rows[0]})

        } else {
            return res.send({error: true, status: 'Fult'})
        }
    } else {
        res.send({error: true})
    }
})

app.listen(8000, () => {
    console.log('Listening at 8000')
})