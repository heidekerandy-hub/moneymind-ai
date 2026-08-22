let transactions = JSON.parse(localStorage.getItem("mm_transactions")) || [];
let goals = JSON.parse(localStorage.getItem("mm_goals")) || [];
let investments = JSON.parse(localStorage.getItem("mm_investments")) || [];

function saveData() {
  localStorage.setItem("mm_transactions", JSON.stringify(transactions));
  localStorage.setItem("mm_goals", JSON.stringify(goals));
  localStorage.setItem("mm_investments", JSON.stringify(investments));
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.style.display = "none";
  }
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  if (!menu) return;

  menu.style.display =
    menu.style.display === "flex" ? "none" : "flex";
}


// ============================
// DASHBOARD
// ============================

function updateDashboard() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  document.getElementById("totalIncome").textContent = formatMoney(income);
  document.getElementById("totalExpenses").textContent = formatMoney(expenses);
  document.getElementById("balance").textContent = formatMoney(balance);

  updateHealth(income, expenses);
  renderRecentTransactions();
}

function updateHealth(income, expenses) {
  let score = 0;

  if (income > 0) {
    const savingsRate = ((income - expenses) / income) * 100;

    if (savingsRate >= 30) {
      score = 100;
    } else if (savingsRate >= 20) {
      score = 85;
    } else if (savingsRate >= 10) {
      score = 70;
    } else if (savingsRate >= 0) {
      score = 50;
    } else {
      score = 20;
    }
  }

  document.getElementById("healthScore").textContent = score + "%";

  const title = document.getElementById("healthTitle");
  const message = document.getElementById("healthMessage");

  if (score >= 85) {
    title.textContent = "Excellent financial health";
    message.textContent =
      "You're maintaining a strong savings position.";
  } else if (score >= 70) {
    title.textContent = "Good financial health";
    message.textContent =
      "You're doing well. Look for opportunities to increase savings.";
  } else if (score >= 50) {
    title.textContent = "Needs attention";
    message.textContent =
      "Your expenses are taking a significant portion of your income.";
  } else if (score > 0) {
    title.textContent = "Warning";
    message.textContent =
      "Your spending may be higher than your income.";
  } else {
    title.textContent = "Let's get started";
    message.textContent =
      "Add your income and expenses to see your financial health.";
  }
}


// ============================
// TRANSACTIONS
// ============================

function openTransactionModal() {
  document.getElementById("transactionModal").classList.add("show");
}

function addTransaction() {
  const type =
    document.getElementById("transactionType").value;

  const description =
    document.getElementById("transactionDescription").value.trim();

  const amount =
    Number(document.getElementById("transactionAmount").value);

  const category =
    document.getElementById("transactionCategory").value;

  if (!description || !amount || amount <= 0) {
    alert("Please enter a description and a valid amount.");
    return;
  }

  transactions.unshift({
    id: Date.now(),
    type: type,
    description: description,
    amount: amount,
    category: category,
    date: new Date().toISOString()
  });

  saveData();

  document.getElementById("transactionDescription").value = "";
  document.getElementById("transactionAmount").value = "";

  closeModal("transactionModal");

  renderTransactions();
  updateDashboard();
}

function renderTransactions() {
  const container =
    document.getElementById("allTransactions");

  if (transactions.length === 0) {
    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';
    return;
  }

  container.innerHTML = transactions.map(t => `
    <div class="transaction">
      <div class="transaction-info">
        <strong>${escapeHTML(t.description)}</strong>
        <small>
          ${escapeHTML(t.category)} • ${formatDate(t.date)}
        </small>
      </div>

      <div class="${t.type}">
        ${t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}
      </div>
    </div>
  `).join("");
}

function renderRecentTransactions() {
  const container =
    document.getElementById("recentTransactions");

  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';
    return;
  }

  container.innerHTML = recent.map(t => `
    <div class="transaction">
      <div class="transaction-info">
        <strong>${escapeHTML(t.description)}</strong>
        <small>
          ${escapeHTML(t.category)} • ${formatDate(t.date)}
        </small>
      </div>

      <div class="${t.type}">
        ${t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}
      </div>
    </div>
  `).join("");
}


// ============================
// SAVINGS GOALS
// ============================

function openGoalModal() {
  document.getElementById("goalModal").classList.add("show");
}

function addGoal() {
  const name =
    document.getElementById("goalName").value.trim();

  const target =
    Number(document.getElementById("goalTarget").value);

  const saved =
    Number(document.getElementById("goalSaved").value) || 0;

  if (!name || !target || target <= 0) {
    alert("Please enter a goal name and target amount.");
    return;
  }

  goals.push({
    id: Date.now(),
    name: name,
    target: target,
    saved: saved
  });

  saveData();

  document.getElementById("goalName").value = "";
  document.getElementById("goalTarget").value = "";
  document.getElementById("goalSaved").value = "";

  closeModal("goalModal");

  renderGoals();
}

function renderGoals() {
  const container =
    document.getElementById("goalsList");

  if (goals.length === 0) {
    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';
    return;
  }

  container.innerHTML = goals.map(goal => {

    const percentage = Math.min(
      100,
      Math.round((goal.saved / goal.target) * 100)
    );

    return `
      <div class="goal">
        <h3>${escapeHTML(goal.name)}</h3>

        <p>
          ${formatMoney(goal.saved)}
          saved of
          ${formatMoney(goal.target)}
        </p>

        <div class="progress">
          <div
            class="progress-bar"
            style="width:${percentage}%"
          ></div>
        </div>

        <strong>${percentage}% complete</strong>
      </div>
    `;

  }).join("");
}


// ============================
// INVESTMENTS
// ============================

function openInvestmentModal() {
  document
    .getElementById("investmentModal")
    .classList.add("show");
}

function addInvestment() {
  const name =
    document.getElementById("investmentName").value.trim();

  const amount =
    Number(document.getElementById("investmentAmount").value);

  const value =
    Number(document.getElementById("investmentValue").value);

  if (!name || !amount || amount <= 0) {
    alert("Please enter the investment name and amount.");
    return;
  }

  investments.push({
    id: Date.now(),
    name: name,
    amount: amount,
    value: value || amount
  });

  saveData();

  document.getElementById("investmentName").value = "";
  document.getElementById("investmentAmount").value = "";
  document.getElementById("investmentValue").value = "";

  closeModal("investmentModal");

  renderInvestments();
}

function renderInvestments() {
  const container =
    document.getElementById("investmentsList");

  if (investments.length === 0) {
    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';
    return;
  }

  container.innerHTML = investments.map(investment => {

    const gain =
      investment.value - investment.amount;

    return `
      <div class="investment">

        <h3>${escapeHTML(investment.name)}</h3>

        <p>
          Invested:
          ${formatMoney(investment.amount)}
        </p>

        <p>
          Current value:
          ${formatMoney(investment.value)}
        </p>

        <strong class="${gain >= 0 ? "income" : "expense"}">
          ${gain >= 0 ? "+" : ""}${formatMoney(gain)}
        </strong>

      </div>
    `;

  }).join("");
}


// ============================
// AI ASSISTANT
// ============================

function askAI() {
  const input =
    document.getElementById("aiInput");

  const question =
    input.value.trim();

  if (!question) {
    return;
  }

  addChatMessage(question, "user");

  input.value = "";

  setTimeout(() => {

    const response =
      generateFinancialAdvice(question);

    addChatMessage(response, "ai");

  }, 500);
}

function quickQuestion(question) {
  document.getElementById("aiInput").value = question;
  askAI();
}

function addChatMessage(message, type) {
  const container =
    document.getElementById("chatMessages");

  const div =
    document.createElement("div");

  div.className = "message " + type;

  div.textContent = message;

  container.appendChild(div);

  container.scrollTop =
    container.scrollHeight;
}

function generateFinancialAdvice(question) {

  const q = question.toLowerCase();

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (income === 0) {
    return "Start by adding your income and expenses. Once I have some numbers, I can give you more personalized budgeting advice.";
  }

  const balance = income - expenses;

  if (
    q.includes("reduce") ||
    q.includes("expense") ||
    q.includes("spending")
  ) {

    if (expenses > income) {
      return "Your recorded expenses are currently higher than your income. Start by identifying your three largest spending categories and reduce non-essential spending first.";
    }

    return "Review your biggest spending categories first. Separate needs from wants, set weekly spending limits, and move part of your income into savings.";
  }

  if (
    q.includes("save") ||
    q.includes("saving")
  ) {

    const suggested = income * 0.2;

    return `A useful starting target is around 20% of income. Based on your recorded income, that would be about ${formatMoney(suggested)}. Adjust the amount to fit your real obligations.`;
  }

  if (q.includes("budget")) {

    return "Try a simple budget: cover essential needs first, set aside savings, then allocate the remaining amount to flexible spending. Review your actual spending every week.";
  }

  if (q.includes("invest")) {

    return "Before investing, consider building an emergency fund and paying down expensive debt. Then choose investments based on your goals, time horizon and risk tolerance.";
  }

  if (
    q.includes("balance") ||
    q.includes("money")
  ) {

    return `Your recorded income is ${formatMoney(income)}, expenses are ${formatMoney(expenses)}, and your current balance is ${formatMoney(balance)}.`;
  }

  return "I can help you with budgeting, saving, expenses, investments and financial goals. Try asking me how to reduce expenses or how much you should save.";
}


// ============================
// UTILITIES
// ============================

function closeModal(id) {
  document
    .getElementById(id)
    .classList.remove("show");
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(value) {
  const div =
    document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

window.addEventListener("click", function(event) {

  document.querySelectorAll(".modal").forEach(modal => {

    if (event.target === modal) {
      modal.classList.remove("show");
    }

  });

});


// ============================
// START APP
// ============================

document.addEventListener("DOMContentLoaded", function() {

  updateDashboard();
  renderTransactions();
  renderGoals();
  renderInvestments();

});


