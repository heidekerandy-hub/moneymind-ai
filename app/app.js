// ==========================================
// DELETE FUNCTIONS
// ==========================================

function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  transactions = transactions.filter(function (item) {
    return item.id !== id;
  });

  saveData();
  renderTransactions();
  updateDashboard();
}


function deleteGoal(id) {
  if (!confirm("Are you sure you want to delete this savings goal?")) {
    return;
  }

  goals = goals.filter(function (item) {
    return item.id !== id;
  });

  saveData();
  renderGoals();
}


function deleteInvestment(id) {
  if (!confirm("Are you sure you want to delete this investment?")) {
    return;
  }

  investments = investments.filter(function (item) {
    return item.id !== id;
  });

  saveData();
  renderInvestments();
}


// Make them available to HTML buttons
window.deleteTransaction = deleteTransaction;
window.deleteGoal = deleteGoal;
window.deleteInvestment = deleteInvestment;
