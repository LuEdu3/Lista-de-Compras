# 📋 GUIA DE SETUP - MYSQL LOCAL

## 🎯 **MIGRAÇÃO COMPLETA PARA MYSQL**

✅ **Concluído:**
- Removido PostgreSQL (pg)
- Instalado MySQL2 driver
- Atualizado código da aplicação
- Criado script de banco MySQL
- Configurado .env para MySQL

## 🔧 **PRÓXIMOS PASSOS - CONFIGURAÇÃO DO MYSQL**

### **1. Configurar MySQL Workbench (10 min)**

#### Abrir MySQL Workbench
1. Abra o **MySQL Workbench**
2. Clique em **"+"** para criar nova conexão
3. Configure:
   - **Connection Name**: Lista de Compras Local
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: [sua senha do MySQL]

#### Testar Conexão
- Clique em **"Test Connection"**
- Se der erro, verifique se o MySQL Server está rodando

---

### **2. Criar Banco de Dados (5 min)**

#### No MySQL Workbench:
1. Conecte na instância local
2. Abra o arquivo: `db/mysql_setup.sql`
3. Execute o script completo (Ctrl+Shift+Enter)

**Ou execute manualmente:**
```sql
CREATE DATABASE IF NOT EXISTS lista_de_compras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lista_de_compras;
```

---

### **3. Configurar .env (2 min)**

Edite o arquivo `.env` com suas credenciais:

```env
# Configuração MySQL Local
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=lista_de_compras
```

**⚠️ IMPORTANTE**: Substitua `SUA_SENHA_AQUI` pela senha real do seu MySQL!

---

### **4. Testar a Aplicação (3 min)**

```bash
# Iniciar aplicação
npm start
```

**Logs esperados:**
```
✅ Conectado ao MySQL!
🚀 Servidor rodando em http://localhost:3000
```

**Se der erro:**
```
❌ Erro ao conectar ao MySQL: [erro]
📋 Verifique se:
   - MySQL está rodando
   - Credenciais no .env estão corretas
   - Banco "lista_de_compras" foi criado
```

---

## 🔍 **VERIFICAÇÃO RÁPIDA**

### **Verificar se o banco foi criado:**
```sql
SHOW DATABASES;
USE lista_de_compras;
SHOW TABLES;
```

**Deve mostrar:**
- lista_de_compras (database)
- listas (tabela)
- itens (tabela)
- palavras_aprendidas (tabela)

### **Testar API:**
```bash
# Testar endpoint básico
curl http://localhost:3000/api/listas?deviceId=test
```

**Resposta esperada:**
```json
{"success":true,"data":[]}
```

---

## 🎯 **DIFERENÇAS PRINCIPAIS**

| Aspecto | PostgreSQL (Antes) | MySQL (Agora) |
|---------|-------------------|---------------|
| **Driver** | `pg` | `mysql2` |
| **Sintaxe** | `$1, $2, $3` | `?, ?, ?` |
| **Resultado** | `result.rows` | `result[0]` (first array) |
| **Insert ID** | `RETURNING id` | `result.insertId` |
| **Affected Rows** | `rowCount` | `affectedRows` |
| **Upsert** | `ON CONFLICT` | `ON DUPLICATE KEY UPDATE` |

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **Erro: "Access denied for user"**
- Verifique usuário e senha no .env
- Teste conexão no MySQL Workbench primeiro

### **Erro: "Unknown database"**
- Execute o script `mysql_setup.sql`
- Verifique se o banco foi criado: `SHOW DATABASES;`

### **Erro: "Can't connect to MySQL server"**
- Verifique se MySQL Server está rodando
- No Windows: Services → MySQL → Start

### **Erro: "Table doesn't exist"**
- Execute o script completo `mysql_setup.sql`
- Verifique se as tabelas foram criadas: `SHOW TABLES;`

---

## 📊 **VANTAGENS DO MYSQL LOCAL**

✅ **Performance**
- Sem latência de rede
- Conexões mais rápidas
- Queries locais

✅ **Desenvolvimento**
- Trabalha offline
- Dados sempre disponíveis
- Sem limites de conexão

✅ **Controle**
- Backup local
- Configuração personalizada
- Sem dependência externa

✅ **Custo**
- Gratuito
- Sem cobrança por uso
- Sem limites de storage

---

## 🔄 **MIGRAÇÃO DE DADOS (Se necessário)**

Se você tinha dados no PostgreSQL e quer migrar:

### **1. Exportar do PostgreSQL:**
```sql
-- Conectar no Neon/PostgreSQL antigo
SELECT * FROM listas;
SELECT * FROM itens;
-- Copiar dados manualmente ou fazer dump
```

### **2. Importar no MySQL:**
```sql
-- No MySQL Workbench
INSERT INTO listas (nome, device_id) VALUES 
('Lista 1', 'device123'),
('Lista 2', 'device123');

INSERT INTO itens (lista_id, nome, quantidade, preco, categoria) VALUES 
(1, 'Leite', 2, 4.50, 'laticinios'),
(1, 'Pão', 1, 6.00, 'padaria');
```

---

## 🎉 **PRÓXIMOS PASSOS**

Após configurar o MySQL:

1. **✅ Testar todas as funcionalidades**
   - Criar lista
   - Adicionar itens
   - Editar itens
   - Excluir itens

2. **✅ Implementar melhorias do Roadmap**
   - Docker (Fase 1)
   - Testes (Fase 2)
   - TypeScript (Fase 3)

3. **✅ Backup automático**
   - Configurar backup diário
   - Script de export/import

**🚀 Agora você tem uma aplicação 100% local e independente!**
