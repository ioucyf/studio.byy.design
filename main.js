import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';


const app = new Hono({strict: 'false'});

const ROOT = new URL(import.meta.url);

app.get('/', serveStatic({root:'./src/', path: 'index.html'}));
app.use('/*', serveStatic({root: './src/',  precompressed: true}))
Deno.serve({port: 20284}, app.fetch);

