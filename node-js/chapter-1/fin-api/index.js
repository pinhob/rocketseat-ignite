const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const customers = [];

app.use(express.json());

app.post('/customer', (req, res) => {
  const { cpf, name } = req.body;
  const id = uuidv4();

  const newCustomer = {
    id,
    cpf,
    name,
    statement: [],
  };

  customers.push(newCustomer);

  return res.status(201).send();

});

app.listen(3000);
