// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de dados em memória (em produção, use um banco de dados real)
let shoppingLists = {};

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Obter lista de compras
app.get('/api/list/:userId', (req, res) => {
    const { userId } = req.params;
    const userList = shoppingLists[userId] || [];
    res.json({
        success: true,
        data: userList
    });
});

// Salvar lista de compras
app.post('/api/list/:userId', (req, res) => {
    const { userId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Items deve ser um array'
        });
    }

    shoppingLists[userId] = items;

    res.json({
        success: true,
        message: 'Lista salva com sucesso',
        data: items
    });
});

// Adicionar item à lista
app.post('/api/list/:userId/item', (req, res) => {
    const { userId } = req.params;
    const { name, quantity, price, category } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Nome do item é obrigatório'
        });
    }

    if (!shoppingLists[userId]) {
        shoppingLists[userId] = [];
    }

    const newItem = {
        id: Date.now(),
        name,
        quantity: quantity || 1,
        price: price || 0,
        category: category || 'outros',
        completed: false,
        dateAdded: new Date().toISOString()
    };

    shoppingLists[userId].unshift(newItem);

    res.json({
        success: true,
        message: 'Item adicionado com sucesso',
        data: newItem
    });
});

// Atualizar item
app.put('/api/list/:userId/item/:itemId', (req, res) => {
    const { userId, itemId } = req.params;
    const { name, quantity, price, category, completed } = req.body;

    if (!shoppingLists[userId]) {
        return res.status(404).json({
            success: false,
            message: 'Lista não encontrada'
        });
    }

    const itemIndex = shoppingLists[userId].findIndex(item => item.id == itemId);

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Item não encontrado'
        });
    }

    const item = shoppingLists[userId][itemIndex];

    // Atualizar apenas os campos fornecidos
    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (completed !== undefined) item.completed = completed;

    item.dateModified = new Date().toISOString();

    res.json({
        success: true,
        message: 'Item atualizado com sucesso',
        data: item
    });
});

// Deletar item
app.delete('/api/list/:userId/item/:itemId', (req, res) => {
    const { userId, itemId } = req.params;

    if (!shoppingLists[userId]) {
        return res.status(404).json({
            success: false,
            message: 'Lista não encontrada'
        });
    }

    const itemIndex = shoppingLists[userId].findIndex(item => item.id == itemId);

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Item não encontrado'
        });
    }

    shoppingLists[userId].splice(itemIndex, 1);

    res.json({
        success: true,
        message: 'Item removido com sucesso'
    });
});

// Limpar itens concluídos
app.delete('/api/list/:userId/completed', (req, res) => {
    const { userId } = req.params;

    if (!shoppingLists[userId]) {
        return res.status(404).json({
            success: false,
            message: 'Lista não encontrada'
        });
    }

    const completedCount = shoppingLists[userId].filter(item => item.completed).length;
    shoppingLists[userId] = shoppingLists[userId].filter(item => !item.completed);

    res.json({
        success: true,
        message: `${completedCount} item(s) removido(s)`,
        removedCount: completedCount
    });
});

// Limpar toda a lista
app.delete('/api/list/:userId', (req, res) => {
    const { userId } = req.params;

    const itemCount = shoppingLists[userId] ? shoppingLists[userId].length : 0;
    shoppingLists[userId] = [];

    res.json({
        success: true,
        message: 'Lista limpa com sucesso',
        removedCount: itemCount
    });
});

// Obter estatísticas
app.get('/api/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const userList = shoppingLists[userId] || [];

    const stats = {
        totalItems: userList.length,
        completedItems: userList.filter(item => item.completed).length,
        pendingItems: userList.filter(item => !item.completed).length,
        totalValue: userList.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        completedValue: userList
            .filter(item => item.completed)
            .reduce((sum, item) => sum + (item.quantity * item.price), 0),
        categories: {}
    };

    // Contar itens por categoria
    userList.forEach(item => {
        if (!stats.categories[item.category]) {
            stats.categories[item.category] = 0;
        }
        stats.categories[item.category]++;
    });

    res.json({
        success: true,
        data: stats
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});

module.exports = app;