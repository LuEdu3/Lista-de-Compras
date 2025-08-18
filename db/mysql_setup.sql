-- Script para criação do banco MySQL
-- Execute este script no MySQL Workbench

-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS lista_de_compras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lista_de_compras;

-- Tabela de listas
CREATE TABLE IF NOT EXISTS listas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id)
) ENGINE=InnoDB;

-- Tabela de itens
CREATE TABLE IF NOT EXISTS itens (
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
) ENGINE=InnoDB;

-- Tabela para aprendizado de categorias por palavra
CREATE TABLE IF NOT EXISTS palavras_aprendidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    palavra VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_palavra (palavra)
) ENGINE=InnoDB;

-- Inserir dados iniciais para categorias aprendidas
INSERT IGNORE INTO palavras_aprendidas (palavra, categoria) VALUES
-- Hortifruti
('maçã', 'hortifruti'),
('banana', 'hortifruti'),
('laranja', 'hortifruti'),
('pera', 'hortifruti'),
('uva', 'hortifruti'),
('abacaxi', 'hortifruti'),
('melancia', 'hortifruti'),
('mamão', 'hortifruti'),
('limão', 'hortifruti'),
('morango', 'hortifruti'),
('alface', 'hortifruti'),
('tomate', 'hortifruti'),
('cenoura', 'hortifruti'),
('batata', 'hortifruti'),
('cebola', 'hortifruti'),
('alho', 'hortifruti'),
('pepino', 'hortifruti'),
('abobrinha', 'hortifruti'),
('chuchu', 'hortifruti'),

-- Alimentos básicos
('arroz', 'alimentos'),
('feijão', 'alimentos'),
('macarrão', 'alimentos'),
('massa', 'alimentos'),
('farinha', 'alimentos'),
('açúcar', 'alimentos'),
('sal', 'alimentos'),
('óleo', 'alimentos'),
('trigo', 'alimentos'),
('milho', 'alimentos'),

-- Laticínios
('leite', 'laticinios'),
('queijo', 'laticinios'),
('manteiga', 'laticinios'),
('requeijão', 'laticinios'),
('iogurte', 'laticinios'),
('creme de leite', 'laticinios'),
('nata', 'laticinios'),

-- Padaria
('pão', 'padaria'),
('broa', 'padaria'),
('bolo', 'padaria'),
('croissant', 'padaria'),
('rosca', 'padaria'),

-- Carnes
('carne', 'carnes'),
('frango', 'carnes'),
('bife', 'carnes'),
('peixe', 'carnes'),
('porco', 'carnes'),
('linguiça', 'carnes'),
('salsicha', 'carnes'),
('presunto', 'carnes'),
('mortadela', 'carnes'),
('bacon', 'carnes'),

-- Bebidas
('cerveja', 'bebidas'),
('refrigerante', 'bebidas'),
('suco', 'bebidas'),
('vinho', 'bebidas'),
('água', 'bebidas'),

-- Limpeza
('sabão', 'limpeza'),
('detergente', 'limpeza'),
('desinfetante', 'limpeza'),
('amaciante', 'limpeza'),
('esponja', 'limpeza'),
('cloro', 'limpeza'),
('alvejante', 'limpeza'),

-- Higiene
('shampoo', 'higiene'),
('sabonete', 'higiene'),
('pasta de dente', 'higiene'),
('escova', 'higiene'),
('fio dental', 'higiene'),
('absorvente', 'higiene'),
('desodorante', 'higiene'),
('papel higiênico', 'higiene'),

-- Congelados
('pizza', 'congelados'),
('lasanha', 'congelados'),
('sorvete', 'congelados'),
('hambúrguer', 'congelados'),
('nuggets', 'congelados'),

-- Casa
('vassoura', 'casa'),
('balde', 'casa'),
('pano', 'casa'),
('rodo', 'casa'),
('lâmpada', 'casa'),
('pregos', 'casa'),
('parafuso', 'casa');

-- Verificar se as tabelas foram criadas
SHOW TABLES;

-- Verificar estrutura das tabelas
DESCRIBE listas;
DESCRIBE itens;
DESCRIBE palavras_aprendidas;
