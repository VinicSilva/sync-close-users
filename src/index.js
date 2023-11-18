import { Transform, Readable } from 'node:stream'
import mysql from 'mysql2'
import { log, makeRequest } from './util.js'
import ThrottleRequest from './throttle.js'

const throttle = new ThrottleRequest({
    objectMode: true,
    requestsPerSecond: 30
})

const connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    database: 'dump'
})

const dataProcessor = Transform({
    objectMode: true,
    transform(chunk, enc, callback) {
        return callback(null, JSON.stringify(chunk))
    }
})

function getUnsyncedContractors() {
    const fiveHoursAgo = new Date(new Date() - 5 * 60 * 60 * 1000);
    const sql = `SELECT * FROM contractors
                 WHERE close_id IS NOT NULL
                   AND close_synced_at < ?
                 ORDER BY close_synced_at ASC`;

    const query = connection.query(sql, [fiveHoursAgo]);

    const stream = new Readable({
        objectMode: true,
        read() { }
    });

    query.on('result', (row) => {
        stream.push(row);
    });

    query.on('end', () => {
        stream.push(null);
        log(`Finished reading from database ${new Date().toISOString()}\n`);
    });

    query.on('error', (err) => {
        stream.destroy(err);
    });

    return stream.pipe(dataProcessor).pipe(throttle)
}

log(`Starting reading from database ${new Date().toISOString()}\n`);
getUnsyncedContractors().on('data', (data) => {
    const payload = JSON.parse(data)
    makeRequest(payload)
})