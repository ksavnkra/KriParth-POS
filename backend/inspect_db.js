const mongoose = require('mongoose');
const Expense = require('./models/expense');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/kriparth_pos');
  const expenses = await Expense.find().sort({createdAt: -1}).limit(5);
  console.log('Recent expenses:', JSON.stringify(expenses, null, 2));
  
  // Check how Mongo scales grouping
  const agg = await Expense.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        total: { $sum: "$amount" }
      }
    }
  ]);
  console.log('Aggregated:', JSON.stringify(agg, null, 2));
  process.exit(0);
})();
