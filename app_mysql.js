// app.js - Versão MySQL
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do pool de conexões MySQL
const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lista_de_compras',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
});

// Testar conexão
(async () => {
    try {
        const conn = await connection.getConnection();
        console.log('✅ Conectado ao MySQL!');
        conn.release();
    } catch (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.log('📋 Verifique se:');
        console.log('   - MySQL está rodando');
        console.log('   - Credenciais no .env estão corretas');
        console.log('   - Banco "lista_de_compras" foi criado');
    }
})();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Obter todas as listas de um deviceId
app.get('/api/listas', async (req, res) => {
    const deviceId = req.query.deviceId || req.headers['deviceid'] || req.headers['device-id'];
    if (!deviceId) {
        return res.status(400).json({ success: false, message: 'deviceId é obrigatório.' });
    }
    try {
        const [rows] = await connection.execute('SELECT * FROM listas WHERE device_id = ? ORDER BY nome ASC', [deviceId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Erro ao buscar listas:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar listas', error: err.message });
    }
});

// Criar nova lista
app.post('/api/listas', async (req, res) => {
    const { name, deviceId } = req.body || {};
    if (!name || !deviceId) {
        return res.status(400).json({ success: false, message: 'Nome da lista e deviceId são obrigatórios.' });
    }
    try {
        const [result] = await connection.execute('INSERT INTO listas (nome, device_id) VALUES (?, ?)', [name, deviceId]);
        res.status(201).json({ success: true, message: 'Lista criada com sucesso!', listId: result.insertId });
    } catch (err) {
        console.error('Erro ao criar lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar lista', error: err.message });
    }
});

// Renomear lista
app.put('/api/listas/:id', async (req, res) => {
    const { id } = req.params;
    const { name, deviceId } = req.body || {};
    if (!name || !deviceId) {
        return res.status(400).json({ success: false, message: 'Novo nome da lista e deviceId são obrigatórios.' });
    }
    try {
        const [result] = await connection.execute('UPDATE listas SET nome = ? WHERE id = ? AND device_id = ?', [name, id, deviceId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada ou deviceId incorreto.' });
        }
        res.json({ success: true, message: 'Lista renomeada com sucesso.' });
    } catch (err) {
        console.error('Erro ao renomear lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao renomear lista', error: err.message });
    }
});

// Excluir lista
app.delete('/api/listas/:id', async (req, res) => {
    const { id } = req.params;
    const { deviceId } = req.body || {};
    if (!deviceId) {
        return res.status(400).json({ success: false, message: 'deviceId é obrigatório.' });
    }
    try {
        const [result] = await connection.execute('DELETE FROM listas WHERE id = ? AND device_id = ?', [id, deviceId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada ou deviceId incorreto.' });
        }
        res.json({ success: true, message: 'Lista excluída com sucesso.', deletedRows: result.affectedRows });
    } catch (err) {
        console.error('Erro ao excluir lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir lista', error: err.message });
    }
});

// Obter itens de uma lista específica
app.get('/api/listas/:listaId/itens', async (req, res) => {
    const { listaId } = req.params;
    try {
        const [rows] = await connection.execute('SELECT * FROM itens WHERE lista_id = ? ORDER BY id DESC', [listaId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Erro ao buscar itens da lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar itens da lista', error: err.message });
    }
});

// Adicionar item a uma lista
app.post('/api/listas/:listaId/itens', async (req, res) => {
    const { listaId } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    if (!nome) {
        return res.status(400).json({ success: false, message: 'Nome do item é obrigatório.' });
    }
    try {
        const [result] = await connection.execute(
            'INSERT INTO itens (lista_id, nome, quantidade, preco, categoria, concluido) VALUES (?, ?, ?, ?, ?, ?)',
            [listaId, nome, quantidade || 1, preco || 0, categoria || 'geral', concluido || false]
        );

        // Salva palavra aprendida ao adicionar item
        if (categoria && nome) {
            await connection.execute(
                `INSERT INTO palavras_aprendidas (palavra, categoria)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE categoria = VALUES(categoria)`,
                [nome.toLowerCase().trim(), categoria]
            );
        }

        res.status(201).json({ success: true, message: 'Item adicionado com sucesso!', itemId: result.insertId });
    } catch (err) {
        console.error('Erro ao adicionar item:', err);
        res.status(500).json({ success: false, message: 'Erro ao adicionar item', error: err.message });
    }
});

// Atualizar item
app.put('/api/itens/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    const updates = [];
    const values = [];

    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (quantidade !== undefined) { updates.push('quantidade = ?'); values.push(quantidade); }
    if (preco !== undefined) { updates.push('preco = ?'); values.push(preco); }
    if (categoria !== undefined) { updates.push('categoria = ?'); values.push(categoria); }
    if (concluido !== undefined) { updates.push('concluido = ?'); values.push(concluido); }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
    }

    values.push(id);

    try {
        const [result] = await connection.execute(
            `UPDATE itens SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }

        // Salva palavra aprendida ao atualizar item
        if (categoria && nome) {
            await connection.execute(
                `INSERT INTO palavras_aprendidas (palavra, categoria)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE categoria = VALUES(categoria)`,
                [nome.toLowerCase().trim(), categoria]
            );
        }

        res.json({ success: true, message: 'Item atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar item:', err);
        res.status(500).json({ success: false, message: 'Erro ao atualizar item', error: err.message });
    }
});

// Excluir item
app.delete('/api/itens/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.execute('DELETE FROM itens WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }
        res.json({ success: true, message: 'Item excluído com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir item:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir item', error: err.message });
    }
});

// Limpar itens concluídos de uma lista
app.delete('/api/listas/:listaId/itens/concluidos', async (req, res) => {
    const { listaId } = req.params;
    try {
        const [result] = await connection.execute('DELETE FROM itens WHERE lista_id = ? AND concluido = TRUE', [listaId]);
        res.json({ success: true, message: 'Itens concluídos removidos.', removedCount: result.affectedRows });
    } catch (err) {
        console.error('Erro ao limpar itens concluídos:', err);
        res.status(500).json({ success: false, message: 'Erro ao limpar itens concluídos', error: err.message });
    }
});

// Limpar todos os itens de uma lista
app.delete('/api/listas/:listaId/itens', async (req, res) => {
    const { listaId } = req.params;
    try {
        const [result] = await connection.execute('DELETE FROM itens WHERE lista_id = ?', [listaId]);
        res.json({ success: true, message: 'Lista limpa com sucesso', removedCount: result.affectedRows });
    } catch (err) {
        console.error('Erro ao limpar lista (todos os itens):', err);
        res.status(500).json({ success: false, message: 'Erro ao limpar lista', error: err.message });
    }
});

// Endpoint para buscar categoria aprendida de uma palavra
app.get('/api/categoria-aprendida/:palavra', async (req, res) => {
    const palavra = req.params.palavra.toLowerCase().trim();
    try {
        const [rows] = await connection.execute(
            'SELECT categoria FROM palavras_aprendidas WHERE palavra = ? LIMIT 1',
            [palavra]
        );

        if (rows.length > 0) {
            res.json({ success: true, categoria: rows[0].categoria });
        } else {
            res.json({ success: false, categoria: null });
        }
    } catch (err) {
        console.error('Erro ao buscar categoria aprendida:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar categoria aprendida', error: err.message });
    }
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
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
