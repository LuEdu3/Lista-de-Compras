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
    user: 'LuizEduardo', // Seu usuário do MySQL
    password: '1122', // Sua senha do MySQL
    database: 'lista_de_compras'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.stack);
        return;
    }
    console.log('Conectado ao MySQL como id ' + connection.threadId);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'

// Rota principal (serve o index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Obter todas as listas
app.get('/api/listas', (req, res) => {
    connection.query('SELECT * FROM listas ORDER BY nome ASC', (err, results) => {
        if (err) {
            console.error('Erro ao buscar listas:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar listas', error: err });
        }
        res.json({ success: true, data: results });
    });
});

// Criar nova lista
app.post('/api/listas', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Nome da lista é obrigatório.' });
    }
    connection.query('INSERT INTO listas (nome) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.error('Erro ao criar lista:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar lista', error: err });
        }
        res.status(201).json({ success: true, message: 'Lista criada com sucesso!', listId: result.insertId });
    });
});

// Renomear lista
app.put('/api/listas/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Novo nome da lista é obrigatório.' });
    }
    connection.query('UPDATE listas SET nome = ? WHERE id = ?', [name, id], (err, result) => {
        if (err) {
            console.error('Erro ao renomear lista:', err);
            return res.status(500).json({ success: false, message: 'Erro ao renomear lista', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada.' });
        }
        res.json({ success: true, message: 'Lista renomeada com sucesso.' });
    });
});

// Excluir lista (e seus itens via CASCADE)
app.delete('/api/listas/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM listas WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir lista:', err);
            return res.status(500).json({ success: false, message: 'Erro ao excluir lista', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada.' });
        }
        res.json({ success: true, message: 'Lista excluída com sucesso.', deletedRows: result.affectedRows });
    });
});

// Obter itens de uma lista específica
app.get('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    connection.query('SELECT * FROM itens WHERE lista_id = ? ORDER BY id DESC', [listaId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar itens da lista:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar itens da lista', error: err });
        }
        res.json({ success: true, data: results });
    });
});

// Adicionar item a uma lista
app.post('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    if (!nome) {
        return res.status(400).json({ success: false, message: 'Nome do item é obrigatório.' });
    }
    connection.query(
        'INSERT INTO itens (lista_id, nome, quantidade, preco, categoria, concluido) VALUES (?, ?, ?, ?, ?, ?)',
        [listaId, nome, quantidade || 1, preco || 0, categoria || 'geral', concluido || false],
        (err, result) => {
            if (err) {
                console.error('Erro ao adicionar item:', err);
                return res.status(500).json({ success: false, message: 'Erro ao adicionar item', error: err });
            }
            res.status(201).json({ success: true, message: 'Item adicionado com sucesso!', itemId: result.insertId });
        }
    );
});

// Atualizar item
app.put('/api/itens/:id', (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    const updates = {};
    if (nome !== undefined) updates.nome = nome;
    if (quantidade !== undefined) updates.quantidade = quantidade;
    if (preco !== undefined) updates.preco = preco;
    if (categoria !== undefined) updates.categoria = categoria;
    if (concluido !== undefined) updates.concluido = concluido;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
    }

    const query = 'UPDATE itens SET ? WHERE id = ?';
    connection.query(query, [updates, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar item', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }
        res.json({ success: true, message: 'Item atualizado com sucesso.' });
    });
});

// Excluir item
app.delete('/api/itens/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM itens WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao excluir item', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }
        res.json({ success: true, message: 'Item excluído com sucesso.' });
    });
});

// Limpar itens concluídos de uma lista
app.delete('/api/listas/:listaId/itens/concluidos', (req, res) => {
    const { listaId } = req.params;
    connection.query('DELETE FROM itens WHERE lista_id = ? AND concluido = TRUE', [listaId], (err, result) => {
        if (err) {
            console.error('Erro ao limpar itens concluídos:', err);
            return res.status(500).json({ success: false, message: 'Erro ao limpar itens concluídos', error: err });
        }
        res.json({ success: true, message: 'Itens concluídos removidos.', removedCount: result.affectedRows });
    });
});

// Limpar todos os itens de uma lista
app.delete('/api/listas/:listaId/itens', (req, res) => {
    const { listaId } = req.params;
    connection.query('DELETE FROM itens WHERE lista_id=?', [listaId], (err, result) => {
        if (err) {
            console.error('Erro ao limpar lista (todos os itens):', err);
            return res.status(500).json({ success: false, message: 'Erro ao limpar lista', error: err });
        }
        res.json({ success: true, message: 'Lista limpa com sucesso', removedCount: result.affectedRows });
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
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Opcional: página 404 personalizada
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});