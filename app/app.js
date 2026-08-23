// ==========================================
// MONEY MIND AI - COMPLETE APP.JS
// ==========================================
// ==========================================
// MONEY MIND AUTHENTICATION
// ==========================================

async function checkAuth() {

  const {
    data: {
      session
    }
 } = await window.supabaseClient.auth.getSession();ff
  const authScreen =
    document.getElementById("authScreen");

  if (!authScreen) return;

  if (session) {

    authScreen.style.display = "none";

    console.log(
      "MoneyMind user:",
      session.user.email
    );

  } else {

    authScreen.style.display = "flex";
  }
}


async function signupUser() {

  const email =
    document
      .getElementById("signupEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("signupPassword")
      .value;

  const message =
    document.getElementById("authMessage");

  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }

  if (password.length < 6) {

    message.textContent =
      "Password must be at least 6 characters.";

    return;
  }

  message.textContent =
    "Creating your account...";

  const {
    data,
    error
  } =
    await window.supabaseClient.auth.signUp({
      email: email,
      password: password
    });

  if (error) {

    console.error(error);

    message.textContent =
      error.message;

    return;
  }

  if (data.session) {

    message.textContent =
      "Account created successfully.";

    await checkAuth();

  } else {

    message.textContent =
      "Account created. Please check your email to confirm your account.";
  }
}


async function loginUser() {

  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;

  const message =
    document.getElementById("authMessage");

  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }

  message.textContent =
    "Logging in...";

  const {
    data,
    error
  } =
    await window.supabaseClient.auth.getSession()
      email: email,
      password: password
    });

  if (error) {

    console.error(error);

    message.textContent =
      error.message;

    return;
  }

  message.textContent =
    "Login successful.";

  await checkAuth();
}


function showSignup() {

  document.getElementById(
    "loginForm"
  ).style.display = "none";

  document.getElementById(
    "signupForm"
  ).style.display = "block";

  document.getElementById(
    "authMessage"
  ).textContent = "";
}


function showLogin() {

  document.getElementById(
    "signupForm"
  ).style.display = "none";

  document.getElementById(
    "loginForm"
  ).style.display = "block";

  document.getElementById(
    "authMessage"
  ).textContent = "";
}

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";

let transactions =
  JSON.parse(localStorage.getItem("mm_transactions")) || [];

let goals =
  JSON.parse(localStorage.getItem("mm_goals")) || [];

let investments =
  JSON.parse(localStorage.getItem("mm_investments")) || [];


// ==========================================
// START APP
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
// NAVIGATION
// ==========================================

function showSection(sectionId) {
  document
    .querySelectorAll(".section")
    .forEach(function (section) {
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

  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {
  const income =
    transactions
      .filter(function (t) {
        return t.type === "income";
      })
      .reduce(function (sum, t) {
        return sum + Number(t.amount);
      }, 0);

  const expenses =
    transactions
      .filter(function (t) {
        return t.type === "expense";
      })
      .reduce(function (sum, t) {
        return sum + Number(t.amount);
      }, 0);

  const balance =
    income - expenses;

  const incomeElement =
    document.getElementById("totalIncome");

  const expenseElement =
    document.getElementById("totalExpenses");

  const balanceElement =
    document.getElementById("balance");

  if (incomeElement) {
    incomeElement.textContent =
      formatMoney(income);
  }

  if (expenseElement) {
    expenseElement.textContent =
      formatMoney(expenses);
  }

  if (balanceElement) {
    balanceElement.textContent =
      formatMoney(balance);
  }

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

  const scoreElement =
    document.getElementById("healthScore");

  const title =
    document.getElementById("healthTitle");

  const message =
    document.getElementById("healthMessage");

  if (scoreElement) {
    scoreElement.textContent =
      score + "%";
  }

  if (!title || !message) return;

  if (score >= 85) {
    title.textContent =
      "Excellent financial health";

    message.textContent =
      "You're maintaining a strong savings position.";

  } else if (score >= 70) {
    title.textContent =
      "Good financial health";

    message.textContent =
      "You're doing well. Look for opportunities to increase savings.";

  } else if (score >= 50) {
    title.textContent =
      "Needs attention";

    message.textContent =
      "Your expenses are taking a significant portion of your income.";

  } else if (score > 0) {
    title.textContent =
      "Warning";

    message.textContent =
      "Your spending may be higher than your income.";

  } else {
    title.textContent =
      "Let's get started";

    message.textContent =
      "Add your income and expenses to see your financial health.";
  }
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
      document
        .getElementById("transactionAmount")
        ?.value
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
    type: type,
    description: description,
    amount: amount,
    category: category,
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
    transactions.filter(function (transaction) {
      return transaction.id !== id;
    });

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
      .map(function (t) {
        return `
          <div class="transaction">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(t.description)}
              </strong>

              <small>
                ${escapeHTML(t.category || "General")}
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
        `;
      })
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
      .map(function (t) {
        return `
          <div class="transaction">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(t.description)}
              </strong>

              <small>
                ${escapeHTML(t.category || "General")}
                •
                ${formatDate(t.date)}
              </small>

            </div>

            <div class="${t.type}">
              ${t.type === "income" ? "+" : "-"}
              ${formatMoney(t.amount)}
            </div>

          </div>
        `;
      })
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
    document
      .getElementById("goalName")
      ?.value
      .trim();

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


function deleteGoal(id) {
  if (
    !confirm(
      "Are you sure you want to delete this savings goal?"
    )
  ) {
    return;
  }

  goals =
    goals.filter(function (goal) {
      return goal.id !== id;
    });

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
      .map(function (goal) {
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
    name: name,
    amount: amount,
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
    investments.filter(function (investment) {
      return investment.id !== id;
    });

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
      .map(function (investment) {
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
// MONEY MIND AI
// ==========================================

async function askAI() {
  const input =
    document.getElementById("aiInput");

  const chat =
    document.getElementById("chatMessages");

  if (!input || !chat) {
    console.error(
      "MoneyMind AI elements not found."
    );
    return;
  }

  const question =
    input.value.trim();

  if (!question) return;

  addChatMessage(
    question,
    "user"
  );

  input.value = "";

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
      await fetch(AI_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: question,

          financialData: {
            transactions: transactions,
            goals: goals,
            investments: investments
          }
        })
      });

    const data =
      await response.json();

    console.log(
      "MoneyMind AI response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
        "AI request failed."
      );
    }

    thinking.textContent =
      data.reply ||
      data.message ||
      "MoneyMind AI received your question.";

  } catch (error) {

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


function quickQuestion(question) {
  const input =
    document.getElementById("aiInput");

  if (!input) return;

  input.value =
    question;

  askAI();
}


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
    "message " + type;

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
  function (event) {
    document
      .querySelectorAll(".modal")
      .forEach(function (modal) {

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
// EXPOSE FUNCTIONS TO HTML
// ==========================================

window.showSection =
  showSection;

window.toggleMenu =
  toggleMenu;

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

window.askAI =
  askAI;

window.quickQuestion =
  quickQuestion;

window.closeModal =
  closeModal;// ==========================================
// MONEY MIND AUTHENTICATION
// ==========================================

async function signupUser() {

  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const message = document.getElementById("authMessage");

  if (!email || !password) {
    message.textContent = "Please enter your email and password.";
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent =
    "Account created. Please check your email to confirm your account.";
}


async function loginUser() {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("authMessage");

  if (!email || !password) {
    message.textContent = "Please enter your email and password.";
    return;
  }

  const { error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    message.textContent = error.message;
    return;
  }

  document.getElementById("authScreen").style.display = "none";
}


function showSignup() {

  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("authMessage").textContent = "";
}


function showLogin() {

  document.getElementById("signupForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("authMessage").textContent = "";
}

