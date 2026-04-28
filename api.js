const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let items = [];
let nextId = 1;

app.get('/items', (req, res) => {
    res.json(items);
});

app.get('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = items.find(i => i.id === id);
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
});

app.post('/items', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const newItem = { id: nextId++, name, description: description || '' };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    items[itemIndex] = { id, name, description: description || '' };
    res.json(items[itemIndex]);
});

app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }
    const deletedItem = items.splice(itemIndex, 1)[0];
    res.json(deletedItem);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});