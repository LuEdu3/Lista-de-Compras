// Exemplo de testes para seu projeto usando Jest

// package.json - dependências de teste
/*
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
*/

// tests/api.test.js - Testes da API
const request = require('supertest');
const express = require('express');

describe('API de Listas de Compras', () => {
    let app;

    beforeEach(() => {
        // Setup da aplicação para testes
        app = require('../app.js');
    });

    describe('GET /api/listas', () => {
        test('deve retornar lista vazia quando deviceId não tem listas', async () => {
            const response = await request(app)
                .get('/api/listas')
                .query({ deviceId: 'test-device-123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        test('deve retornar erro quando deviceId não é fornecido', async () => {
            const response = await request(app)
                .get('/api/listas');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('deviceId é obrigatório');
        });
    });

    describe('POST /api/listas', () => {
        test('deve criar nova lista com sucesso', async () => {
            const novaLista = {
                name: 'Lista de Teste',
                deviceId: 'test-device-123'
            };

            const response = await request(app)
                .post('/api/listas')
                .send(novaLista);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Lista criada com sucesso');
            expect(response.body.listId).toBeDefined();
        });
    });
});

// tests/frontend.test.js - Testes do Frontend
describe('Funções do Frontend', () => {
    // Mock do DOM
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="shoppingList"></div>
            <div id="totalItems"></div>
            <div id="totalPrice"></div>
        `;
    });

    test('formatPrice deve formatar preço corretamente', () => {
        // Assumindo que você tenha uma função formatPrice
        expect(formatPrice(10.5)).toBe('R$ 10,50');
        expect(formatPrice(0)).toBe('R$ 0,00');
        expect(formatPrice(1000)).toBe('R$ 1.000,00');
    });

    test('calculateTotal deve calcular total corretamente', () => {
        const items = [
            { preco: 10.50, quantidade: 2 },
            { preco: 5.00, quantidade: 1 },
            { preco: 15.75, quantidade: 3 }
        ];

        const total = calculateTotal(items);
        expect(total).toBe(73.25); // (10.50*2) + (5.00*1) + (15.75*3)
    });
});

// tests/integration.test.js - Testes de Integração
describe('Testes de Integração', () => {
    test('fluxo completo: criar lista, adicionar item, marcar como concluído', async () => {
        const deviceId = 'integration-test-device';

        // 1. Criar lista
        const createResponse = await request(app)
            .post('/api/listas')
            .send({ name: 'Lista Integração', deviceId });

        expect(createResponse.status).toBe(201);
        const listId = createResponse.body.listId;

        // 2. Adicionar item
        const addItemResponse = await request(app)
            .post(`/api/listas/${listId}/itens`)
            .send({
                nome: 'Leite',
                quantidade: 2,
                preco: 4.50,
                categoria: 'laticinios'
            });

        expect(addItemResponse.status).toBe(201);
        const itemId = addItemResponse.body.itemId;

        // 3. Marcar como concluído
        const updateResponse = await request(app)
            .put(`/api/itens/${itemId}`)
            .send({ concluido: true });

        expect(updateResponse.status).toBe(200);

        // 4. Verificar se foi marcado
        const getItemsResponse = await request(app)
            .get(`/api/listas/${listId}/itens`);

        const item = getItemsResponse.body.data.find(i => i.id === itemId);
        expect(item.concluido).toBe(true);
    });
});

// Como executar os testes:
// npm test                    - Executa todos os testes
// npm run test:watch         - Executa testes em modo watch
// npm run test:coverage      - Gera relatório de cobertura
