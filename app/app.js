// ============================
// DELETE FUNCTIONS
// ============================

function deleteTransaction(id) {

  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  transactions = transactions.filter(function(transaction) {
    return transaction.id !== id;
  });

  saveData();
  renderTransactions();
  updateDashboard();
}


function deleteGoal(id) {

  if (!confirm("Are you sure you want to delete this savings goal?")) {
    return;
  }

  goals = goals.filter(function(goal) {
    return goal.id !== id;
  });

  saveData();
  renderGoals();
}


function deleteInvestment(id) {

  if (!confirm("Are you sure you want to delete this investment?")) {
    return;
  }

  investments = investments.filter(function(investment) {
    return investment.id !== id;
  });

  saveData();
  renderInvestments();
}


// Make functions available to HTML
window.deleteTransaction = deleteTransaction;
window.deleteGoal = deleteGoal;
window.deleteInvestment = deleteInvestment;
