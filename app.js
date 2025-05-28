const express = require('express');
const app = express();
const port = 3000;

let productList = [];

app.use(express.static('public'));
app.use(express.json());

app.get('/products', (req, res) => {
    res.json(productList);
});

app.post('/products', (req, res) => {
    const { name } = req.body;
    productList.push({ name, inCart: false });
    res.status(201).json({ message: 'Produto adicionado' });
});

app.post('/toggle', (req, res) => {
    const { index } = req.body;
    if (productList[index]) {
        productList[index].inCart = !productList[index].inCart;
    }
    res.json(productList);
});

app.listen(port, () => {
    console.log(`App rodando em http://localhost:${port}`);
});
