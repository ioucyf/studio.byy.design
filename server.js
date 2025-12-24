import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const app = new Hono({ strict: false });

// Serve static files from the 'dist' directory
app.get('/', serveStatic({ root: './dist/', path: 'index.html' }));
app.get('/*', serveStatic({ root: './dist/' }));

console.log('Production server running on http://localhost:20284');
Deno.serve({ port: 20284 }, app.fetch);
