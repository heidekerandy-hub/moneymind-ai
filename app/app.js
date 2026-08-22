// ==========================================
// MONEYMIND AI - COMPLETE APP
// ==========================================

let transactions =
  JSON.parse(localStorage.getItem("mm_transactions")) || [];

let goals =
  JSON.parse(localStorage.getItem("mm_goals")) || [];

let investments =
  JSON.parse(localStorage.getItem("mm_investments")) || [];


// ==========================================
// SUPABASE AI FUNCTION
// ==========================================

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ==========================================
// INITIALIZE APP
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  updateDashboard();
  renderTransactions();
  renderGoals();
  renderInvestments();

});


// ==========================================
// STORAGE
// ==========================================

function saveData() {

  localStorage.setItem(
    "mm_transactions",
    JSON.stringify(transactions)
  );

  localStorage.setItem(
    "mm_goals",
    JSON.stringify(goals)
  );

  localStorage.setItem(
    "mm_investments",
    JSON.stringify(investments)
  );
}


// ==========================================
// MONEY FORMAT
// ==========================================

function formatMoney(amount) {

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const incomeElement =
    document.getElementById("totalIncome");

  const expenseElement =
    document.getElementById("totalExpenses");

  const balanceElement =
    document.getElementById("balance");

  if (incomeElement)
    incomeElement.textContent = formatMoney(income);

  if (expenseElement)
    expenseElement.textContent = formatMoney(expenses);

  if (balanceElement)
    balanceElement.textContent = formatMoney(balance);

  updateHealth(income, expenses);

  renderRecentTransactions();
}


// ==========================================
// FINANCIAL HEALTH
// ==========================================

function updateHealth(income, expenses) {

  let score = 0;

  if (income > 0) {

    const savingsRate =
      ((income - expenses) / income) * 100;

    if (savingsRate >= 30) {
      score = 100;
    }

    else if (savingsRate >= 20) {
      score = 85;
    }

    else if (savingsRate >= 10) {
      score = 70;
    }

    else if (savingsRate >= 0) {
      score = 50;
    }

    else {
      score = 20;
    }
  }

  const scoreElement =
    document.getElementById("healthScore");

  const title =
    document.getElementById("healthTitle");

  const message =
    document.getElementById("healthMessage");

  if (scoreElement)
    scoreElement.textContent = score + "%";

  if (!title || !message) return;

  if (score >= 85) {

    title.textContent =
      "Excellent financial health";

    message.textContent =
      "You're maintaining a strong savings position.";

  }

  else if (score >= 70) {

    title.textContent =
      "Good financial health";

    message.textContent =
      "You're doing well. Look for opportunities to increase savings.";

  }

  else if (score >= 50) {

    title.textContent =
      "Needs attention";

    message.textContent =
      "Your expenses are taking a significant portion of your income.";

  }

  else if (score > 0) {

    title.textContent =
      "Warning";

    message.textContent =
      "Your spending may be higher than your income.";

  }

  else {

    title.textContent =
      "Let's get started";

    message.textContent =
      "Add your income and expenses to see your financial health.";

  }
}


// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionId) {

  document
    .querySelectorAll(".section")
    .forEach(section => {
      section.classList.remove("active");
    });

  const section =
    document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  const menu =
    document.getElementById("mobileMenu");

  if (menu) {
    menu.style.display = "none";
  }
}


function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  if (!menu) return;

  menu.style.display =
    menu.style.display === "flex"
      ? "none"
      : "flex";
}


// ==========================================
// TRANSACTIONS
// ==========================================

function openTransactionModal() {

  const modal =
    document.getElementById("transactionModal");

  if (modal) {
    modal.classList.add("show");
  }
}


function addTransaction() {

  const type =
    document.getElementById("transactionType")?.value;

  const description =
    document
      .getElementById("transactionDescription")
      ?.value
      .trim();

  const amount =
    Number(
      document.getElementById("transactionAmount")?.value
    );

  const category =
    document.getElementById("transactionCategory")?.value;

  if (!description || !amount || amount <= 0) {

    alert(
      "Please enter a description and a valid amount."
    );

    return;
  }

  transactions.unshift({

    id: Date.now(),

    type,

    description,

    amount,

    category,

    date: new Date().toISOString()

  });

  saveData();

  document.getElementById(
    "transactionDescription"
  ).value = "";

  document.getElementById(
    "transactionAmount"
  ).value = "";

  closeModal("transactionModal");

  renderTransactions();

  updateDashboard();
}


function deleteTransaction(id) {

  if (
    !confirm(
      "Are you sure you want to delete this transaction?"
    )
  ) {
    return;
  }

  transactions =
    transactions.filter(
      transaction => transaction.id !== id
    );

  saveData();

  renderTransactions();

  updateDashboard();
}


function renderTransactions() {

  const container =
    document.getElementById("allTransactions");

  if (!container) return;

  if (transactions.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }

  container.innerHTML =
    transactions
      .map(t => `

        <div class="transaction">

          <div class="transaction-info">

            <strong>
              ${escapeHTML(t.description)}
            </strong>

            <small>
              ${escapeHTML(t.category)}
              •
              ${formatDate(t.date)}
            </small>

          </div>

          <div class="${t.type}">

            ${t.type === "income" ? "+" : "-"}
            ${formatMoney(t.amount)}

          </div>

          <button
            class="delete-btn"
            onclick="deleteTransaction(${t.id})"
          >
            Delete
          </button>

        </div>

      `)
      .join("");
}


function renderRecentTransactions() {

  const container =
    document.getElementById("recentTransactions");

  if (!container) return;

  const recent =
    transactions.slice(0, 5);

  if (recent.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }

  container.innerHTML =
    recent
      .map(t => `

        <div class="transaction">

          <div class="transaction-info">

            <strong>
              ${escapeHTML(t.description)}
            </strong>

            <small>
              ${escapeHTML(t.category)}
              •
              ${formatDate(t.date)}
            </small>

          </div>

          <div class="${t.type}">

            ${t.type === "income" ? "+" : "-"}
            ${formatMoney(t.amount)}

          </div>

        </div>

      `)
      .join("");
}


// ==========================================
// SAVINGS GOALS
// ==========================================

function openGoalModal() {

  const modal =
    document.getElementById("goalModal");

  if (modal) {
    modal.classList.add("show");
  }
}


function addGoal() {

  const name =
    document.getElementById("goalName")?.value.trim();

  const target =
    Number(
      document.getElementById("goalTarget")?.value
    );

  const saved =
    Number(
      document.getElementById("goalSaved")?.value
    ) || 0;

  if (!name || !target || target <= 0) {

    alert(
      "Please enter a goal name and target amount."
    );

    return;
  }

  goals.push({

    id: Date.now(),

    name,

    target,

    saved

  });

  saveData();

  document.getElementById("goalName").value = "";

  document.getElementById("goalTarget").value = "";

  document.getElementById("goalSaved").value = "";

  closeModal("goalModal");

  renderGoals();
}


function deleteGoal(id) {

  if (
    !confirm(
      "Are you sure you want to delete this savings goal?"
    )
  ) {
    return;
  }

  goals =
    goals.filter(
      goal => goal.id !== id
    );

  saveData();

  renderGoals();
}


function renderGoals() {

  const container =
    document.getElementById("goalsList");

  if (!container) return;

  if (goals.length === 0) {

    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';

    return;
  }

  container.innerHTML =
    goals
      .map(goal => {

        const percentage =
          Math.min(
            100,
            Math.round(
              (goal.saved / goal.target) * 100
            )
          );

        return `

          <div class="goal">

            <h3>
              ${escapeHTML(goal.name)}
            </h3>

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

            <strong>
              ${percentage}% complete
            </strong>

            <br><br>

            <button
              class="delete-btn"
              onclick="deleteGoal(${goal.id})"
            >
              Delete
            </button>

          </div>

        `;

      })
      .join("");
}


// ==========================================
// INVESTMENTS
// ==========================================

function openInvestmentModal() {

  const modal =
    document.getElementById("investmentModal");

  if (modal) {
    modal.classList.add("show");
  }
}


function addInvestment() {

  const name =
    document
      .getElementById("investmentName")
      ?.value
      .trim();

  const amount =
    Number(
      document
        .getElementById("investmentAmount")
        ?.value
    );

  const value =
    Number(
      document
        .getElementById("investmentValue")
        ?.value
    );

  if (!name || !amount || amount <= 0) {

    alert(
      "Please enter the investment name and amount."
    );

    return;
  }

  investments.push({

    id: Date.now(),

    name,

    amount,

    value: value || amount

  });

  saveData();

  document.getElementById(
    "investmentName"
  ).value = "";

  document.getElementById(
    "investmentAmount"
  ).value = "";

  document.getElementById(
    "investmentValue"
  ).value = "";

  closeModal("investmentModal");

  renderInvestments();
}


function deleteInvestment(id) {

  if (
    !confirm(
      "Are you sure you want to delete this investment?"
    )
  ) {
    return;
  }

  investments =
    investments.filter(
      investment => investment.id !== id
    );

  saveData();

  renderInvestments();
}


function renderInvestments() {

  const container =
    document.getElementById("investmentsList");

  if (!container) return;

  if (investments.length === 0) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }

  container.innerHTML =
    investments
      .map(investment => {

        const gain =
          investment.value -
          investment.amount;

        return `

          <div class="investment">

            <h3>
              ${escapeHTML(investment.name)}
            </h3>

            <p>
              Invested:
              ${formatMoney(investment.amount)}
            </p>

            <p>
              Current value:
              ${formatMoney(investment.value)}
            </p>

            <strong
              class="${gain >= 0 ? "income" : "expense"}"
            >
              ${gain >= 0 ? "+" : ""}
              ${formatMoney(gain)}
            </strong>

            <br><br>

            <button
              class="delete-btn"
              onclick="deleteInvestment(${investment.id})"
            >
              Delete
            </button>

          </div>

        `;

      })
      .join("");
}


// ==========================================
// REAL AI ASSISTANT
// ==========================================

async function askAI() {

  const input =
    document.getElementById("aiInput");

  const chat =
    document.getElementById("chatMessages");

  if (!input || !chat) {

    console.error(
      "AI input or chat container not found."
    );

    return;
  }

  const question =
    input.value.trim();

  if (!question) return;


  // User message

  addChatMessage(
    question,
    "user"
  );

  input.value = "";


  // Thinking message

  const thinking =
    document.createElement("div");

  thinking.className =
    "message ai";

  thinking.textContent =
    "MoneyMind AI is thinking...";

  chat.appendChild(thinking);

  chat.scrollTop =
    chat.scrollHeight;


  try {

    const response =
      await fetch(

        AI_URL,

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            message: question,

            financialData: {

              transactions,

              goals,

              investments

            }

          })

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "AI request failed."
      );

    }


    thinking.textContent =
      data.reply ||
      "I couldn't generate a response.";


  }

  catch (error) {

    console.error(
      "MoneyMind AI error:",
      error
    );

    thinking.textContent =
      "Sorry, MoneyMind AI couldn't connect right now. Please try again.";

  }


  chat.scrollTop =
    chat.scrollHeight;
}


// ==========================================
// QUICK QUESTIONS
// ==========================================

function quickQuestion(question) {

  const input =
    document.getElementById("aiInput");

  if (!input) return;

  input.value =
    question;

  askAI();
}


// ==========================================
// CHAT
// ==========================================

function addChatMessage(
  message,
  type
) {

  const container =
    document.getElementById("chatMessages");

  if (!container) return;

  const div =
    document.createElement("div");

  div.className =
    `message ${type}`;

  div.textContent =
    message;

  container.appendChild(div);

  container.scrollTop =
    container.scrollHeight;
}


// ==========================================
// MODALS
// ==========================================

function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {

    modal.classList.remove("show");

  }
}


window.addEventListener(
  "click",
  function(event) {

    document
      .querySelectorAll(".modal")
      .forEach(modal => {

        if (event.target === modal) {

          modal.classList.remove("show");

        }

      });

  }
);


// ==========================================
// UTILITIES
// ==========================================

function formatDate(date) {

  return new Date(date)
    .toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
}


function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value;

  return div.innerHTML;
}


// ==========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================

window.askAI =
  askAI;

window.quickQuestion =
  quickQuestion;

window.openTransactionModal =
  openTransactionModal;

window.addTransaction =
  addTransaction;

window.deleteTransaction =
  deleteTransaction;

window.openGoalModal =
  openGoalModal;

window.addGoal =
  addGoal;

window.deleteGoal =
  deleteGoal;

window.openInvestmentModal =
  openInvestmentModal;

window.addInvestment =
  addInvestment;

window.deleteInvestment =
  deleteInvestment;

window.closeModal =
  closeModal;

window.showSection =
  showSection;

window.toggleMenu =
  toggleMenu;

