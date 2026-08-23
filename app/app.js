```javascript
"use strict";

/* =========================================================
   MONEY MIND AI
   Complete application JavaScript
   ========================================================= */

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
    return window.supabaseClient;
  }

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    window.supabaseClient =
      window.supabase.createClient(
        "https://pgbetpprhyrplrzxjzvb.supabase.co",
        "sb_publishable_zLKUr9LyfrZCMNv8obdY3A_Z46AgwB8"
      );

    return window.supabaseClient;
  }

  return null;
}

supabaseClient = getSupabaseClient();


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function formatMoney(amount) {

  const value = Number(amount) || 0;

  return "₦" + value.toLocaleString("en-NG", {
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


function showAuthMessage(message, type = "") {

  const element = $("authMessage");

  if (!element) return;

  element.textContent = message;
  element.className =
    "auth-message " + type;
}


function hideElement(element) {

  if (element) {
    element.classList.add("hidden");
  }
}


function showElement(element) {

  if (element) {
    element.classList.remove("hidden");
  }
}


/* =========================================================
   AUTH SCREEN
========================================================= */

function showLogin() {

  const login = $("loginForm");
  const signup = $("signupForm");

  showElement(login);
  hideElement(signup);

  showAuthMessage("");
}


function showSignup() {

  const login = $("loginForm");
  const signup = $("signupForm");

  hideElement(login);
  showElement(signup);

  showAuthMessage("");
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser() {

  const emailInput = $("loginEmail");
  const passwordInput = $("loginPassword");

  if (!emailInput || !passwordInput) {
    console.error("Login fields not found.");
    return;
  }

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password.",
      "error"
    );

    return;
  }

  if (!supabaseClient) {

    supabaseClient =
      getSupabaseClient();
  }

  if (!supabaseClient) {

    showAuthMessage(
      "Authentication service is unavailable.",
      "error"
    );

    console.error(
      "Supabase client not found."
    );

    return;
  }

  showAuthMessage(
    "Logging in..."
  );

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    currentUser =
      data.user || null;

    if (currentUser) {

      console.log(
        "Logged in:",
        currentUser.email
      );

      await showApplication(
        currentUser
      );

      showAuthMessage("");

    }

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    showAuthMessage(
      error.message ||
      "Login failed. Please check your details.",
      "error"
    );
  }
}


/* =========================================================
   SIGN UP
========================================================= */

async function signupUser() {

  const emailInput = $("signupEmail");
  const passwordInput = $("signupPassword");

  if (!emailInput || !passwordInput) {
    console.error("Signup fields not found.");
    return;
  }

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

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

  if (!supabaseClient) {
    supabaseClient =
      getSupabaseClient();
  }

  if (!supabaseClient) {

    showAuthMessage(
      "Authentication service is unavailable.",
      "error"
    );

    return;
  }

  showAuthMessage(
    "Creating your account..."
  );

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({
        email,
        password
      });

    if (error) {
      throw error;
    }

    if (data.session && data.user) {

      currentUser =
        data.user;

      await showApplication(
        currentUser
      );

      showAuthMessage("");

    } else {

      showAuthMessage(
        "Account created. Check your email if confirmation is required.",
        "success"
      );
    }

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to create account.",
      "error"
    );
  }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

  try {

    if (supabaseClient) {

      const {
        error
      } =
      await supabaseClient.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );
      }
    }

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  } finally {

    currentUser = null;

    transactions = [];
    goals = [];
    investments = [];

    const app =
      $("app");

    const auth =
      $("authScreen");

    hideElement(app);
    showElement(auth);

    showLogin();

    closeMenu();

    console.log(
      "Logged out."
    );
  }
}


/* =========================================================
   AUTH CHECK
========================================================= */

async function checkAuth() {

  if (!supabaseClient) {

    supabaseClient =
      getSupabaseClient();
  }

  if (!supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showElement(
      $("authScreen")
    );

    hideElement(
      $("app")
    );

    return;
  }

  try {

    const {
      data,
      error
    } =
    await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (
      data &&
      data.session &&
      data.session.user
    ) {

      currentUser =
        data.session.user;

      console.log(
        "Logged in:",
        currentUser.email
      );

      await showApplication(
        currentUser
      );

    } else {

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
   SHOW APPLICATION
========================================================= */

async function showApplication(user) {

  currentUser =
    user || currentUser;

  const auth =
    $("authScreen");

  const app =
    $("app");

  if (auth) {
    hideElement(auth);
  }

  if (app) {
    showElement(app);
  }

  const userEmail =
    $("userEmail");

  if (
    userEmail &&
    currentUser
  ) {

    userEmail.textContent =
      currentUser.email || "";
  }

  await loadUserData();

  updateDashboard();

  console.log(
    "MoneyMind AI ready."
  );
}


/* =========================================================
   SHOW AUTHENTICATION
========================================================= */

function showAuthentication() {

  const auth =
    $("authScreen");

  const app =
    $("app");

  showElement(auth);
  hideElement(app);

  currentUser = null;

  showLogin();
}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMenu() {

  const menu =
    $("mobileMenu");

  const button =
    $("menuButton");

  if (!menu) {

    console.error(
      "mobileMenu not found."
    );

    return;
  }

  const isOpen =
    menu.classList.contains("open");

  if (isOpen) {

    closeMenu();

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

    console.log(
      "Menu opened."
    );
  }
}


function closeMenu() {

  const menu =
    $("mobileMenu");

  const button =
    $("menuButton");

  if (menu) {

    menu.classList.remove(
      "open"
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
   NAVIGATION
========================================================= */

function showSection(sectionId) {

  if (!sectionId) return;

  const sections =
    document.querySelectorAll(
      ".section"
    );

  sections.forEach(
    section => {

      section.classList.remove(
        "active"
      );
    }
  );

  const target =
    $(sectionId);

  if (!target) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }

  target.classList.add(
    "active"
  );

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.section === sectionId
      );
    }
  );

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
    updateAISnapshot();
  }

  console.log(
    "Opening section:",
    sectionId
  );
}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

  const modal =
    $(id);

  if (!modal) return;

  modal.classList.add(
    "open"
  );

  modal.style.display =
    "flex";
}


function closeModal(id) {

  const modal =
    $(id);

  if (!modal) return;

  modal.classList.remove(
    "open"
  );

  modal.style.display =
    "none";
}


function openTransactionModal() {

  openModal(
    "transactionModal"
  );
}


function openGoalModal() {

  openModal(
    "goalModal"
  );
}


function openInvestmentModal() {

  openModal(
    "investmentModal"
  );
}


/* =========================================================
   TRANSACTIONS
========================================================= */

async function addTransaction() {

  if (!currentUser) {

    showAuthMessage(
      "Please log in first.",
      "error"
    );

    return;
  }

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

  if (
    !description ||
    !amount ||
    amount <= 0
  ) {

    alert(
      "Please enter a description and valid amount."
    );

    return;
  }

  const transaction = {

    id:
      crypto.randomUUID(),

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

  await saveUserData();

  updateDashboard();

  renderTransactions();

  closeModal(
    "transactionModal"
  );

  clearTransactionForm();
}


function clearTransactionForm() {

  if ($("transactionDescription")) {
    $("transactionDescription").value = "";
  }

  if ($("transactionAmount")) {
    $("transactionAmount").value = "";
  }

  if ($("transactionType")) {
    $("transactionType").value =
      "income";
  }

  if ($("transactionCategory")) {
    $("transactionCategory").value =
      "Salary";
  }
}


function renderTransactions() {

  const all =
    $("allTransactions");

  const recent =
    $("recentTransactions");

  if (transactions.length === 0) {

    const empty =
      `<p class="empty">No transactions yet.</p>`;

    if (all) {
      all.innerHTML =
        empty;
    }

    if (recent) {
      recent.innerHTML =
        empty;
    }

    return;
  }

  const html =
    transactions
      .map(transaction => {

        const sign =
          transaction.type === "income"
            ? "+"
            : "-";

        return `
          <div class="transaction-item">

            <div>
              <strong>
                ${escapeHTML(transaction.description)}
              </strong>

              <small>
                ${escapeHTML(transaction.category || "Other")}
              </small>
            </div>

            <strong class="${
              transaction.type === "income"
                ? "income"
                : "expense"
            }">
              ${sign}${formatMoney(transaction.amount)}
            </strong>

          </div>
        `;

      })
      .join("");

  if (all) {
    all.innerHTML =
      html;
  }

  if (recent) {

    recent.innerHTML =
      transactions
        .slice(0, 5)
        .map(transaction => {

          const sign =
            transaction.type === "income"
              ? "+"
              : "-";

          return `
            <div class="transaction-item">

              <div>
                <strong>
                  ${escapeHTML(transaction.description)}
                </strong>

                <small>
                  ${escapeHTML(transaction.category || "Other")}
                </small>
              </div>

              <strong class="${
                transaction.type === "income"
                  ? "income"
                  : "expense"
              }">
                ${sign}${formatMoney(transaction.amount)}
              </strong>

            </div>
          `;

        })
        .join("");
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function calculateTotals() {

  let income = 0;
  let expenses = 0;

  transactions.forEach(
    transaction => {

      const amount =
        Number(transaction.amount) || 0;

      if (
        transaction.type === "income"
      ) {

        income += amount;

      } else {

        expenses += amount;
      }
    }
  );

  return {
    income,
    expenses,
    balance:
      income - expenses
  };
}


function updateDashboard() {

  const totals =
    calculateTotals();

  const income =
    totals.income;

  const expenses =
    totals.expenses;

  const balance =
    totals.balance;

  const savingsRate =
    income > 0
      ? ((balance / income) * 100)
      : 0;

  const investmentTotal =
    investments.reduce(
      (sum, investment) =>
        sum +
        (Number(investment.currentValue) || 0),
      0
    );

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
    ).toFixed(1) + "%"
  );

  setText(
    "totalInvestments",
    formatMoney(
      investmentTotal
    )
  );

  calculateFinancialHealth(
    income,
    expenses,
    balance
  );

  renderTransactions();

  updateAISnapshot();

  updatePersonalInsight();
}


function setText(id, value) {

  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }
}


/* =========================================================
   FINANCIAL HEALTH
========================================================= */

function calculateFinancialHealth(
  income,
  expenses,
  balance
) {

  let score = 0;

  if (income > 0) {
    score += 25;
  }

  if (
    income > 0 &&
    expenses < income
  ) {
    score += 30;
  }

  if (
    income > 0 &&
    balance > 0
  ) {
    score += 25;
  }

  if (
    goals.length > 0
  ) {
    score += 10;
  }

  if (
    investments.length > 0
  ) {
    score += 10;
  }

  score =
    Math.min(
      100,
      Math.max(
        0,
        score
      )
    );

  setText(
    "healthScore",
    score + "%"
  );

  let title =
    "Let's get started";

  let message =
    "Add your income and expenses to see your financial health.";

  if (score >= 80) {

    title =
      "Excellent financial position";

    message =
      "You have a strong foundation. Keep your spending controlled and continue building savings and investments.";

  } else if (score >= 60) {

    title =
      "Good progress";

    message =
      "Your finances are moving in the right direction. Focus on maintaining positive cash flow.";

  } else if (score >= 40) {

    title =
      "Room for improvement";

    message =
      "Review your expenses and create a consistent savings plan.";

  } else if (income > 0) {

    title =
      "Let's strengthen your finances";

    message =
      "Start by tracking expenses and making sure your spending stays below your income.";
  }

  setText(
    "healthTitle",
    title
  );

  setText(
    "healthMessage",
    message
  );
}


/* =========================================================
   SAVINGS GOALS
========================================================= */

async function addGoal() {

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

  if (
    !name ||
    !target ||
    target <= 0
  ) {

    alert(
      "Please enter a goal name and target amount."
    );

    return;
  }

  const goal = {

    id:
      crypto.randomUUID(),

    name,

    target,

    saved,

    created_at:
      new Date().toISOString()
  };

  goals.unshift(
    goal
  );

  await saveUserData();

  renderGoals();

  updateDashboard();

  closeModal(
    "goalModal"
  );

  clearGoalForm();
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

  if (goals.length === 0) {

    container.innerHTML =
      `<p class="empty">No savings goals yet.</p>`;

    setText(
      "goalCount",
      "0"
    );

    return;
  }

  container.innerHTML =
    goals
      .map(goal => {

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
              ${percentage.toFixed(1)}%
            </strong>

          </div>
        `;

      })
      .join("");

  setText(
    "goalCount",
    String(goals.length)
  );
}


/* =========================================================
   INVESTMENTS
========================================================= */

async function addInvestment() {

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

  if (
    !name ||
    !amount ||
    amount <= 0
  ) {

    alert(
      "Please enter an investment name and amount."
    );

    return;
  }

  const investment = {

    id:
      crypto.randomUUID(),

    name,

    amount,

    currentValue:
      Number.isFinite(
        currentValue
      )
        ? currentValue
        : amount,

    created_at:
      new Date().toISOString()
  };

  investments.unshift(
    investment
  );

  await saveUserData();

  renderInvestments();

  updateDashboard();

  closeModal(
    "investmentModal"
  );

  clearInvestmentForm();
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

  if (investments.length === 0) {

    container.innerHTML =
      `<p class="empty">No investments recorded yet.</p>`;

    setText(
      "totalInvested",
      "₦0"
    );

    setText(
      "investmentValue",
      "₦0"
    );

    setText(
      "investmentGain",
      "₦0"
    );

    return;
  }

  let invested = 0;
  let current = 0;

  investments.forEach(
    investment => {

      invested +=
        Number(investment.amount) || 0;

      current +=
        Number(investment.currentValue) || 0;
    }
  );

  const gain =
    current - invested;

  setText(
    "totalInvested",
    formatMoney(invested)
  );

  setText(
    "investmentValue",
    formatMoney(current)
  );

  setText(
    "investmentGain",
    formatMoney(gain)
  );

  container.innerHTML =
    investments
      .map(investment => {

        const amount =
          Number(investment.amount) || 0;

        const value =
          Number(investment.currentValue) || 0;

        const investmentGain =
          value - amount;

        return `
          <div class="investment-card">

            <h3>
              ${escapeHTML(investment.name)}
            </h3>

            <p>
              Invested:
              <strong>
                ${formatMoney(amount)}
              </strong>
            </p>

            <p>
              Current value:
              <strong>
                ${formatMoney(value)}
              </strong>
            </p>

            <p>
              Gain/Loss:
              <strong>
                ${formatMoney(investmentGain)}
              </strong>
            </p>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   AI ASSISTANT
========================================================= */

function updateAISnapshot() {

  const totals =
    calculateTotals();

  const savingsRate =
    totals.income > 0
      ? (
          (totals.balance /
            totals.income) *
          100
        )
      : 0;

  setText(
    "aiIncome",
    formatMoney(
      totals.income
    )
  );

  setText(
    "aiExpenses",
    formatMoney(
      totals.expenses
    )
  );

  setText(
    "aiBalance",
    formatMoney(
      totals.balance
    )
  );

  setText(
    "aiSavingsRate",
    Math.max(
      0,
      savingsRate
    ).toFixed(1) + "%"
  );
}


function updatePersonalInsight() {

  const element =
    $("personalInsight");

  if (!element) return;

  const totals =
    calculateTotals();

  if (
    totals.income === 0 &&
    totals.expenses === 0
  ) {

    element.textContent =
      "Add some transactions and MoneyMind will generate a personalized financial insight.";

    return;
  }

  if (
    totals.expenses >
    totals.income
  ) {

    element.textContent =
      "Your expenses currently exceed your recorded income. Focus on reducing non-essential spending and increasing income where possible.";

    return;
  }

  if (
    totals.income > 0 &&
    totals.balance > 0
  ) {

    const rate =
      (
        totals.balance /
        totals.income
      ) * 100;

    element.textContent =
      `You currently retain approximately ${rate.toFixed(1)}% of your recorded income after expenses. Consider directing part of this surplus toward your savings goals and investments.`;

    return;
  }

  element.textContent =
    "Your income and expenses are currently balanced. Continue tracking your spending so MoneyMind can identify useful patterns.";
}


function quickQuestion(question) {

  const input =
    $("aiInput");

  if (!input) return;

  input.value =
    question;

  askAI();
}


async function askAI() {

  const input =
    $("aiInput");

  const chat =
    $("chatMessages");

  if (!input || !chat) return;

  const question =
    input.value.trim();

  if (!question) return;

  addChatMessage(
    question,
    "user"
  );

  input.value = "";

  const totals =
    calculateTotals();

  const response =
    generateFinancialAdvice(
      question,
      totals
    );

  setTimeout(
    () => {

      addChatMessage(
        response,
        "ai"
      );

    },
    300
  );
}


function addChatMessage(
  message,
  type
) {

  const chat =
    $("chatMessages");

  if (!chat) return;

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "message " + type;

  div.textContent =
    message;

  chat.appendChild(
    div
  );

  chat.scrollTop =
    chat.scrollHeight;
}


function generateFinancialAdvice(
  question,
  totals
) {

  const q =
    question.toLowerCase();

  const income =
    totals.income;

  const expenses =
    totals.expenses;

  const balance =
    totals.balance;

  const rate =
    income > 0
      ? (
          balance /
          income
        ) * 100
      : 0;

  if (
    q.includes("analyze") ||
    q.includes("financial situation")
  ) {

    return `
Your current financial snapshot:

Income: ${formatMoney(income)}
Expenses: ${formatMoney(expenses)}
Balance: ${formatMoney(balance)}
Savings rate: ${Math.max(0, rate).toFixed(1)}%

${
  expenses > income
    ? "Your main priority should be reducing expenses because they currently exceed your recorded income."
    : balance > 0
      ? "You currently have positive cash flow. Consider dividing your surplus between emergency savings, your goals and long-term investments."
      : "Your recorded income and expenses leave little or no surplus. Review your largest spending categories first."
}
    `.trim();
  }


  if (
    q.includes("reduce") &&
    q.includes("expense")
  ) {

    return `
To reduce expenses, start by reviewing your largest recurring costs. Separate essential expenses from discretionary spending, set a monthly spending limit and track every transaction. Your current recorded expenses are ${formatMoney(expenses)}.
    `.trim();
  }


  if (
    q.includes("save") ||
    q.includes("saving")
  ) {

    if (income <= 0) {

      return "Add your income first so MoneyMind can calculate a practical monthly savings target.";
    }

    const suggested =
      Math.max(
        0,
        income * 0.20
      );

    return `
A useful starting target is around 20% of income when your budget allows it. Based on your recorded income of ${formatMoney(income)}, that would be approximately ${formatMoney(suggested)} per month. Adjust this according to your essential expenses and goals.
    `.trim();
  }


  if (
    q.includes("budget")
  ) {

    return `
Start with your actual income, list your essential expenses, assign limits to flexible spending, then create a fixed savings target. Review your budget every month using your transaction history rather than estimates.
    `.trim();
  }


  if (
    q.includes("investment") ||
    q.includes("invest")
  ) {

    return `
Before increasing investments, make sure your essential expenses are covered and you have an emergency reserve. Then consider diversification across assets rather than concentrating your money in one investment.
    `.trim();
  }


  return `
Based on your current recorded finances, you have ${formatMoney(balance)} remaining after ${formatMoney(expenses)} in expenses from ${formatMoney(income)} of income. I recommend tracking your spending consistently and setting a specific savings or investment target.
  `.trim();
}


/* =========================================================
   LOCAL DATA STORAGE
========================================================= */

function getStorageKey() {

  if (!currentUser) {
    return null;
  }

  return (
    "moneymind_" +
    currentUser.id
  );
}


async function loadUserData() {

  if (!currentUser) return;

  const key =
    getStorageKey();

  if (!key) return;

  try {

    const stored =
      localStorage.getItem(
        key
      );

    if (!stored) {

      transactions = [];
      goals = [];
      investments = [];

      return;
    }

    const data =
      JSON.parse(
        stored
      );

    transactions =
      Array.isArray(
        data.transactions
      )
        ? data.transactions
        : [];

    goals =
      Array.isArray(
        data.goals
      )
        ? data.goals
        : [];

    investments =
      Array.isArray(
        data.investments
      )
        ? data.investments
        : [];

  } catch (error) {

    console.error(
      "Could not load saved data:",
      error
    );

    transactions = [];
    goals = [];
    investments = [];
  }
}


async function saveUserData() {

  if (!currentUser) return;

  const key =
    getStorageKey();

  if (!key) return;

  try {

    localStorage.setItem(
      key,
      JSON.stringify({

        transactions,

        goals,

        investments

      })
    );

  } catch (error) {

    console.error(
      "Could not save data:",
      error
    );
  }
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


  document
    .querySelectorAll(
      ".nav-item[data-section]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showSection(
              button.dataset.section
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


  const transactionAdd =
    $("transactionsAddButton");

  if (transactionAdd) {

    transactionAdd.addEventListener(
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


  const viewTransactions =
    $("viewTransactionsButton");

  if (viewTransactions) {

    viewTransactions.addEventListener(
      "click",
      () =>
        showSection(
          "transactions"
        )
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
      event => {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          askAI();
        }
      }
    );
  }


  document
    .querySelectorAll(
      ".suggestions button[data-question]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            quickQuestion(
              button.dataset.question
            );
          }
        );
      }
    );


  document
    .querySelectorAll(
      "[data-close]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            closeModal(
              button.dataset.close
            );
          }
        );
      }
    );


  document
    .querySelectorAll(
      ".modal"
    )
    .forEach(
      modal => {

        modal.addEventListener(
          "click",
          event => {

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
   SUPABASE AUTH LISTENER
========================================================= */

function setupAuthListener() {

  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {

      console.log(
        "Auth event:",
        event
      );

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {

        currentUser =
          session.user;

        console.log(
          "Logged in:",
          currentUser.email
        );

        await showApplication(
          currentUser
        );

      }

      if (
        event === "SIGNED_OUT"
      ) {

        showAuthentication();
      }

    }
  );
}


/* =========================================================
   INITIALIZATION
========================================================= */

async function initMoneyMind() {

  console.log(
    "MoneyMind AI starting..."
  );

  setupEventListeners();

  setupAuthListener();

  await checkAuth();
}


/* =========================================================
   GLOBAL FUNCTIONS
   These make inline onclick calls safe.
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
   START
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initMoneyMind,
    {
      once: true
    }
  );

} else {

  initMoneyMind();
}
```
