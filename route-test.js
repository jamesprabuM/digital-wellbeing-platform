// Route test to debug server file serving
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

console.log('Current directory:', __dirname);
console.log('Static path:', path.join(__dirname));

app.use(express.static(__dirname));

app.get('/test', (req, res) => {
  res.send('Route test successful');
});

app.get('*', (req, res) => {
  console.log('Requested path:', req.path);
  res.send(`Requested path: ${req.path}`);
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try accessing http://localhost:${PORT}/supabase-auth.html`);
});