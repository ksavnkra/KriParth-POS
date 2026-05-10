const mongoose = require('mongoose');
const Sale = require('./models/invoice');
const Expense = require('./models/expense');
const reports = require('./controllers/reports');

(async () => {
  await mongoose.connect('mongodb://localhost/test', { // wait, need the right db name
      // Wait, I can just connect and list collections or get one Expense.
  });
})();
