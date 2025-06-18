// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o banco de dados PostgreSQL (Neon)
const connection = new Pool({
    connectionString: process.env.DATABASE_URL // Defina essa variável no ambiente
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err.stack);
        return;
    }
    console.log('Conectado ao PostgreSQL!');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'

// Rota principal (serve o index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Função utilitária para adaptar resultados do pg para o formato esperado
function adaptPgResult(result) {
    if (Array.isArray(result.rows)) return result.rows;
    return result;
}

// API Routes

// Obter todas as listas de um deviceId
app.get('/api/listas', async (req, res) => {
    const deviceId = req.query.deviceId || req.headers['deviceid'] || req.headers['device-id'];
    if (!deviceId) {
        return res.status(400).json({ success: false, message: 'deviceId é obrigatório.' });
    }
    try {
        const result = await connection.query('SELECT * FROM listas WHERE device_id = $1 ORDER BY nome ASC', [deviceId]);
        res.json({ success: true, data: adaptPgResult(result) });
    } catch (err) {
        console.error('Erro ao buscar listas:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar listas', error: err });
    }
});

// Criar nova lista
app.post('/api/listas', async (req, res) => {
    const { name, deviceId } = req.body;
    if (!name || !deviceId) {
        return res.status(400).json({ success: false, message: 'Nome da lista e deviceId são obrigatórios.' });
    }
    try {
        const result = await connection.query('INSERT INTO listas (nome, device_id) VALUES ($1, $2) RETURNING id', [name, deviceId]);
        res.status(201).json({ success: true, message: 'Lista criada com sucesso!', listId: result.rows[0].id });
    } catch (err) {
        console.error('Erro ao criar lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar lista', error: err });
    }
});

// Renomear lista
app.put('/api/listas/:id', async (req, res) => {
    const { id } = req.params;
    const { name, deviceId } = req.body;
    if (!name || !deviceId) {
        return res.status(400).json({ success: false, message: 'Novo nome da lista e deviceId são obrigatórios.' });
    }
    try {
        const result = await connection.query('UPDATE listas SET nome = $1 WHERE id = $2 AND device_id = $3', [name, id, deviceId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada ou deviceId incorreto.' });
        }
        res.json({ success: true, message: 'Lista renomeada com sucesso.' });
    } catch (err) {
        console.error('Erro ao renomear lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao renomear lista', error: err });
    }
});

// Excluir lista (e seus itens via CASCADE)
app.delete('/api/listas/:id', async (req, res) => {
    const { id } = req.params;
    const { deviceId } = req.body;
    if (!deviceId) {
        return res.status(400).json({ success: false, message: 'deviceId é obrigatório.' });
    }
    try {
        const result = await connection.query('DELETE FROM listas WHERE id = $1 AND device_id = $2', [id, deviceId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Lista não encontrada ou deviceId incorreto.' });
        }
        res.json({ success: true, message: 'Lista excluída com sucesso.', deletedRows: result.rowCount });
    } catch (err) {
        console.error('Erro ao excluir lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir lista', error: err });
    }
});

// Obter itens de uma lista específica
app.get('/api/listas/:listaId/itens', async (req, res) => {
    const { listaId } = req.params;
    try {
        const result = await connection.query('SELECT * FROM itens WHERE lista_id = $1 ORDER BY id DESC', [listaId]);
        res.json({ success: true, data: adaptPgResult(result) });
    } catch (err) {
        console.error('Erro ao buscar itens da lista:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar itens da lista', error: err });
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
        const result = await connection.query(
            'INSERT INTO itens (lista_id, nome, quantidade, preco, categoria, concluido) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [listaId, nome, quantidade || 1, preco || 0, categoria || 'geral', concluido || false]
        );
        // Salva palavra aprendida ao adicionar item
        if (categoria && nome) {
            await connection.query(
                `INSERT INTO palavras_aprendidas (palavra, categoria)
                 VALUES ($1, $2)
                 ON CONFLICT (palavra) DO UPDATE SET categoria = EXCLUDED.categoria`,
                [nome.toLowerCase().trim(), categoria]
            );
        }
        res.status(201).json({ success: true, message: 'Item adicionado com sucesso!', itemId: result.rows[0].id });
    } catch (err) {
        console.error('Erro ao adicionar item:', err);
        res.status(500).json({ success: false, message: 'Erro ao adicionar item', error: err });
    }
});

// Atualizar item
app.put('/api/itens/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco, categoria, concluido } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    if (nome !== undefined) { updates.push(`nome = $${idx++}`); values.push(nome); }
    if (quantidade !== undefined) { updates.push(`quantidade = $${idx++}`); values.push(quantidade); }
    if (preco !== undefined) { updates.push(`preco = $${idx++}`); values.push(preco); }
    if (categoria !== undefined) { updates.push(`categoria = $${idx++}`); values.push(categoria); }
    if (concluido !== undefined) { updates.push(`concluido = $${idx++}`); values.push(concluido); }
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
    }
    values.push(id);
    try {
        const result = await connection.query(
            `UPDATE itens SET ${updates.join(', ')} WHERE id = $${idx}`,
            values
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }
        // Salva palavra aprendida ao atualizar item
        if (categoria && nome) {
            await connection.query(
                `INSERT INTO palavras_aprendidas (palavra, categoria)
                 VALUES ($1, $2)
                 ON CONFLICT (palavra) DO UPDATE SET categoria = EXCLUDED.categoria`,
                [nome.toLowerCase().trim(), categoria]
            );
        }
        res.json({ success: true, message: 'Item atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar item:', err);
        res.status(500).json({ success: false, message: 'Erro ao atualizar item', error: err });
    }
});

// Excluir item
app.delete('/api/itens/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await connection.query('DELETE FROM itens WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado.' });
        }
        res.json({ success: true, message: 'Item excluído com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir item:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir item', error: err });
    }
});

// Limpar itens concluídos de uma lista
app.delete('/api/listas/:listaId/itens/concluidos', async (req, res) => {
    const { listaId } = req.params;
    try {
        const result = await connection.query('DELETE FROM itens WHERE lista_id = $1 AND concluido = TRUE', [listaId]);
        res.json({ success: true, message: 'Itens concluídos removidos.', removedCount: result.rowCount });
    } catch (err) {
        console.error('Erro ao limpar itens concluídos:', err);
        res.status(500).json({ success: false, message: 'Erro ao limpar itens concluídos', error: err });
    }
});

// Limpar todos os itens de uma lista
app.delete('/api/listas/:listaId/itens', async (req, res) => {
    const { listaId } = req.params;
    try {
        const result = await connection.query('DELETE FROM itens WHERE lista_id = $1', [listaId]);
        res.json({ success: true, message: 'Lista limpa com sucesso', removedCount: result.rowCount });
    } catch (err) {
        console.error('Erro ao limpar lista (todos os itens):', err);
        res.status(500).json({ success: false, message: 'Erro ao limpar lista', error: err });
    }
});

// Endpoint para buscar categoria aprendida de uma palavra
app.get('/api/categoria-aprendida/:palavra', async (req, res) => {
    const palavra = req.params.palavra.toLowerCase().trim();
    try {
        const result = await connection.query(
            'SELECT categoria FROM palavras_aprendidas WHERE palavra = $1 LIMIT 1',
            [palavra]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, categoria: result.rows[0].categoria });
        } else {
            res.json({ success: false, categoria: null });
        }
    } catch (err) {
        console.error('Erro ao buscar categoria aprendida:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar categoria aprendida', error: err });
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
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Opcional: página 404 personalizada
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});