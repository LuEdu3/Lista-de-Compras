# 📋 TEMPLATES E CHECKLISTS PRÁTICOS

## 🏁 **FASE 1: CHECKLIST DOCKER**

### ✅ Setup Docker - Checklist Detalhado

**Pré-requisitos:**
- [ ] Docker Desktop instalado
- [ ] Docker Compose disponível
- [ ] Acesso ao terminal/PowerShell

**Passo a Passo:**

#### 1. Criar Dockerfile (15 min)
```bash
# Criar arquivo na raiz do projeto
New-Item -Name "Dockerfile" -ItemType File
```

**Conteúdo do Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Criar docker-compose.yml (20 min)
```bash
New-Item -Name "docker-compose.yml" -ItemType File
```

#### 3. Criar .dockerignore (5 min)
```bash
New-Item -Name ".dockerignore" -ItemType File
```

#### 4. Teste Local (15 min)
```bash
# Build da imagem
docker-compose build

# Subir aplicação
docker-compose up -d

# Testar se funciona
curl http://localhost:3000

# Verificar logs
docker-compose logs app

# Parar serviços
docker-compose down
```

#### 5. Validação Final (10 min)
- [ ] Aplicação acessível em http://localhost:3000
- [ ] Banco de dados conectando
- [ ] Logs sem erros críticos
- [ ] Restart funciona corretamente

**Tempo Total Estimado: 1h 05min**

---

## 🧪 **FASE 2: CHECKLIST TESTES**

### ✅ Setup de Testes - Checklist Detalhado

#### 1. Instalar Dependências (10 min)
```bash
npm install --save-dev jest supertest @types/jest nodemon
```

#### 2. Configurar package.json (10 min)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.{js,ts}",
      "!src/**/*.test.{js,ts}"
    ]
  }
}
```

#### 3. Criar Estrutura de Testes (15 min)
```bash
mkdir tests
mkdir tests/unit
mkdir tests/integration
mkdir tests/e2e
```

#### 4. Primeiro Teste (20 min)
Criar `tests/integration/api.test.js`:
```javascript
const request = require('supertest');
const app = require('../../app');

describe('Health Check', () => {
    test('GET / should return 200', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });
});
```

#### 5. Executar Testes (5 min)
```bash
npm test
```

**Template de Teste para API:**
```javascript
describe('API /api/listas', () => {
    beforeEach(async () => {
        // Setup antes de cada teste
    });

    afterEach(async () => {
        // Cleanup após cada teste
    });

    test('deve criar nova lista', async () => {
        const novaLista = {
            name: 'Lista Teste',
            deviceId: 'test-device'
        };

        const response = await request(app)
            .post('/api/listas')
            .send(novaLista);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.listId).toBeDefined();
    });
});
```

**Tempo Total Estimado: 1h**

---

## 🔧 **FASE 3: CHECKLIST TYPESCRIPT**

### ✅ Migração TypeScript - Checklist Detalhado

#### 1. Instalar TypeScript (10 min)
```bash
npm install --save-dev typescript @types/node @types/express ts-node nodemon
npm install --save-dev @types/cors @types/pg
```

#### 2. Configurar tsconfig.json (15 min)
```bash
npx tsc --init
```

**Configuração recomendada:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### 3. Reorganizar Estrutura (30 min)
```bash
# Criar estrutura TypeScript
mkdir src
mkdir src/types
mkdir src/controllers
mkdir src/models
mkdir src/services
mkdir src/middlewares

# Mover arquivos
Move-Item app.js src/app.ts
```

#### 4. Criar Interfaces Principais (45 min)
`src/types/index.ts`:
```typescript
export interface ShoppingItem {
    id: number;
    nome: string;
    quantidade: number;
    preco: number;
    categoria: string;
    concluido: boolean;
    lista_id: number;
}

export interface ShoppingList {
    id: number;
    nome: string;
    device_id: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}
```

#### 5. Migrar Controllers (60 min)
Template para controller:
```typescript
import { Request, Response } from 'express';
import { ApiResponse, ShoppingList } from '../types';

export class ListasController {
    async getListas(req: Request, res: Response): Promise<void> {
        const deviceId = req.query.deviceId as string;
        
        if (!deviceId) {
            res.status(400).json({
                success: false,
                message: 'deviceId é obrigatório.'
            } as ApiResponse);
            return;
        }

        try {
            // Lógica aqui
            res.json({
                success: true,
                data: []
            } as ApiResponse<ShoppingList[]>);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro interno',
                error
            } as ApiResponse);
        }
    }
}
```

#### 6. Atualizar package.json (10 min)
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "start:dev": "ts-node src/app.ts"
  }
}
```

**Tempo Total Estimado: 2h 50min**

---

## 🎨 **TEMPLATES DE CÓDIGO ÚTEIS**

### 📁 Estrutura de Pastas Final
```
src/
├── app.ts                 # Entry point
├── types/
│   ├── index.ts          # Interfaces principais
│   └── api.ts            # Tipos da API
├── controllers/
│   ├── listas.controller.ts
│   └── itens.controller.ts
├── models/
│   ├── database.ts       # Conexão com banco
│   └── queries.ts        # Queries SQL
├── services/
│   ├── listas.service.ts
│   └── itens.service.ts
├── middlewares/
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
└── utils/
    ├── logger.ts
    └── helpers.ts

tests/
├── unit/
├── integration/
└── e2e/

docs/
├── api.md
└── setup.md
```

### 🔧 Template de Service
```typescript
import { Pool } from 'pg';
import { ShoppingList, ApiResponse } from '../types';

export class ListasService {
    constructor(private db: Pool) {}

    async createLista(name: string, deviceId: string): Promise<number> {
        const result = await this.db.query(
            'INSERT INTO listas (nome, device_id) VALUES ($1, $2) RETURNING id',
            [name, deviceId]
        );
        return result.rows[0].id;
    }

    async getListas(deviceId: string): Promise<ShoppingList[]> {
        const result = await this.db.query(
            'SELECT * FROM listas WHERE device_id = $1 ORDER BY nome ASC',
            [deviceId]
        );
        return result.rows;
    }
}
```

### 🧪 Template de Teste E2E
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('Fluxo Completo - Lista de Compras', () => {
    let listId: number;
    const deviceId = 'e2e-test-device';

    test('Fluxo: criar lista → adicionar item → marcar concluído → excluir', async () => {
        // 1. Criar lista
        const createResponse = await request(app)
            .post('/api/listas')
            .send({ name: 'Lista E2E', deviceId });
        
        expect(createResponse.status).toBe(201);
        listId = createResponse.body.listId;

        // 2. Adicionar item
        const itemResponse = await request(app)
            .post(`/api/listas/${listId}/itens`)
            .send({
                nome: 'Produto Teste',
                quantidade: 2,
                preco: 10.50,
                categoria: 'teste'
            });

        expect(itemResponse.status).toBe(201);
        const itemId = itemResponse.body.itemId;

        // 3. Marcar como concluído
        const updateResponse = await request(app)
            .put(`/api/itens/${itemId}`)
            .send({ concluido: true });

        expect(updateResponse.status).toBe(200);

        // 4. Verificar estado
        const getResponse = await request(app)
            .get(`/api/listas/${listId}/itens`);

        const item = getResponse.body.data.find((i: any) => i.id === itemId);
        expect(item.concluido).toBe(true);
    });
});
```

---

## ⏰ **CRONOGRAMA SEMANAL SUGERIDO**

### **Semana 1-2: Docker + Organização**
- **Segunda**: Setup Docker (2h)
- **Terça**: Teste e refinamento (1h)
- **Quarta**: Organizar código em módulos (3h)
- **Quinta**: Documentação (1h)
- **Sexta**: Review e ajustes (1h)

### **Semana 3-4: Testes**
- **Segunda**: Setup Jest + primeiro teste (2h)
- **Terça**: Testes de API básicos (3h)
- **Quarta**: Testes de integração (3h)
- **Quinta**: Testes E2E (2h)
- **Sexta**: Coverage e CI (2h)

### **Semana 5-8: TypeScript**
- **Semana 5**: Setup e interfaces (8h)
- **Semana 6**: Migrar models e services (10h)
- **Semana 7**: Migrar controllers (8h)
- **Semana 8**: Testes TS e refinamento (6h)

---

**💡 DICA**: Implemente uma fase por vez, testando bem antes de prosseguir. Cada fase deve deixar o projeto em estado funcional!
