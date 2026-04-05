const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Forge Challenge is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Forge Challenge server running on http://0.0.0.0:${PORT}`);
});
