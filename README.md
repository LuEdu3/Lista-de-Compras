# Lista de Compras

Um aplicativo web para gerenciar listas de compras de supermercado, com backend em Node.js + Express e banco de dados PostgreSQL (Neon), preparado para deploy no Render.

---

## Visão Geral

- **Frontend:** HTML, CSS, JavaScript (PWA, responsivo, uso de localStorage para identificação por dispositivo)
- **Backend:** Node.js, Express, PostgreSQL (via Neon)
- **Identificação:** Cada lista é associada a um `deviceId` único, garantindo privacidade e isolamento por dispositivo.
- **Deploy:** Pronto para deploy no Render.com

---

## Instalação Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta Neon)
- Git

### Passos

1. Clone o repositório:
   ```sh
   git clone https://github.com/LuEdu3/Lista-de-Compras.git
   cd Lista-de-Compras
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Configure o banco de dados:
   - Crie um banco PostgreSQL (ex: Neon).
   - Execute o script em `db/banco_de_dados_neon.sql` para criar as tabelas.

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz com:
     ```
     DATABASE_URL=postgres://usuario:senha@host:porta/database
     ```

5. Inicie o servidor:
   ```sh
   npm start
   ```
   O app estará disponível em `http://localhost:3000`.

---

## Deploy no Render

1. Crie um novo serviço Web no Render apontando para este repositório.
2. Defina a variável de ambiente `DATABASE_URL` com a string de conexão do Neon.
3. O Render detecta automaticamente o comando `npm start`.

---

## Estrutura do Projeto

```
├── app.js                # Backend Express
├── package.json
├── .env                  # Variáveis de ambiente (NÃO versionar)
├── db/
│   └── banco_de_dados_neon.sql
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
└── README.md
```

---

## Funcionalidades

- CRUD de listas de compras, isoladas por dispositivo
- CRUD de itens dentro de cada lista
- Aprendizado de categorias por palavra
- Interface responsiva e intuitiva
- PWA: pode ser instalado no celular
- Deploy fácil no Render

---

## Segurança e Privacidade

- As listas são privadas por padrão, associadas ao `deviceId` do navegador.
- Não há autenticação por login (opcional, pode ser implementada).
- Variáveis sensíveis (como `DATABASE_URL`) nunca devem ser versionadas.

---

## Variáveis de Ambiente

- `DATABASE_URL`: string de conexão PostgreSQL (ex: Neon)

---

## Scripts

- `npm start`: inicia o servidor Express

---

## Contribuição

Pull requests são bem-vindos! Abra uma issue para discutir melhorias ou bugs.

---

## Licença

ISC. Veja o arquivo LICENSE.

---

## Autor

[LuEdu3](https://github.com/LuEdu3)
