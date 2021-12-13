const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const customers = [];

function verifyIfAccountExistsByCPF (req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }

  req.customer = customer;

  return next();
};

app.use(express.json());

// create and validate account
app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  const newCustomer = {
    id: uuidv4(),
    cpf,
    name,
    statement: [],
  };

  customers.push(newCustomer);

  return res.status(201).send();

});

// get statement by customer cpf
app.get('/statement', verifyIfAccountExistsByCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});

app.listen(3000);
