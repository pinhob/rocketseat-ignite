const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

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

// create a deposit by customer 
app.post('/deposit', verifyIfAccountExistsByCPF, (req, res) => {
  const { amount, description } = req.body;
  const { customer } = req;
  
  const newDeposit = {
    amount,
    description,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(newDeposit);

  return res.status(201).send();
});

// create a withdraw by customer 
app.post('/withdraw', verifyIfAccountExistsByCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "Insufficent founds!" });
  }

  const newWithdraw = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(newWithdraw);

  return res.status(201).send();
});

// check statements by date
app.get('/statement/date', verifyIfAccountExistsByCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const checkStatementByDate = customer.statement.filter((operation) => {
    operation.created_at.toDateString() === dateFormat.toDateString();
  })

  console.log(checkStatementByDate);

  return res.status(201).json(customer.statement);
});

app.listen(3000);
