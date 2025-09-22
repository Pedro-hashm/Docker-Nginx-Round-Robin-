const express = require('express');
const app = express();
const PORT = 3000;

// get mult
app.get('/mult', (req, res) => {

    const a = req.query.a ? parseFloat(req.query.a) : 0;
    const b = req.query.b ? parseFloat(req.query.b) : 0;

    const result = a * b;

    res.send(`Resultado da multiplicação: ${result}`);
});

// start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});