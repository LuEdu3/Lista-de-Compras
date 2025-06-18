CREATE DATABASE lista_de_compras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lista_de_compras;

CREATE TABLE listas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lista_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    quantidade INT DEFAULT 1,
    preco DECIMAL(10,2) DEFAULT 0,
    categoria VARCHAR(50),
    concluido BOOLEAN DEFAULT 0,
    FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE
);

-- DROP DATABASE lista_de_compras;
-- SET SQL_SAFE_UPDATES = 0;
-- SET SQL_SAFE_UPDATES = 1;

UPDATE itens SET categoria = 'hortifruti' WHERE LOWER(nome) REGEXP 'maçã|banana|laranja|pera|uva|abacaxi|fruta|melancia|mamão|limão|morango|alface|tomate|cenoura|batata|cebola|alho|verdura|legume|pepino|abobrinha|chuchu';
UPDATE itens SET categoria = 'alimentos' WHERE LOWER(nome) REGEXP 'arroz|feijão|macarrão|massa|farinha|açúcar|sal|óleo|trigo|milho';
UPDATE itens SET categoria = 'laticinios' WHERE LOWER(nome) REGEXP 'leite|queijo|manteiga|requeijão|iogurte|laticínio|creme de leite|nata';
UPDATE itens SET categoria = 'padaria' WHERE LOWER(nome) REGEXP 'pão|broa|bolo|croissant|padaria|rosca';
UPDATE itens SET categoria = 'carnes' WHERE LOWER(nome) REGEXP 'carne|frango|bife|peixe|porco|linguiça|salsicha|presunto|mortadela|bacon';
UPDATE itens SET categoria = 'bebidas' WHERE LOWER(nome) REGEXP 'cerveja|refrigerante|suco|vinho|água|bebida|whisky|vodka|cachaça';
UPDATE itens SET categoria = 'limpeza' WHERE LOWER(nome) REGEXP 'sabão|detergente|desinfetante|limpeza|amaciante|esponja|cloro|alvejante|multiuso';
UPDATE itens SET categoria = 'higiene' WHERE LOWER(nome) REGEXP 'shampoo|sabonete|pasta de dente|escova|fio dental|higiene|absorvente|desodorante|papel higiênico';
UPDATE itens SET categoria = 'congelados' WHERE LOWER(nome) REGEXP 'pizza|lasanha|sorvete|congelado|hamburguer|nuggets';
UPDATE itens SET categoria = 'casa' WHERE LOWER(nome) REGEXP 'vassoura|balde|pano|rodo|casa|lampada|pregos|parafuso|ferramenta';