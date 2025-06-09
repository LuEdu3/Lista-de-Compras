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