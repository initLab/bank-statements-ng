import express from 'express';
import { processFiles } from '../processing/index.js';

const app = express();

app.use((req, _, next) => {
    // noinspection HttpUrlsUsage
    console.log(`[http] ${req.method} ${req.url} [${req.socket.remoteAddress}:${req.socket.remotePort}]`);
    next();
});

app.post('/initlab-bank-statements-process-file', (req, res) => {
    const start = Date.now();

    processFiles()
        .then(() => res.send(`Processed in ${((Date.now() - start) / 1000).toFixed(3)} seconds\n`))
        .catch(e => res.status(500).send(e.stack));
});

export function listenHttp() {
    const port = process.env.PORT ?? 3000;
    const hostname = process.env.HOST ?? 'localhost';

    app.listen(port, hostname, () => {
        // noinspection HttpUrlsUsage
        console.log(`Listening on http://${hostname}:${port}`);
    });
}
