// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'LuizEduardo',
    password: '1122',
    database: 'lista_de_compras'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

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

// Obter todas as listas
app.get('/api/listas', (req, res) => {
    connection.query('SELECT * FROM listas', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar listas', error: err });
        res.json({ success: true, data: results });
    });
});

// Criar nova lista
app.post('/api/listas', (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ success: false, message: 'Nome é obrigatório' });
    connection.query('INSERT INTO listas (nome) VALUES (?)', [nome], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao criar lista', error: err });
        res.json({ success: true, id: result.insertId, nome });
    });
});

// Obter itens de uma lista
app.get('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    connection.query('SELECT * FROM itens WHERE lista_id = ?', [listaId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar itens', error: err });
        res.json({ success: true, data: results });
    });
});

// Adicionar item à lista
app.post('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    const { nome, quantidade, preco, categoria } = req.body;
    if (!nome) return res.status(400).json({ success: false, message: 'Nome do item é obrigatório' });
    connection.query(
        'INSERT INTO itens (lista_id, nome, quantidade, preco, categoria) VALUES (?, ?, ?, ?, ?)',
        [listaId, nome, quantidade || 1, preco || 0, categoria || 'outros'],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao adicionar item', error: err });
            res.json({ success: true, id: result.insertId, nome });
        }
    );
});

// Atualizar item
app.put('/api/itens/:itemId', (req, res) => {
    const { itemId } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    connection.query(
        'UPDATE itens SET nome=?, quantidade=?, preco=?, categoria=?, concluido=? WHERE id=?',
        [nome, quantidade, preco, categoria, concluido, itemId],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao atualizar item', error: err });
            res.json({ success: true, message: 'Item atualizado com sucesso' });
        }
    );
});

// Deletar item
app.delete('/api/itens/:itemId', (req, res) => {
    const { itemId } = req.params;
    connection.query('DELETE FROM itens WHERE id=?', [itemId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao deletar item', error: err });
        res.json({ success: true, message: 'Item removido com sucesso' });
    });
});

// Limpar itens concluídos de uma lista
app.delete('/api/listas/:listaId/itens/concluidos', (req, res) => {
    const { listaId } = req.params;
    connection.query('DELETE FROM itens WHERE lista_id=? AND concluido=1', [listaId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao limpar itens concluídos', error: err });
        res.json({ success: true, message: 'Itens concluídos removidos', removedCount: result.affectedRows });
    });
});

// Limpar todos os itens de uma lista
app.delete('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    connection.query('DELETE FROM itens WHERE lista_id=?', [listaId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao limpar lista', error: err });
        res.json({ success: true, message: 'Lista limpa com sucesso', removedCount: result.affectedRows });
    });
});

// Obter uma lista específica
app.get('/api/listas/:listaId', (req, res) => {
    const { listaId } = req.params;
    connection.query('SELECT * FROM listas WHERE id = ?', [listaId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar lista', error: err });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Lista não encontrada' });
        res.json({ success: true, data: results[0] });
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