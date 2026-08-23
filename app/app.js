/* =========================================================
   MONEYMIND AI - APP.JS
   Clean replacement
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

let supabaseClient = null;


/* =========================================================
   SUPABASE
   ========================================================= */

function getSupabaseClient() {

  if (window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    return supabaseClient;
  }

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    supabaseClient = window.supabase.createClient(
      "https://pgbetpprhyrplrzxjzvb.supabase.co",
      "sb_publishable_zLKUr9LyfrZCMNv8obdY3A_Z46AgwB8"
    );

    window.supabaseClient = supabaseClient;

    return supabaseClient;
  }

  console.error("Supabase client not found.");

  return null;
}


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function showElement(element) {

  if (!element) return;

  element.classList.remove("hidden");
}


function hideElement(element) {

  if (!element) return;

  element.classList.add("hidden");
}


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

function showAuthMessage(message, type = "") {

  const element = $("authMessage");

  if (!element) return;

  element.textContent = message;

  element.className = "auth-message";

  if (type) {
    element.classList.add(type);
  }
}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

  const loginForm = $("loginForm");
  const signupForm = $("signupForm");

  if (loginForm) {
    loginForm.classList.remove("hidden");
  }

  if (signupForm) {
    signupForm.classList.add("hidden");
  }

  showAuthMessage("");
}


/* =========================================================
   SHOW SIGNUP
   ========================================================= */

function showSignup() {

  const loginForm = $("loginForm");
  const signupForm = $("signupForm");

  if (loginForm) {
    loginForm.classList.add("hidden");
  }

  if (signupForm) {
    signupForm.classList.remove("hidden");
  }

  showAuthMessage("");
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser() {

  const emailElement = $("loginEmail");
  const passwordElement = $("loginPassword");

  if (!emailElement || !passwordElement) {
    console.error("Login fields not found.");
    return;
  }

  const email = emailElement.value.trim();
  const password = passwordElement.value;

  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password.",
      "error"
    );

    return;
  }

  const client = getSupabaseClient();

  if (!client) {

    showAuthMessage(
      "Authentication service is unavailable.",
      "error"
    );

    return;
  }

  showAuthMessage("Logging in...");

  try {

    const result =
      await client.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (result.error) {
      throw result.error;
    }

    currentUser = result.data.user;

    console.log(
      "Logged in:",
      currentUser ? currentUser.email : email
    );

    showApplication(currentUser);

  } catch (error) {

    console.error("Login error:", error);

    let message = "Login failed.";

    if (error && error.message) {
      message = error.message;
    }

    showAuthMessage(message, "error");
  }
}


/* =========================================================
   SIGNUP
   ========================================================= */

async function signupUser() {

  const emailElement = $("signupEmail");
  const passwordElement = $("signupPassword");

  if (!emailElement || !passwordElement) {
    console.error("Signup fields not found.");
    return;
  }

  const email = emailElement.value.trim();
  const password = passwordElement.value;

  if (!email || !password) {

    showAuthMessage(
      "Please enter an email and password.",
      "error"
    );

    return;
  }

  if (password.length < 6) {

    showAuthMessage(
      "Password must contain at least 6 characters.",
      "error"
    );

    return;
  }

  const client = getSupabaseClient();

  if (!client) {

    showAuthMessage(
      "Authentication service is unavailable.",
      "error"
    );

    return;
  }

  showAuthMessage("Creating your account...");

  try {

    const result =
      await client.auth.signUp({
        email: email,
        password: password
      });

    if (result.error) {
      throw result.error;
    }

    if (result.data.session) {

      currentUser = result.data.user;

      showApplication(currentUser);

      return;
    }

    showAuthMessage(
      "Account created. Please check your email to confirm your account.",
      "success"
    );

  } catch (error) {

    console.error("Signup error:", error);

    showAuthMessage(
      error && error.message
        ? error.message
        : "Unable to create account.",
      "error"
    );
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  const client = getSupabaseClient();

  try {

    if (client) {
      const result = await client.auth.signOut();

      if (result.error) {
        throw result.error;
      }
    }

  } catch (error) {

    console.error("Logout error:", error);
  }

  currentUser = null;

  transactions = [];
  goals = [];
  investments = [];

  showAuthentication();
}


/* =========================================================
   SHOW APPLICATION
   ========================================================= */

function showApplication(user) {

  currentUser = user || currentUser;

  const authScreen = $("authScreen");
  const app = $("app");

  if (authScreen) {
    authScreen.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  const userEmail = $("userEmail");

  if (userEmail) {

    userEmail.textContent =
      currentUser && currentUser.email
        ? currentUser.email
        : "";
  }

  console.log(
    "Logged in:",
    currentUser ? currentUser.email : "Unknown user"
  );

  loadUserData();

  showSection("dashboard");
}


/* =========================================================
   SHOW AUTHENTICATION
   ========================================================= */

function showAuthentication() {

  const authScreen = $("authScreen");
  const app = $("app");

  if (authScreen) {
    authScreen.classList.remove("hidden");
  }

  if (app) {
    app.classList.add("hidden");
  }

  showLogin();
}


/* =========================================================
   CHECK AUTH
   ========================================================= */

async function checkAuth() {

  const client = getSupabaseClient();

  if (!client) {

    console.error(
      "Supabase client unavailable."
    );

    showAuthentication();

    return;
  }

  try {

    const result =
      await client.auth.getSession();

    if (result.error) {
      throw result.error;
    }

    const session = result.data.session;

    if (session && session.user) {

      currentUser = session.user;

      console.log(
        "Logged in:",
        currentUser.email
      );

      showApplication(currentUser);

    } else {

      console.log("No active session.");

      showAuthentication();
    }

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    showAuthentication();
  }
}


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

function setupAuthListener() {

  const client = getSupabaseClient();

  if (!client) return;

  client.auth.onAuthStateChange(
    function(event, session) {

      console.log(
        "Auth event:",
        event
      );

      if (
        session &&
        session.user &&
        (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION"
        )
      ) {

        currentUser = session.user;

        showApplication(currentUser);

      }

      if (event === "SIGNED_OUT") {

        currentUser = null;

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
      "mobileMenu element not found."
    );

    return;
  }

  const isOpen =
    menu.classList.contains("open");

  if (isOpen) {

    menu.classList.remove("open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

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

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

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


/* =========================================================
   CLOSE MENU
   ========================================================= */

function closeMenu() {

  const menu = $("mobileMenu");
  const button = $("menuButton");

  if (menu) {

    menu.classList.remove("open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );
  }

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
   SHOW SECTION
   ========================================================= */

function showSection(sectionId) {

  if (!sectionId) return;

  console.log(
    "Opening section:",
    sectionId
  );

  const sections =
    document.querySelectorAll(".section");

  sections.forEach(function(section) {

    section.classList.remove("active");
  });

  const target =
    $(sectionId);

  if (!target) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }

  target.classList.add("active");

  const navItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );

  navItems.forEach(function(item) {

    item.classList.remove("active");

    if (
      item.getAttribute("data-section") ===
      sectionId
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
}


function closeModal(id) {

  const modal = $(id);

  if (!modal) return;

  modal.classList.remove("open");
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
   NUMBER FORMAT
   ========================================================= */

function formatMoney(value) {

  const amount =
    Number(value) || 0;

  return (
    "₦" +
    amount.toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    )
  );
}


/* =========================================================
   LOCAL STORAGE KEY
   ========================================================= */

function getStorageKey(type) {

  const userId =
    currentUser && currentUser.id
      ? currentUser.id
      : "guest";

  return (
    "moneymind_" +
    type +
    "_" +
    userId
  );
}


/* =========================================================
   LOAD USER DATA
   ========================================================= */

function loadUserData() {

  if (!currentUser) return;

  try {

    const savedTransactions =
      localStorage.getItem(
        getStorageKey("transactions")
      );

    const savedGoals =
      localStorage.getItem(
        getStorageKey("goals")
      );

    const savedInvestments =
      localStorage.getItem(
        getStorageKey("investments")
      );

    transactions =
      savedTransactions
        ? JSON.parse(savedTransactions)
        : [];

    goals =
      savedGoals
        ? JSON.parse(savedGoals)
        : [];

    investments =
      savedInvestments
        ? JSON.parse(savedInvestments)
        : [];

  } catch (error) {

    console.error(
      "Unable to load saved data:",
      error
    );

    transactions = [];
    goals = [];
    investments = [];
  }

  updateDashboard();
  renderTransactions();
  renderGoals();
  renderInvestments();
  updateAIData();
}


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveUserData() {

  if (!currentUser) return;

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

    console.error(
      "Unable to save data:",
      error
    );
  }
}


/* =========================================================
   ADD TRANSACTION
   ========================================================= */

function addTransaction() {

  const type =
    $("transactionType")?.value;

  const description =
    $("transactionDescription")?.value.trim();

  const amount =
    Number(
      $("transactionAmount")?.value
    );

  const category =
    $("transactionCategory")?.value;

  if (!description) {

    alert(
      "Please enter a transaction description."
    );

    return;
  }

  if (!amount || amount <= 0) {

    alert(
      "Please enter a valid amount."
    );

    return;
  }

  const transaction = {

    id: Date.now(),

    type: type || "expense",

    description: description,

    amount: amount,

    category: category || "Other",

    date: new Date().toISOString()
  };

  transactions.unshift(transaction);

  saveUserData();

  clearTransactionForm();

  closeModal("transactionModal");

  updateDashboard();

  renderTransactions();

  updateAIData();
}


/* =========================================================
   CLEAR TRANSACTION FORM
   ========================================================= */

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


/* =========================================================
   CALCULATE FINANCIAL DATA
   ========================================================= */

function getFinancialSummary() {

  let income = 0;
  let expenses = 0;

  transactions.forEach(function(transaction) {

    const amount =
      Number(transaction.amount) || 0;

    if (transaction.type === "income") {

      income += amount;

    } else {

      expenses += amount;
    }
  });

  const balance =
    income - expenses;

  const savingsRate =
    income > 0
      ? ((balance / income) * 100)
      : 0;

  let invested = 0;
  let currentInvestmentValue = 0;

  investments.forEach(function(investment) {

    invested +=
      Number(investment.amount) || 0;

    currentInvestmentValue +=
      Number(investment.currentValue) || 0;
  });

  const investmentGain =
    currentInvestmentValue - invested;

  return {

    income,
    expenses,
    balance,
    savingsRate,
    invested,
    currentInvestmentValue,
    investmentGain
  };
}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {

  const summary =
    getFinancialSummary();

  if ($("totalIncome")) {

    $("totalIncome").textContent =
      formatMoney(summary.income);
  }

  if ($("totalExpenses")) {

    $("totalExpenses").textContent =
      formatMoney(summary.expenses);
  }

  if ($("balance")) {

    $("balance").textContent =
      formatMoney(summary.balance);
  }

  if ($("dashboardSavingsRate")) {

    $("dashboardSavingsRate").textContent =
      Math.round(summary.savingsRate) + "%";
  }

  updateFinancialHealth(summary);

  renderRecentTransactions();

  updatePersonalInsight(summary);
}


/* =========================================================
   FINANCIAL HEALTH
   ========================================================= */

function updateFinancialHealth(summary) {

  let score = 0;
  let title = "Let's get started";
  let message =
    "Add your income and expenses to see your financial health.";

  if (summary.income > 0) {

    if (summary.balance > 0) {

      score = 70;

      if (summary.savingsRate >= 20) {

        score = 90;

        title = "Excellent financial position";

        message =
          "You are keeping a healthy portion of your income. Keep building your savings and investments.";

      } else if (summary.savingsRate >= 10) {

        score = 80;

        title = "Good financial position";

        message =
          "You are spending less than you earn. Try increasing your savings rate gradually.";

      } else {

        title = "Positive but needs improvement";

        message =
          "You have a positive balance, but there is room to increase your savings.";
      }

    } else {

      score = 30;

      title = "Spending needs attention";

      message =
        "Your expenses are currently equal to or higher than your income. Review your spending.";
    }
  }

  if ($("healthScore")) {

    $("healthScore").textContent =
      score + "%";
  }

  if ($("healthTitle")) {

    $("healthTitle").textContent =
      title;
  }

  if ($("healthMessage")) {

    $("healthMessage").textContent =
      message;
  }
}


/* =========================================================
   RECENT TRANSACTIONS
   ========================================================= */

function renderRecentTransactions() {

  const container =
    $("recentTransactions");

  if (!container) return;

  const recent =
    transactions.slice(0, 5);

  if (!recent.length) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }

  container.innerHTML =
    recent
      .map(createTransactionHTML)
      .join("");
}


/* =========================================================
   ALL TRANSACTIONS
   ========================================================= */

function renderTransactions() {

  const container =
    $("allTransactions");

  if (!container) return;

  if (!transactions.length) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }

  container.innerHTML =
    transactions
      .map(createTransactionHTML)
      .join("");
}


/* =========================================================
   TRANSACTION HTML
   ========================================================= */

function createTransactionHTML(transaction) {

  const income =
    transaction.type === "income";

  const sign =
    income ? "+" : "-";

  const date =
    new Date(transaction.date)
      .toLocaleDateString(
        "en-NG"
      );

  return `
    <div class="transaction-item">

      <div class="transaction-info">

        <strong>
          ${escapeHTML(transaction.description)}
        </strong>

        <span>
          ${escapeHTML(transaction.category || "Other")}
          · ${date}
        </span>

      </div>

      <div class="transaction-amount ${income ? "income" : "expense"}">
        ${sign}${formatMoney(transaction.amount)}
      </div>

    </div>
  `;
}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

function deleteTransaction(id) {

  transactions =
    transactions.filter(function(item) {

      return item.id !== id;
    });

  saveUserData();

  updateDashboard();
  renderTransactions();
  updateAIData();
}


/* =========================================================
   ADD GOAL
   ========================================================= */

function addGoal() {

  const name =
    $("goalName")?.value.trim();

  const target =
    Number(
      $("goalTarget")?.value
    );

  const saved =
    Number(
      $("goalSaved")?.value
    ) || 0;

  if (!name) {

    alert(
      "Please enter a goal name."
    );

    return;
  }

  if (!target || target <= 0) {

    alert(
      "Please enter a valid target amount."
    );

    return;
  }

  if (saved < 0) {

    alert(
      "Saved amount cannot be negative."
    );

    return;
  }

  const goal = {

    id: Date.now(),

    name: name,

    target: target,

    saved: saved,

    date: new Date().toISOString()
  };

  goals.unshift(goal);

  saveUserData();

  if ($("goalName")) {
    $("goalName").value = "";
  }

  if ($("goalTarget")) {
    $("goalTarget").value = "";
  }

  if ($("goalSaved")) {
    $("goalSaved").value = "";
  }

  closeModal("goalModal");

  renderGoals();

  updateDashboard();
}


/* =========================================================
   RENDER GOALS
   ========================================================= */

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
    goals
      .map(function(goal) {

        const target =
          Number(goal.target) || 0;

        const saved =
          Number(goal.saved) || 0;

        const percentage =
          target > 0
            ? Math.min(
                100,
                (saved / target) * 100
              )
            : 0;

        return `
          <div class="goal-card">

            <h3>
              ${escapeHTML(goal.name)}
            </h3>

            <p>
              ${formatMoney(saved)}
              of
              ${formatMoney(target)}
            </p>

            <div class="progress">
              <div
                class="progress-bar"
                style="width:${percentage}%"
              ></div>
            </div>

            <strong>
              ${Math.round(percentage)}%
            </strong>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   DELETE GOAL
   ========================================================= */

function deleteGoal(id) {

  goals =
    goals.filter(function(goal) {

      return goal.id !== id;
    });

  saveUserData();

  renderGoals();
}


/* =========================================================
   ADD INVESTMENT
   ========================================================= */

function addInvestment() {

  const name =
    $("investmentName")?.value.trim();

  const amount =
    Number(
      $("investmentAmount")?.value
    );

  const currentValue =
    Number(
      $("investmentValue")?.value
    );

  if (!name) {

    alert(
      "Please enter an investment name."
    );

    return;
  }

  if (!amount || amount <= 0) {

    alert(
      "Please enter the amount invested."
    );

    return;
  }

  if (
    Number.isNaN(currentValue) ||
    currentValue < 0
  ) {

    alert(
      "Please enter the current value."
    );

    return;
  }

  const investment = {

    id: Date.now(),

    name: name,

    amount: amount,

    currentValue: currentValue,

    date: new Date().toISOString()
  };

  investments.unshift(investment);

  saveUserData();

  if ($("investmentName")) {
    $("investmentName").value = "";
  }

  if ($("investmentAmount")) {
    $("investmentAmount").value = "";
  }

  if ($("investmentValue")) {
    $("investmentValue").value = "";
  }

  closeModal("investmentModal");

  renderInvestments();

  updateDashboard();

  updateAIData();
}


/* =========================================================
   RENDER INVESTMENTS
   ========================================================= */

function renderInvestments() {

  const container =
    $("investmentsList");

  if (!container) return;

  const summary =
    getFinancialSummary();

  if ($("totalInvested")) {

    $("totalInvested").textContent =
      formatMoney(summary.invested);
  }

  if ($("investmentValue")) {

    $("investmentValue").textContent =
      formatMoney(
        summary.currentInvestmentValue
      );
  }

  if ($("investmentGain")) {

    const gain =
      summary.investmentGain;

    $("investmentGain").textContent =
      (gain >= 0 ? "+" : "") +
      formatMoney(gain);
  }

  if (!investments.length) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }

  container.innerHTML =
    investments
      .map(function(investment) {

        const gain =
          (
            Number(investment.currentValue) ||
            0
          ) -
          (
            Number(investment.amount) ||
            0
          );

        const percentage =
          Number(investment.amount) > 0
            ? (
                gain /
                Number(investment.amount)
              ) * 100
            : 0;

        return `
          <div class="investment-card">

            <h3>
              ${escapeHTML(investment.name)}
            </h3>

            <p>
              Invested:
              ${formatMoney(investment.amount)}
            </p>

            <p>
              Current value:
              ${formatMoney(investment.currentValue)}
            </p>

            <strong>
              ${gain >= 0 ? "+" : ""}
              ${formatMoney(gain)}
              (${percentage.toFixed(1)}%)
            </strong>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   DELETE INVESTMENT
   ========================================================= */

function deleteInvestment(id) {

  investments =
    investments.filter(function(item) {

      return item.id !== id;
    });

  saveUserData();

  renderInvestments();

  updateDashboard();

  updateAIData();
}


/* =========================================================
   PERSONAL INSIGHT
   ========================================================= */

function updatePersonalInsight(summary) {

  const element =
    $("personalInsight");

  if (!element) return;

  if (summary.income === 0) {

    element.textContent =
      "Add your income and expenses to receive a personalized financial insight.";

    return;
  }

  if (summary.balance < 0) {

    element.textContent =
      "Your expenses are currently higher than your income. Focus first on reducing non-essential spending and identifying your largest expense categories.";

    return;
  }

  if (summary.savingsRate < 10) {

    element.textContent =
      "You currently have a positive balance, but your savings rate is relatively low. Consider setting aside a fixed percentage of every income payment.";

    return;
  }

  if (summary.savingsRate < 20) {

    element.textContent =
      "You are building a positive financial position. Increasing your savings rate toward 20% could strengthen your financial cushion.";

    return;
  }

  element.textContent =
    "Your current numbers show a strong savings position. Continue building your emergency fund while investing consistently for long-term growth.";
}


/* =========================================================
   AI DATA
   ========================================================= */

function updateAIData() {

  const summary =
    getFinancialSummary();

  if ($("aiIncome")) {

    $("aiIncome").textContent =
      formatMoney(summary.income);
  }

  if ($("aiExpenses")) {

    $("aiExpenses").textContent =
      formatMoney(summary.expenses);
  }

  if ($("aiBalance")) {

    $("aiBalance").textContent =
      formatMoney(summary.balance);
  }

  if ($("aiSavingsRate")) {

    $("aiSavingsRate").textContent =
      Math.round(summary.savingsRate) +
      "%";
  }
}


/* =========================================================
   QUICK QUESTION
   ========================================================= */

function quickQuestion(question) {

  const input =
    $("aiInput");

  if (!input) return;

  input.value = question;

  askAI();
}


/* =========================================================
   AI ASSISTANT
   ========================================================= */

function askAI() {

  const input =
    $("aiInput");

  const chat =
    $("chatMessages");

  if (!input || !chat) return;

  const question =
    input.value.trim();

  if (!question) return;

  const summary =
    getFinancialSummary();

  addChatMessage(
    question,
    "user"
  );

  input.value = "";

  const answer =
    generateFinancialAdvice(
      question,
      summary
    );

  setTimeout(function() {

    addChatMessage(
      answer,
      "ai"
    );

  }, 300);
}


/* =========================================================
   ADD CHAT MESSAGE
   ========================================================= */

function addChatMessage(text, type) {

  const chat =
    $("chatMessages");

  if (!chat) return;

  const message =
    document.createElement("div");

  message.className =
    "message " +
    (type === "user" ? "user" : "ai");

  message.textContent = text;

  chat.appendChild(message);

  chat.scrollTop =
    chat.scrollHeight;
}


/* =========================================================
   FINANCIAL ADVICE ENGINE
   ========================================================= */

function generateFinancialAdvice(
  question,
  summary
) {

  const q =
    question.toLowerCase();

  if (
    q.includes("analyze") ||
    q.includes("financial situation") ||
    q.includes("financial position")
  ) {

    return (
      "Based on your current data: " +
      "income is " +
      formatMoney(summary.income) +
      ", expenses are " +
      formatMoney(summary.expenses) +
      ", and your balance is " +
      formatMoney(summary.balance) +
      ". Your savings rate is approximately " +
      Math.round(summary.savingsRate) +
      "%. " +
      (
        summary.balance >= 0
          ? "Your next priority should be strengthening savings and investing consistently."
          : "Your first priority should be bringing expenses below income."
      )
    );
  }

  if (
    q.includes("reduce") &&
    q.includes("expense")
  ) {

    if (summary.expenses === 0) {

      return (
        "I don't have enough expense data yet. " +
        "Start adding your spending transactions so I can identify where your money is going."
      );
    }

    return (
      "Your recorded expenses total " +
      formatMoney(summary.expenses) +
      ". Start by identifying your three largest spending categories. " +
      "Cut or reduce non-essential expenses first rather than essential needs."
    );
  }

  if (
    q.includes("save") ||
    q.includes("saving")
  ) {

    if (summary.income <= 0) {

      return (
        "Add your income first. Once I know your income and expenses, I can calculate a practical monthly savings target."
      );
    }

    const recommended =
      summary.income * 0.2;

    return (
      "A useful starting target is around 20% of income when affordable. " +
      "Based on your recorded income, that would be approximately " +
      formatMoney(recommended) +
      " per month. Adjust this based on your actual obligations and goals."
    );
  }

  if (
    q.includes("budget")
  ) {

    return (
      "Start with three buckets: essential expenses, financial goals, and flexible spending. " +
      "A simple starting framework is 50% needs, 30% flexible spending, and 20% savings or investments. " +
      "Treat these percentages as guidelines rather than strict rules."
    );
  }

  if (
    q.includes("investment") ||
    q.includes("invest")
  ) {

    if (summary.invested === 0) {

      return (
        "You have not recorded any investments yet. " +
        "Before investing, build an emergency reserve and make sure high-interest debt is under control. " +
        "Then consider diversified long-term investments that match your risk tolerance."
      );
    }

    return (
      "You currently have " +
      formatMoney(summary.invested) +
      " recorded as invested, with a current value of " +
      formatMoney(summary.currentInvestmentValue) +
      ". " +
      "Your recorded investment gain/loss is " +
      formatMoney(summary.investmentGain) +
      ". " +
      "Focus on diversification, fees, time horizon and risk rather than chasing short-term returns."
    );
  }

  return (
    "I can help you analyze your income, expenses, savings and investments. " +
    "Try asking: 'Analyze my financial situation', " +
    "'How can I reduce my expenses?', or " +
    "'How much should I save each month?'"
  );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
      function(event) {

        event.stopPropagation();

        toggleMenu();
      }
    );
  }


  const navItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );

  navItems.forEach(function(item) {

    item.addEventListener(
      "click",
      function() {

        const section =
          item.getAttribute(
            "data-section"
          );

        showSection(section);
      }
    );
  });


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


  const logoutButton =
    $("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logoutUser
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


  const saveTransaction =
    $("saveTransactionButton");

  if (saveTransaction) {

    saveTransaction.addEventListener(
      "click",
      addTransaction
    );
  }


  const saveGoal =
    $("saveGoalButton");

  if (saveGoal) {

    saveGoal.addEventListener(
      "click",
      addGoal
    );
  }


  const saveInvestment =
    $("saveInvestmentButton");

  if (saveInvestment) {

    saveInvestment.addEventListener(
      "click",
      addInvestment
    );
  }


  const sendAI =
    $("sendAIButton");

  if (sendAI) {

    sendAI.addEventListener(
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
      ".suggestions button[data-question]"
    );

  suggestions.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const question =
          button.getAttribute(
            "data-question"
          );

        quickQuestion(question);
      }
    );
  });


  const closeButtons =
    document.querySelectorAll(
      "[data-close]"
    );

  closeButtons.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        closeModal(
          button.getAttribute(
            "data-close"
          )
        );
      }
    );
  });


  document.addEventListener(
    "click",
    function(event) {

      const menu =
        $("mobileMenu");

      const button =
        $("menuButton");

      if (!menu || !button) return;

      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !button.contains(event.target)
      ) {

        closeMenu();
      }
    }
  );


  document.querySelectorAll(
    ".modal"
  ).forEach(function(modal) {

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
  });
}


/* =========================================================
   EXPOSE FUNCTIONS TO WINDOW
   IMPORTANT FOR HTML onclick=""
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

window.deleteTransaction =
  deleteTransaction;

window.deleteGoal =
  deleteGoal;

window.deleteInvestment =
  deleteInvestment;

window.askAI =
  askAI;

window.quickQuestion =
  quickQuestion;


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeMoneyMind() {

  console.log(
    "MoneyMind AI starting..."
  );

  getSupabaseClient();

  setupEventListeners();

  setupAuthListener();

  await checkAuth();

  console.log(
    "MoneyMind AI ready."
  );
}


/* =========================================================
   START APP
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeMoneyMind
  );

} else {

  initializeMoneyMind();
}
```
