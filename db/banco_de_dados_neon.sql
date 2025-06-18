-- Script para criar as tabelas no Neon (PostgreSQL)

CREATE TABLE listas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    device_id VARCHAR(50) NOT NULL
);

CREATE TABLE itens (
    id SERIAL PRIMARY KEY,
    lista_id INTEGER NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    quantidade INTEGER DEFAULT 1,
    preco NUMERIC(10,2) DEFAULT 0,
    categoria VARCHAR(50),
    concluido BOOLEAN DEFAULT FALSE
);

CREATE TABLE palavras_aprendidas (
    id SERIAL PRIMARY KEY,
    palavra VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_palavra_unique ON palavras_aprendidas(palavra);