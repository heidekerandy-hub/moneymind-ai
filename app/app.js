```javascript
/* =========================================================
   MONEYMIND AI
   COMPLETE APP.JS
   ========================================================= */

"use strict";

console.log("MoneyMind AI app.js loaded successfully.");


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentUser = null;

let transactions = [];
let goals = [];
let investments = [];

let supabaseClient =
  window.supabaseClient || null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function formatMoney(amount) {

  const value = Number(amount) || 0;

  return "₦" + value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function setText(id, value) {

  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}


function showAuthMessage(message, isError = false) {

  const element = $("authMessage");

  if (!element) return;

  element.textContent = message;

  element.classList.toggle("error", isError);
}


/* =========================================================
   AUTH SCREEN
   ========================================================= */

function showLogin() {

  const login = $("loginForm");
  const signup = $("signupForm");

  if (login) {
    login.classList.remove("hidden");
    login.style.display = "";
  }

  if (signup) {
    signup.classList.add("hidden");
    signup.style.display = "none";
  }

  showAuthMessage("");
}


function showSignup() {

  const login = $("loginForm");
  const signup = $("signupForm");

  if (login) {
    login.classList.add("hidden");
    login.style.display = "none";
  }

  if (signup) {
    signup.classList.remove("hidden");
    signup.style.display = "";
  }

  showAuthMessage("");
}


function showApplication(user) {

  currentUser = user || null;

  const authScreen = $("authScreen");
  const app = $("app");

  if (authScreen) {
    authScreen.classList.add("hidden");
    authScreen.style.display = "none";
  }

  if (app) {
    app.classList.remove("hidden");
    app.style.display = "";
  }

  if (user && user.email) {
    setText("userEmail", user.email);
  }

  console.log(
    "Logged in:",
    user ? user.email : "unknown user"
  );

  loadUserData();
}


function showAuthentication() {

  currentUser = null;

  const authScreen = $("authScreen");
  const app = $("app");

  if (authScreen) {
    authScreen.classList.remove("hidden");
    authScreen.style.display = "";
  }

  if (app) {
    app.classList.add("hidden");
    app.style.display = "none";
  }

  showLogin();
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser() {

  console.log("Login button clicked.");

  if (!supabaseClient) {

    console.error("Supabase client unavailable.");

    showAuthMessage(
      "Authentication service is unavailable.",
      true
    );

    return;
  }

  const emailElement = $("loginEmail");
  const passwordElement = $("loginPassword");

  const email =
    emailElement ? emailElement.value.trim() : "";

  const password =
    passwordElement ? passwordElement.value : "";

  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password.",
      true
    );

    return;
  }

  showAuthMessage("Logging in...");

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data || !data.user) {

      showAuthMessage(
        "Login was unsuccessful.",
        true
      );

      return;
    }

    console.log(
      "Login successful:",
      data.user.email
    );

    showApplication(data.user);

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    showAuthMessage(
      error.message || "Login failed.",
      true
    );
  }
}


/* =========================================================
   SIGN UP
   ========================================================= */

async function signupUser() {

  console.log("Signup button clicked.");

  if (!supabaseClient) {

    showAuthMessage(
      "Authentication service is unavailable.",
      true
    );

    return;
  }

  const emailElement = $("signupEmail");
  const passwordElement = $("signupPassword");

  const email =
    emailElement ? emailElement.value.trim() : "";

  const password =
    passwordElement ? passwordElement.value : "";

  if (!email || !password) {

    showAuthMessage(
      "Please enter an email and password.",
      true
    );

    return;
  }

  if (password.length < 6) {

    showAuthMessage(
      "Password must contain at least 6 characters.",
      true
    );

    return;
  }

  showAuthMessage("Creating your account...");

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (data && data.session) {

      showApplication(data.user);

    } else {

      showAuthMessage(
        "Account created. Check your email to confirm your account."
      );

      showLogin();
    }

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    showAuthMessage(
      error.message || "Account creation failed.",
      true
    );
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  console.log("Logging out...");

  try {

    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  } finally {

    transactions = [];
    goals = [];
    investments = [];

    showAuthentication();

    console.log("Logged out.");
  }
}


/* =========================================================
   AUTH CHECK
   ========================================================= */

async function checkAuth() {

  if (!supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showAuthMessage(
      "Supabase connection unavailable.",
      true
    );

    showAuthentication();

    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (data && data.session) {

      showApplication(
        data.session.user
      );

    } else {

      showAuthentication();
    }

  } catch (error) {

    console.error(
      "Authentication check failed:",
      error
    );

    showAuthentication();
  }
}


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

function setupAuthListener() {

  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange(
    function(event, session) {

      console.log(
        "Auth event:",
        event
      );

      if (
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {

        if (session && session.user) {
          showApplication(session.user);
        } else {
          showAuthentication();
        }

      }

      if (event === "SIGNED_OUT") {
        showAuthentication();
      }

    }
  );
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMenu() {

  const menu = $("mobileMenu");
  const button = $("menuButton");

  if (!menu) {

    console.error(
      "mobileMenu not found."
    );

    return;
  }

  const isOpen =
    menu.classList.contains("open");

  if (isOpen) {

    menu.classList.remove("open");

    menu.style.display = "";

    if (button) {

      button.setAttribute(
        "aria-expanded",
        "false"
      );

      button.setAttribute(
        "aria-label",
        "Open menu"
      );
    }

    console.log("Menu closed.");

  } else {

    menu.classList.add("open");

    if (button) {

      button.setAttribute(
        "aria-expanded",
        "true"
      );

      button.setAttribute(
        "aria-label",
        "Close menu"
      );
    }

    console.log("Menu opened.");
  }
}


function closeMenu() {

  const menu = $("mobileMenu");
  const button = $("menuButton");

  if (!menu) return;

  menu.classList.remove("open");

  if (button) {

    button.setAttribute(
      "aria-expanded",
      "false"
    );

    button.setAttribute(
      "aria-label",
      "Open menu"
    );
  }
}


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function showSection(sectionId) {

  console.log(
    "Opening section:",
    sectionId
  );

  const sections =
    document.querySelectorAll(".section");

  sections.forEach(function(section) {

    section.classList.remove("active");

    section.style.display = "none";
  });


  const selected =
    $(sectionId);

  if (!selected) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }


  selected.classList.add("active");
  selected.style.display = "";


  const navItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );

  navItems.forEach(function(item) {

    item.classList.remove("active");

    if (
      item.dataset.section === sectionId
    ) {

      item.classList.add("active");
    }
  });


  closeMenu();


  if (sectionId === "dashboard") {
    updateDashboard();
  }

  if (sectionId === "transactions") {
    renderTransactions();
  }

  if (sectionId === "goals") {
    renderGoals();
  }

  if (sectionId === "investments") {
    renderInvestments();
  }

  if (sectionId === "assistant") {
    updateAIData();
  }
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(id) {

  const modal = $(id);

  if (!modal) {

    console.error(
      "Modal not found:",
      id
    );

    return;
  }

  modal.classList.add("open");

  modal.style.display = "flex";
}


function closeModal(id) {

  const modal = $(id);

  if (!modal) return;

  modal.classList.remove("open");

  modal.style.display = "none";
}


function openTransactionModal() {

  openModal("transactionModal");
}


function openGoalModal() {

  openModal("goalModal");
}


function openInvestmentModal() {

  openModal("investmentModal");
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

async function addTransaction() {

  const type =
    $("transactionType")?.value || "expense";

  const description =
    $("transactionDescription")?.value.trim() || "";

  const amount =
    Number($("transactionAmount")?.value || 0);

  const category =
    $("transactionCategory")?.value || "Other";


  if (!description) {

    alert("Please enter a transaction description.");

    return;
  }

  if (!amount || amount <= 0) {

    alert("Please enter a valid amount.");

    return;
  }


  const transaction = {

    id: Date.now().toString(),

    type,

    description,

    amount,

    category,

    created_at:
      new Date().toISOString()
  };


  transactions.unshift(
    transaction
  );


  await saveTransaction(
    transaction
  );


  clearTransactionForm();

  closeModal(
    "transactionModal"
  );

  updateDashboard();

  renderTransactions();

  console.log(
    "Transaction added:",
    transaction
  );
}


async function saveTransaction(transaction) {

  if (!supabaseClient || !currentUser) {
    saveLocalData();
    return;
  }

  try {

    const {
      error
    } = await supabaseClient
      .from("transactions")
      .insert({

        user_id: currentUser.id,

        type: transaction.type,

        description:
          transaction.description,

        amount:
          transaction.amount,

        category:
          transaction.category,

        created_at:
          transaction.created_at
      });


    if (error) {

      console.warn(
        "Could not save transaction to Supabase:",
        error.message
      );

      saveLocalData();
    }

  } catch (error) {

    console.warn(
      "Transaction database error:",
      error
    );

    saveLocalData();
  }
}


function clearTransactionForm() {

  if ($("transactionDescription")) {
    $("transactionDescription").value = "";
  }

  if ($("transactionAmount")) {
    $("transactionAmount").value = "";
  }

  if ($("transactionType")) {
    $("transactionType").value = "income";
  }

  if ($("transactionCategory")) {
    $("transactionCategory").value = "Salary";
  }
}


function renderTransactions() {

  const containers = [

    $("recentTransactions"),

    $("allTransactions")
  ];


  const sorted =
    [...transactions].sort(
      function(a, b) {

        return new Date(b.created_at) -
               new Date(a.created_at);
      }
    );


  containers.forEach(function(container) {

    if (!container) return;


    if (!sorted.length) {

      container.innerHTML =
        '<p class="empty">No transactions yet.</p>';

      return;
    }


    container.innerHTML =
      sorted.map(function(transaction) {

        const positive =
          transaction.type === "income";

        const sign =
          positive ? "+" : "-";

        const date =
          new Date(
            transaction.created_at
          ).toLocaleDateString(
            "en-NG"
          );


        return `
          <div class="transaction-item">

            <div>
              <strong>
                ${escapeHTML(transaction.description)}
              </strong>

              <small>
                ${escapeHTML(transaction.category)}
                • ${date}
              </small>
            </div>

            <strong class="${
              positive
                ? "income"
                : "expense"
            }">

              ${sign}${formatMoney(transaction.amount)}

            </strong>

          </div>
        `;

      }).join("");
  });
}


/* =========================================================
   GOALS
   ========================================================= */

async function addGoal() {

  const name =
    $("goalName")?.value.trim() || "";

  const target =
    Number($("goalTarget")?.value || 0);

  const saved =
    Number($("goalSaved")?.value || 0);


  if (!name) {

    alert("Please enter a goal name.");

    return;
  }


  if (!target || target <= 0) {

    alert("Please enter a valid target amount.");

    return;
  }


  const goal = {

    id: Date.now().toString(),

    name,

    target,

    saved,

    created_at:
      new Date().toISOString()
  };


  goals.unshift(goal);


  await saveGoal(goal);


  clearGoalForm();

  closeModal("goalModal");

  renderGoals();

  updateDashboard();
}


async function saveGoal(goal) {

  if (!supabaseClient || !currentUser) {

    saveLocalData();

    return;
  }


  try {

    const {
      error
    } = await supabaseClient
      .from("goals")
      .insert({

        user_id: currentUser.id,

        name: goal.name,

        target: goal.target,

        saved: goal.saved,

        created_at:
          goal.created_at
      });


    if (error) {

      console.warn(
        "Could not save goal:",
        error.message
      );

      saveLocalData();
    }

  } catch (error) {

    console.warn(
      "Goal database error:",
      error
    );

    saveLocalData();
  }
}


function clearGoalForm() {

  if ($("goalName")) {
    $("goalName").value = "";
  }

  if ($("goalTarget")) {
    $("goalTarget").value = "";
  }

  if ($("goalSaved")) {
    $("goalSaved").value = "";
  }
}


function renderGoals() {

  const container =
    $("goalsList");

  if (!container) return;


  if (!goals.length) {

    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';

    return;
  }


  container.innerHTML =
    goals.map(function(goal) {

      const percentage =
        goal.target > 0
          ? Math.min(
              100,
              (goal.saved / goal.target) * 100
            )
          : 0;


      return `
        <div class="goal-card">

          <div class="panel-header">

            <div>

              <h3>
                ${escapeHTML(goal.name)}
              </h3>

              <p>
                ${formatMoney(goal.saved)}
                of
                ${formatMoney(goal.target)}
              </p>

            </div>

            <strong>
              ${percentage.toFixed(0)}%
            </strong>

          </div>

          <div class="progress">
            <div
              class="progress-bar"
              style="width:${percentage}%"
            ></div>
          </div>

        </div>
      `;

    }).join("");
}


/* =========================================================
   INVESTMENTS
   ========================================================= */

async function addInvestment() {

  const name =
    $("investmentName")?.value.trim() || "";

  const amount =
    Number(
      $("investmentAmount")?.value || 0
    );

  const value =
    Number(
      $("investmentValue")?.value || 0
    );


  if (!name) {

    alert("Please enter the investment name.");

    return;
  }


  if (!amount || amount <= 0) {

    alert("Please enter the amount invested.");

    return;
  }


  const investment = {

    id: Date.now().toString(),

    name,

    amount,

    value,

    created_at:
      new Date().toISOString()
  };


  investments.unshift(
    investment
  );


  await saveInvestment(
    investment
  );


  clearInvestmentForm();

  closeModal(
    "investmentModal"
  );

  renderInvestments();

  updateDashboard();
}


async function saveInvestment(investment) {

  if (!supabaseClient || !currentUser) {

    saveLocalData();

    return;
  }


  try {

    const {
      error
    } = await supabaseClient
      .from("investments")
      .insert({

        user_id: currentUser.id,

        name: investment.name,

        amount: investment.amount,

        current_value:
          investment.value,

        created_at:
          investment.created_at
      });


    if (error) {

      console.warn(
        "Could not save investment:",
        error.message
      );

      saveLocalData();
    }

  } catch (error) {

    console.warn(
      "Investment database error:",
      error
    );

    saveLocalData();
  }
}


function clearInvestmentForm() {

  if ($("investmentName")) {
    $("investmentName").value = "";
  }

  if ($("investmentAmount")) {
    $("investmentAmount").value = "";
  }

  if ($("investmentValue")) {
    $("investmentValue").value = "";
  }
}


function renderInvestments() {

  const container =
    $("investmentsList");

  if (!container) return;


  const totalInvested =
    investments.reduce(
      function(total, item) {

        return total +
          Number(item.amount || 0);

      },
      0
    );


  const currentValue =
    investments.reduce(
      function(total, item) {

        return total +
          Number(item.value || 0);

      },
      0
    );


  const gain =
    currentValue -
    totalInvested;


  setText(
    "totalInvested",
    formatMoney(totalInvested)
  );

  setText(
    "investmentValue",
    formatMoney(currentValue)
  );

  setText(
    "investmentGain",
    formatMoney(gain)
  );


  if (!investments.length) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }


  container.innerHTML =
    investments.map(function(item) {

      const itemGain =
        Number(item.value || 0) -
        Number(item.amount || 0);


      return `
        <div class="investment-card">

          <div>

            <h3>
              ${escapeHTML(item.name)}
            </h3>

            <p>
              Invested:
              ${formatMoney(item.amount)}
            </p>

          </div>

          <div>

            <strong>
              ${formatMoney(item.value)}
            </strong>

            <small>
              ${
                itemGain >= 0
                  ? "+"
                  : ""
              }${formatMoney(itemGain)}
            </small>

          </div>

        </div>
      `;

    }).join("");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const income =
    transactions
      .filter(
        item => item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );


  const expenses =
    transactions
      .filter(
        item => item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );


  const balance =
    income - expenses;


  const savingsRate =
    income > 0
      ? ((balance / income) * 100)
      : 0;


  setText(
    "totalIncome",
    formatMoney(income)
  );

  setText(
    "totalExpenses",
    formatMoney(expenses)
  );

  setText(
    "balance",
    formatMoney(balance)
  );

  setText(
    "dashboardSavingsRate",
    Math.max(
      0,
      savingsRate
    ).toFixed(0) + "%"
  );


  const score =
    calculateHealthScore(
      income,
      expenses
    );


  setText(
    "healthScore",
    score + "%"
  );


  if (score >= 80) {

    setText(
      "healthTitle",
      "Excellent financial health"
    );

    setText(
      "healthMessage",
      "Your income and spending are currently well balanced."
    );

  } else if (score >= 60) {

    setText(
      "healthTitle",
      "Good financial health"
    );

    setText(
      "healthMessage",
      "You are on the right track. Keep improving your savings."
    );

  } else if (income > 0) {

    setText(
      "healthTitle",
      "Room for improvement"
    );

    setText(
      "healthMessage",
      "Try reducing unnecessary expenses and increasing savings."
    );

  } else {

    setText(
      "healthTitle",
      "Let's get started"
    );

    setText(
      "healthMessage",
      "Add your income and expenses to see your financial health."
    );
  }


  renderTransactions();

  renderInvestments();

  renderGoals();

  updateAIData();
}


function calculateHealthScore(
  income,
  expenses
) {

  if (!income) return 0;


  const savingsRate =
    (income - expenses) /
    income;


  if (savingsRate >= 0.30) {
    return 95;
  }

  if (savingsRate >= 0.20) {
    return 85;
  }

  if (savingsRate >= 0.10) {
    return 70;
  }

  if (savingsRate >= 0) {
    return 55;
  }

  return 25;
}


/* =========================================================
   AI ASSISTANT
   ========================================================= */

function getFinancialSummary() {

  const income =
    transactions
      .filter(
        item => item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );


  const expenses =
    transactions
      .filter(
        item => item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );


  const balance =
    income - expenses;


  const savingsRate =
    income > 0
      ? (balance / income) * 100
      : 0;


  const investmentsTotal =
    investments.reduce(
      (sum, item) =>
        sum + Number(item.value || 0),
      0
    );


  return {

    income,

    expenses,

    balance,

    savingsRate,

    investmentsTotal,

    goalsCount:
      goals.length
  };
}


function updateAIData() {

  const summary =
    getFinancialSummary();


  setText(
    "aiIncome",
    formatMoney(summary.income)
  );

  setText(
    "aiExpenses",
    formatMoney(summary.expenses)
  );

  setText(
    "aiBalance",
    formatMoney(summary.balance)
  );

  setText(
    "aiSavingsRate",
    Math.max(
      0,
      summary.savingsRate
    ).toFixed(0) + "%"
  );
}


function quickQuestion(question) {

  const input =
    $("aiInput");

  if (!input) return;

  input.value =
    question;

  askAI();
}


function askAI() {

  const input =
    $("aiInput");

  const chat =
    $("chatMessages");


  if (!input || !chat) return;


  const question =
    input.value.trim();


  if (!question) return;


  const userMessage =
    document.createElement("div");

  userMessage.className =
    "message user";

  userMessage.textContent =
    question;

  chat.appendChild(
    userMessage
  );


  input.value = "";


  const answer =
    generateAIResponse(
      question
    );


  const aiMessage =
    document.createElement("div");

  aiMessage.className =
    "message ai";

  aiMessage.innerHTML =
    answer;

  chat.appendChild(
    aiMessage
  );


  chat.scrollTop =
    chat.scrollHeight;
}


function generateAIResponse(question) {

  const q =
    question.toLowerCase();

  const summary =
    getFinancialSummary();


  if (!summary.income &&
      !summary.expenses) {

    return `
      <strong>Let's start with your numbers.</strong>
      <br><br>
      Add your income and expenses in MoneyMind AI.
      Once you do that, I can give you advice based
      on your actual financial position.
    `;
  }


  if (
    q.includes("expense") ||
    q.includes("spend")
  ) {

    return `
      <strong>Your spending snapshot</strong>
      <br><br>
      Income: ${formatMoney(summary.income)}
      <br>
      Expenses: ${formatMoney(summary.expenses)}
      <br>
      Balance: ${formatMoney(summary.balance)}
      <br><br>
      ${
        summary.expenses > summary.income
          ? "Your expenses are currently higher than your income. Focus on reducing non-essential spending."
          : "Your expenses are below your income. Review your largest expense categories and look for opportunities to save more."
      }
    `;
  }


  if (
    q.includes("save") ||
    q.includes("saving")
  ) {

    const recommended =
      summary.income * 0.20;


    return `
      <strong>Savings guidance</strong>
      <br><br>
      Your current balance is
      ${formatMoney(summary.balance)}.
      <br><br>
      A useful starting target is around
      20% of income, which would be approximately
      ${formatMoney(recommended)} based on your recorded income.
      <br><br>
      Increase this gradually if your essential expenses allow it.
    `;
  }


  if (
    q.includes("invest")
  ) {

    return `
      <strong>Investment snapshot</strong>
      <br><br>
      Your recorded investment value is
      ${formatMoney(summary.investmentsTotal)}.
      <br><br>
      Before increasing investments, make sure your
      regular expenses are covered and you maintain
      an emergency savings buffer.
    `;
  }


  if (
    q.includes("budget") ||
    q.includes("financial situation") ||
    q.includes("analyze")
  ) {

    return `
      <strong>Your MoneyMind analysis</strong>
      <br><br>
      Income:
      ${formatMoney(summary.income)}
      <br>
      Expenses:
      ${formatMoney(summary.expenses)}
      <br>
      Balance:
      ${formatMoney(summary.balance)}
      <br>
      Savings rate:
      ${Math.max(
        0,
        summary.savingsRate
      ).toFixed(1)}%
      <br><br>
      ${
        summary.balance >= 0
          ? "You currently have a positive cash flow. Your next priority should be building savings and allocating surplus money deliberately."
          : "You currently have negative cash flow. Your first priority should be controlling expenses and restoring a positive monthly balance."
      }
    `;
  }


  return `
    <strong>MoneyMind AI</strong>
    <br><br>
    Based on the information you've entered, your
    current balance is
    ${formatMoney(summary.balance)}.
    <br><br>
    Try asking me:
    <br>
    • How can I reduce my expenses?
    <br>
    • How much should I save each month?
    <br>
    • Analyze my financial situation.
    <br>
    • How should I improve my investments?
  `;
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getStorageKey(type) {

  if (!currentUser) {
    return "moneymind_" + type;
  }

  return (
    "moneymind_" +
    type +
    "_" +
    currentUser.id
  );
}


function saveLocalData() {

  try {

    localStorage.setItem(
      getStorageKey("transactions"),
      JSON.stringify(transactions)
    );

    localStorage.setItem(
      getStorageKey("goals"),
      JSON.stringify(goals)
    );

    localStorage.setItem(
      getStorageKey("investments"),
      JSON.stringify(investments)
    );

  } catch (error) {

    console.warn(
      "Local storage save failed:",
      error
    );
  }
}


function loadLocalData() {

  try {

    const storedTransactions =
      localStorage.getItem(
        getStorageKey("transactions")
      );

    const storedGoals =
      localStorage.getItem(
        getStorageKey("goals")
      );

    const storedInvestments =
      localStorage.getItem(
        getStorageKey("investments")
      );


    transactions =
      storedTransactions
        ? JSON.parse(storedTransactions)
        : [];


    goals =
      storedGoals
        ? JSON.parse(storedGoals)
        : [];


    investments =
      storedInvestments
        ? JSON.parse(storedInvestments)
        : [];


  } catch (error) {

    console.warn(
      "Local storage load failed:",
      error
    );

    transactions = [];
    goals = [];
    investments = [];
  }
}


/* =========================================================
   DATABASE LOADING
   ========================================================= */

async function loadUserData() {

  loadLocalData();


  if (!supabaseClient ||
      !currentUser) {

    updateDashboard();

    return;
  }


  try {

    const transactionResult =
      await supabaseClient
        .from("transactions")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (
      !transactionResult.error &&
      transactionResult.data
    ) {

      transactions =
        transactionResult.data.map(
          function(item) {

            return {

              id:
                item.id,

              type:
                item.type,

              description:
                item.description,

              amount:
                Number(item.amount),

              category:
                item.category,

              created_at:
                item.created_at
            };
          }
        );
    }


    const goalResult =
      await supabaseClient
        .from("goals")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (
      !goalResult.error &&
      goalResult.data
    ) {

      goals =
        goalResult.data.map(
          function(item) {

            return {

              id:
                item.id,

              name:
                item.name,

              target:
                Number(item.target),

              saved:
                Number(item.saved),

              created_at:
                item.created_at
            };
          }
        );
    }


    const investmentResult =
      await supabaseClient
        .from("investments")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (
      !investmentResult.error &&
      investmentResult.data
    ) {

      investments =
        investmentResult.data.map(
          function(item) {

            return {

              id:
                item.id,

              name:
                item.name,

              amount:
                Number(item.amount),

              value:
                Number(
                  item.current_value
                ),

              created_at:
                item.created_at
            };
          }
        );
    }


  } catch (error) {

    console.warn(
      "Could not load all database data:",
      error
    );
  }


  saveLocalData();

  updateDashboard();
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {


  const menuButton =
    $("menuButton");

  if (menuButton) {

    menuButton.addEventListener(
      "click",
      toggleMenu
    );
  }


  const navItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );


  navItems.forEach(
    function(item) {

      item.addEventListener(
        "click",
        function() {

          showSection(
            item.dataset.section
          );
        }
      );

    }
  );


  const logoutButton =
    $("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logoutUser
    );
  }


  const loginButton =
    $("loginButton");

  if (loginButton) {

    loginButton.addEventListener(
      "click",
      loginUser
    );
  }


  const signupButton =
    $("signupButton");

  if (signupButton) {

    signupButton.addEventListener(
      "click",
      signupUser
    );
  }


  const showSignupButton =
    $("showSignupButton");

  if (showSignupButton) {

    showSignupButton.addEventListener(
      "click",
      showSignup
    );
  }


  const showLoginButton =
    $("showLoginButton");

  if (showLoginButton) {

    showLoginButton.addEventListener(
      "click",
      showLogin
    );
  }


  const dashboardAdd =
    $("dashboardAddTransaction");

  if (dashboardAdd) {

    dashboardAdd.addEventListener(
      "click",
      openTransactionModal
    );
  }


  const transactionsAdd =
    $("transactionsAddButton");

  if (transactionsAdd) {

    transactionsAdd.addEventListener(
      "click",
      openTransactionModal
    );
  }


  const goalAdd =
    $("goalAddButton");

  if (goalAdd) {

    goalAdd.addEventListener(
      "click",
      openGoalModal
    );
  }


  const investmentAdd =
    $("investmentAddButton");

  if (investmentAdd) {

    investmentAdd.addEventListener(
      "click",
      openInvestmentModal
    );
  }


  const saveTransactionButton =
    $("saveTransactionButton");

  if (saveTransactionButton) {

    saveTransactionButton.addEventListener(
      "click",
      addTransaction
    );
  }


  const saveGoalButton =
    $("saveGoalButton");

  if (saveGoalButton) {

    saveGoalButton.addEventListener(
      "click",
      addGoal
    );
  }


  const saveInvestmentButton =
    $("saveInvestmentButton");

  if (saveInvestmentButton) {

    saveInvestmentButton.addEventListener(
      "click",
      addInvestment
    );
  }


  const viewTransactions =
    $("viewTransactionsButton");

  if (viewTransactions) {

    viewTransactions.addEventListener(
      "click",
      function() {

        showSection(
          "transactions"
        );

      }
    );
  }


  const sendAIButton =
    $("sendAIButton");

  if (sendAIButton) {

    sendAIButton.addEventListener(
      "click",
      askAI
    );
  }


  const aiInput =
    $("aiInput");

  if (aiInput) {

    aiInput.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          askAI();
        }
      }
    );
  }


  const suggestions =
    document.querySelectorAll(
      ".suggestions [data-question]"
    );


  suggestions.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          quickQuestion(
            button.dataset.question
          );

        }
      );

    }
  );


  const closeButtons =
    document.querySelectorAll(
      "[data-close]"
    );


  closeButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          closeModal(
            button.dataset.close
          );

        }
      );

    }
  );


  document
    .querySelectorAll(".modal")
    .forEach(
      function(modal) {

        modal.addEventListener(
          "click",
          function(event) {

            if (
              event.target === modal
            ) {

              closeModal(
                modal.id
              );
            }

          }
        );

      }
    );
}


/* =========================================================
   EXPOSE FUNCTIONS TO WINDOW
   IMPORTANT FOR HTML onclick
   ========================================================= */

window.loginUser =
  loginUser;

window.signupUser =
  signupUser;

window.logoutUser =
  logoutUser;

window.showLogin =
  showLogin;

window.showSignup =
  showSignup;

window.toggleMenu =
  toggleMenu;

window.closeMenu =
  closeMenu;

window.showSection =
  showSection;

window.openModal =
  openModal;

window.closeModal =
  closeModal;

window.openTransactionModal =
  openTransactionModal;

window.openGoalModal =
  openGoalModal;

window.openInvestmentModal =
  openInvestmentModal;

window.addTransaction =
  addTransaction;

window.addGoal =
  addGoal;

window.addInvestment =
  addInvestment;

window.askAI =
  askAI;

window.quickQuestion =
  quickQuestion;


/* =========================================================
   START APPLICATION
   ========================================================= */

async function startMoneyMind() {

  console.log(
    "MoneyMind AI starting..."
  );


  setupEventListeners();


  if (!supabaseClient) {

    supabaseClient =
      window.supabaseClient || null;
  }


  if (!supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showAuthMessage(
      "Supabase is not connected. Check index.html.",
      true
    );

    showAuthentication();

    return;
  }


  setupAuthListener();

  await checkAuth();


  console.log(
    "MoneyMind AI ready."
  );
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startMoneyMind
  );

} else {

  startMoneyMind();
}
```

