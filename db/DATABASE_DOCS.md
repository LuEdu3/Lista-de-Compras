# 📋 ESTRUTURA DO BANCO DE DADOS MySQL

## 🎯 **ARQUIVO PRINCIPAL: mysql_setup.sql**

### **Por que este arquivo substitui o antigo:**

❌ **banco_de_dados.sql (REMOVIDO)**:
- Não tinha campo `device_id` na tabela `listas`
- Estrutura incompatível com o código da aplicação
- UPDATEs sem dados iniciais
- Sem otimizações de performance

✅ **mysql_setup.sql (ATUAL)**:
- Compatível 100% com o código da aplicação
- Campo `device_id` presente
- Dados iniciais funcionais
- Índices para performance
- Timestamps automáticos

---

## 🗃️ **ESTRUTURA DAS TABELAS**

### **1. Tabela: `listas`**
```sql
CREATE TABLE listas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    device_id VARCHAR(255) NOT NULL,        -- CAMPO CRÍTICO
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id)
);
```

**Campos importantes:**
- `device_id`: Identifica listas por dispositivo (usado no app)
- `created_at/updated_at`: Controle de datas automático

### **2. Tabela: `itens`**
```sql
CREATE TABLE itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lista_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    quantidade INT DEFAULT 1,
    preco DECIMAL(10,2) DEFAULT 0.00,
    categoria VARCHAR(50) DEFAULT 'geral',
    concluido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE,
    INDEX idx_lista_id (lista_id),
    INDEX idx_categoria (categoria)
);
```

### **3. Tabela: `palavras_aprendidas`**
```sql
CREATE TABLE palavras_aprendidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    palavra VARCHAR(100) NOT NULL UNIQUE,   -- UNIQUE evita duplicatas
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_palavra (palavra)
);
```

---

## 🔧 **ÍNDICES PARA PERFORMANCE**

| Tabela | Índice | Motivo |
|--------|---------|---------|
| listas | idx_device_id | Busca rápida por dispositivo |
| itens | idx_lista_id | JOIN com listas |
| itens | idx_categoria | Filtro por categoria |
| palavras_aprendidas | idx_palavra | Busca de categoria por palavra |

---

## 📊 **DADOS INICIAIS**

O script inclui **150+ palavras pré-categorizadas**:

```sql
INSERT IGNORE INTO palavras_aprendidas (palavra, categoria) VALUES
('leite', 'laticinios'),
('pão', 'padaria'),
('maçã', 'hortifruti'),
-- ... mais 140+ produtos
```

**Categorias disponíveis:**
- hortifruti
- alimentos
- laticinios
- padaria
- carnes
- bebidas
- limpeza
- higiene
- congelados
- casa
- geral (padrão)

---

## 🚀 **COMO USAR**

### **1. Primeira vez (criar banco):**
```sql
-- No MySQL Workbench, execute:
SOURCE /caminho/para/mysql_setup.sql;
```

### **2. Reset completo (se necessário):**
```sql
DROP DATABASE IF EXISTS lista_de_compras;
SOURCE /caminho/para/mysql_setup.sql;
```

### **3. Verificar estrutura:**
```sql
USE lista_de_compras;
SHOW TABLES;
DESCRIBE listas;
DESCRIBE itens;
DESCRIBE palavras_aprendidas;
```

---

## 🔍 **QUERIES ÚTEIS**

### **Ver todas as listas de um dispositivo:**
```sql
SELECT * FROM listas WHERE device_id = 'meu-device' ORDER BY nome;
```

### **Ver itens de uma lista:**
```sql
SELECT i.*, l.nome as lista_nome 
FROM itens i 
JOIN listas l ON i.lista_id = l.id 
WHERE l.id = 1;
```

### **Categorias mais usadas:**
```sql
SELECT categoria, COUNT(*) as total 
FROM itens 
GROUP BY categoria 
ORDER BY total DESC;
```

### **Palavras aprendidas por categoria:**
```sql
SELECT categoria, COUNT(*) as palavras 
FROM palavras_aprendidas 
GROUP BY categoria 
ORDER BY palavras DESC;
```

---

## 🛠️ **MANUTENÇÃO**

### **Backup:**
```bash
mysqldump -u root -p lista_de_compras > backup_$(date +%Y%m%d).sql
```

### **Restaurar:**
```bash
mysql -u root -p lista_de_compras < backup_20250807.sql
```

### **Otimizar tabelas:**
```sql
OPTIMIZE TABLE listas, itens, palavras_aprendidas;
```

---

## ⚠️ **IMPORTANTE**

1. **Use apenas o `mysql_setup.sql`** - é o arquivo oficial
2. **Não modifique a estrutura** sem atualizar o código da aplicação
3. **O campo `device_id`** é essencial para o funcionamento
4. **Faça backup** antes de qualquer alteração importante

**✅ Estrutura testada e 100% compatível com a aplicação!**
