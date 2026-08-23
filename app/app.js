```javascript
// ======================================================
// MONEY MIND AI - COMPLETE APP.JS
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const supabaseClient = window.supabaseClient || null;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ======================================================
// DATA STORAGE
// ======================================================

function loadArray(key) {

  try {

    const saved =
      localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    console.warn(
      key + " contains invalid data. Resetting."
    );

    localStorage.removeItem(key);

    return [];

  } catch (error) {

    console.error(
      "Error loading " + key + ":",
      error
    );

    localStorage.removeItem(key);

    return [];
  }
}


let transactions =
  loadArray("mm_transactions");

let goals =
  loadArray("mm_goals");

let investments =
  loadArray("mm_investments");


// ======================================================
// SAVE DATA
// ======================================================

function saveData() {

  try {

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

  } catch (error) {

    console.error(
      "Error saving data:",
      error
    );
  }
}


// ======================================================
// HELPERS
// ======================================================

function formatMoney(amount) {

  const number =
    Number(amount) || 0;

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }
  ).format(number);
}


function formatDate(date) {

  const parsed =
    new Date(date);

  if (
    Number.isNaN(parsed.getTime())
  ) {
    return "";
  }

  return parsed.toLocaleDateString(
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
    String(value ?? "");

  return div.innerHTML;
}


function getElement(id) {

  return document.getElementById(id);
}


// ======================================================
// AUTHENTICATION DISPLAY
// ======================================================

function showApplication(user) {

  const authScreen =
    getElement("authScreen");

  if (authScreen) {
    authScreen.style.display = "none";
  }

  console.log(
    "Logged in:",
    user?.email || "Unknown user"
  );
}


function showAuthentication() {

  const authScreen =
    getElement("authScreen");

  if (authScreen) {
    authScreen.style.display = "flex";
  }
}


function showAuthMessage(message) {

  const messageElement =
    getElement("authMessage");

  if (messageElement) {
    messageElement.textContent =
      message;
  }
}


// ======================================================
// CHECK AUTHENTICATION
// ======================================================

async function checkAuth() {

  console.log(
    "Checking authentication..."
  );

  if (!supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showAuthentication();

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
      data.session &&
      data.session.user
    ) {

      showApplication(
        data.session.user
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


// ======================================================
// SIGN UP
// ======================================================

async function signupUser() {

  const email =
    getElement("signupEmail")
      ?.value
      .trim();

  const password =
    getElement("signupPassword")
      ?.value;


  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password."
    );

    return;
  }


  if (password.length < 6) {

    showAuthMessage(
      "Password must be at least 6 characters."
    );

    return;
  }


  if (!supabaseClient) {

    showAuthMessage(
      "Authentication service unavailable."
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
        email: email,
        password: password
      });


    if (error) {
      throw error;
    }


    if (data.session) {

      showAuthMessage(
        "Account created successfully."
      );

      showApplication(
        data.user
      );

    } else {

      showAuthMessage(
        "Account created. Please check your email to confirm your account."
      );
    }

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to create account."
    );
  }
}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const email =
    getElement("loginEmail")
      ?.value
      .trim();

  const password =
    getElement("loginPassword")
      ?.value;


  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password."
    );

    return;
  }


  if (!supabaseClient) {

    showAuthMessage(
      "Authentication service unavailable."
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
        email: email,
        password: password
      });


    if (error) {
      throw error;
    }


    if (
      data.session &&
      data.user
    ) {

      showAuthMessage("");

      console.log(
        "Login successful:",
        data.user.email
      );

      showApplication(
        data.user
      );

    } else {

      showAuthMessage(
        "Login succeeded, but no session was created."
      );
    }

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to log in."
    );
  }
}


// ======================================================
// AUTH FORM SWITCHING
// ======================================================

function showSignup() {

  const loginForm =
    getElement("loginForm");

  const signupForm =
    getElement("signupForm");


  if (loginForm) {
    loginForm.style.display = "none";
  }

  if (signupForm) {
    signupForm.style.display = "block";
  }

  showAuthMessage("");
}


function showLogin() {

  const loginForm =
    getElement("loginForm");

  const signupForm =
    getElement("signupForm");


  if (signupForm) {
    signupForm.style.display = "none";
  }

  if (loginForm) {
    loginForm.style.display = "block";
  }

  showAuthMessage("");
}


// ======================================================
// NAVIGATION
// ======================================================

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".section");

  sections.forEach(function(section) {

    section.classList.remove(
      "active"
    );
  });


  const targetSection =
    getElement(sectionId);


  if (!targetSection) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }


  targetSection.classList.add(
    "active"
  );


  closeMenu();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// MOBILE MENU
// ======================================================

function toggleMenu() {

  const menu =
    getElement("mobileMenu");

  const button =
    document.querySelector(".menu-btn");


  if (!menu) {

    console.error(
      "mobileMenu not found."
    );

    return;
  }


  menu.classList.toggle(
    "open"
  );


  const isOpen =
    menu.classList.contains(
      "open"
    );


  if (button) {

    button.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  }


  console.log(
    isOpen
      ? "Menu opened."
      : "Menu closed."
  );
}


function closeMenu() {

  const menu =
    getElement("mobileMenu");

  const button =
    document.querySelector(".menu-btn");


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
  }
}


// ======================================================
// DASHBOARD
// ======================================================

function calculateFinancialSummary() {

  if (!Array.isArray(transactions)) {
    transactions = [];
  }


  const income =
    transactions
      .filter(function(transaction) {

        return transaction.type === "income";

      })
      .reduce(function(sum, transaction) {

        return sum +
          (Number(transaction.amount) || 0);

      }, 0);


  const expenses =
    transactions
      .filter(function(transaction) {

        return transaction.type === "expense";

      })
      .reduce(function(sum, transaction) {

        return sum +
          (Number(transaction.amount) || 0);

      }, 0);


  return {

    income: income,

    expenses: expenses,

    balance:
      income - expenses
  };
}


function updateDashboard() {

  const summary =
    calculateFinancialSummary();


  const incomeElement =
    getElement("totalIncome");

  const expenseElement =
    getElement("totalExpenses");

  const balanceElement =
    getElement("balance");


  if (incomeElement) {

    incomeElement.textContent =
      formatMoney(summary.income);
  }


  if (expenseElement) {

    expenseElement.textContent =
      formatMoney(summary.expenses);
  }


  if (balanceElement) {

    balanceElement.textContent =
      formatMoney(summary.balance);
  }


  updateHealth(
    summary.income,
    summary.expenses
  );

  renderRecentTransactions();
}


// ======================================================
// FINANCIAL HEALTH
// ======================================================

function updateHealth(
  income,
  expenses
) {

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
    getElement("healthScore");

  const titleElement =
    getElement("healthTitle");

  const messageElement =
    getElement("healthMessage");


  if (scoreElement) {

    scoreElement.textContent =
      score + "%";
  }


  if (!titleElement || !messageElement) {
    return;
  }


  if (score >= 85) {

    titleElement.textContent =
      "Excellent financial health";

    messageElement.textContent =
      "You're maintaining a strong savings position.";

  } else if (score >= 70) {

    titleElement.textContent =
      "Good financial health";

    messageElement.textContent =
      "You're doing well. Look for opportunities to increase savings.";

  } else if (score >= 50) {

    titleElement.textContent =
      "Needs attention";

    messageElement.textContent =
      "Your expenses are taking a significant portion of your income.";

  } else if (income > 0) {

    titleElement.textContent =
      "Warning";

    messageElement.textContent =
      "Your expenses are higher than your income.";

  } else {

    titleElement.textContent =
      "Let's get started";

    messageElement.textContent =
      "Add your income and expenses to see your financial health.";
  }
}


// ======================================================
// TRANSACTION MODAL
// ======================================================

function openTransactionModal() {

  const modal =
    getElement("transactionModal");

  if (modal) {

    modal.classList.add(
      "show"
    );
  }
}


// ======================================================
// ADD TRANSACTION
// ======================================================

function addTransaction() {

  const type =
    getElement("transactionType")
      ?.value || "expense";

  const description =
    getElement("transactionDescription")
      ?.value
      .trim();

  const amount =
    Number(
      getElement("transactionAmount")
        ?.value
    );

  const category =
    getElement("transactionCategory")
      ?.value || "Other";


  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

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

    date:
      new Date().toISOString()
  });


  saveData();


  const descriptionInput =
    getElement("transactionDescription");

  const amountInput =
    getElement("transactionAmount");


  if (descriptionInput) {
    descriptionInput.value = "";
  }

  if (amountInput) {
    amountInput.value = "";
  }


  closeModal(
    "transactionModal"
  );

  renderTransactions();

  updateDashboard();
}


// ======================================================
// DELETE TRANSACTION
// ======================================================

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
      function(transaction) {

        return String(transaction.id) !==
          String(id);

      }
    );


  saveData();

  renderTransactions();

  updateDashboard();
}


// ======================================================
// RENDER TRANSACTIONS
// ======================================================

function renderTransactions() {

  const container =
    getElement("allTransactions");


  if (!container) {
    return;
  }


  if (
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    transactions
      .map(function(transaction) {

        const sign =
          transaction.type === "income"
            ? "+"
            : "-";


        return `
          <div class="transaction">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(transaction.description)}
              </strong>

              <small>
                ${escapeHTML(transaction.category || "Other")}
                •
                ${formatDate(transaction.date)}
              </small>

            </div>

            <div class="${transaction.type}">
              ${sign}${formatMoney(transaction.amount)}
            </div>

            <button
              type="button"
              class="delete-btn"
              onclick="deleteTransaction('${transaction.id}')"
            >
              Delete
            </button>

          </div>
        `;
      })
      .join("");
}


// ======================================================
// RECENT TRANSACTIONS
// ======================================================

function renderRecentTransactions() {

  const container =
    getElement("recentTransactions");


  if (!container) {
    return;
  }


  const recent =
    Array.isArray(transactions)
      ? transactions.slice(0, 5)
      : [];


  if (recent.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    recent
      .map(function(transaction) {

        const sign =
          transaction.type === "income"
            ? "+"
            : "-";


        return `
          <div class="transaction">

            <div class="transaction-info">

              <strong>
                ${escapeHTML(transaction.description)}
              </strong>

              <small>
                ${escapeHTML(transaction.category || "Other")}
                •
                ${formatDate(transaction.date)}
              </small>

            </div>

            <div class="${transaction.type}">
              ${sign}${formatMoney(transaction.amount)}
            </div>

          </div>
        `;
      })
      .join("");
}


// ======================================================
// GOALS
// ======================================================

function openGoalModal() {

  const modal =
    getElement("goalModal");

  if (modal) {

    modal.classList.add(
      "show"
    );
  }
}


function addGoal() {

  const name =
    getElement("goalName")
      ?.value
      .trim();

  const target =
    Number(
      getElement("goalTarget")
        ?.value
    );

  const saved =
    Number(
      getElement("goalSaved")
        ?.value
    ) || 0;


  if (
    !name ||
    !Number.isFinite(target) ||
    target <= 0
  ) {

    alert(
      "Please enter a goal name and valid target amount."
    );

    return;
  }


  goals.push({

    id: Date.now(),

    name: name,

    target: target,

    saved:
      Math.max(0, saved)
  });


  saveData();


  const goalName =
    getElement("goalName");

  const goalTarget =
    getElement("goalTarget");

  const goalSaved =
    getElement("goalSaved");


  if (goalName) {
    goalName.value = "";
  }

  if (goalTarget) {
    goalTarget.value = "";
  }

  if (goalSaved) {
    goalSaved.value = "";
  }


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
      function(goal) {

        return String(goal.id) !==
          String(id);

      }
    );


  saveData();

  renderGoals();
}


function renderGoals() {

  const container =
    getElement("goalsList");


  if (!container) {
    return;
  }


  if (goals.length === 0) {

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
                Math.round(
                  (saved / target) * 100
                )
              )
            : 0;


        return `
          <div class="goal">

            <h3>
              ${escapeHTML(goal.name)}
            </h3>

            <p>
              ${formatMoney(saved)}
              saved of
              ${formatMoney(target)}
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
              type="button"
              class="delete-btn"
              onclick="deleteGoal('${goal.id}')"
            >
              Delete
            </button>

          </div>
        `;
      })
      .join("");
}


// ======================================================
// INVESTMENTS
// ======================================================

function openInvestmentModal() {

  const modal =
    getElement("investmentModal");

  if (modal) {

    modal.classList.add(
      "show"
    );
  }
}


function addInvestment() {

  const name =
    getElement("investmentName")
      ?.value
      .trim();

  const amount =
    Number(
      getElement("investmentAmount")
        ?.value
    );

  const value =
    Number(
      getElement("investmentValue")
        ?.value
    );


  if (
    !name ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter an investment name and valid amount."
    );

    return;
  }


  investments.push({

    id: Date.now(),

    name: name,

    amount: amount,

    value:
      Number.isFinite(value) &&
      value > 0
        ? value
        : amount
  });


  saveData();


  const investmentName =
    getElement("investmentName");

  const investmentAmount =
    getElement("investmentAmount");

  const investmentValue =
    getElement("investmentValue");


  if (investmentName) {
    investmentName.value = "";
  }

  if (investmentAmount) {
    investmentAmount.value = "";
  }

  if (investmentValue) {
    investmentValue.value = "";
  }


  closeModal(
    "investmentModal"
  );

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
      function(investment) {

        return String(investment.id) !==
          String(id);

      }
    );


  saveData();

  renderInvestments();
}


function renderInvestments() {

  const container =
    getElement("investmentsList");


  if (!container) {
    return;
  }


  if (investments.length === 0) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }


  container.innerHTML =
    investments
      .map(function(investment) {

        const invested =
          Number(investment.amount) || 0;

        const value =
          Number(investment.value) || 0;

        const gain =
          value - invested;


        return `
          <div class="investment">

            <h3>
              ${escapeHTML(investment.name)}
            </h3>

            <p>
              Invested:
              ${formatMoney(invested)}
            </p>

            <p>
              Current value:
              ${formatMoney(value)}
            </p>

            <strong
              class="${
                gain >= 0
                  ? "income"
                  : "expense"
              }"
            >
              ${gain >= 0 ? "+" : ""}
              ${formatMoney(gain)}
            </strong>

            <br><br>

            <button
              type="button"
              class="delete-btn"
              onclick="deleteInvestment('${investment.id}')"
            >
              Delete
            </button>

          </div>
        `;
      })
      .join("");
}


// ======================================================
// AI ASSISTANT
// ======================================================

async function askAI() {

  const input =
    getElement("aiInput");

  const chat =
    getElement("chatMessages");


  if (!input || !chat) {

    console.error(
      "AI input or chat container not found."
    );

    return;
  }


  const question =
    input.value.trim();


  if (!question) {
    return;
  }


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


  const summary =
    calculateFinancialSummary();


  const invested =
    investments.reduce(
      function(sum, investment) {

        return sum +
          (Number(investment.amount) || 0);

      },
      0
    );


  const investmentValue =
    investments.reduce(
      function(sum, investment) {

        return sum +
          (Number(investment.value) || 0);

      },
      0
    );


  const financialSnapshot = {

    income:
      summary.income,

    expenses:
      summary.expenses,

    balance:
      summary.balance,

    savingsRate:
      summary.income > 0
        ? Number(
            (
              (summary.balance / summary.income) *
              100
            ).toFixed(1)
          )
        : 0,

    investments:
      invested,

    investmentValue:
      investmentValue,

    investmentGain:
      investmentValue - invested,

    savingsGoals:
      goals,

    transactions:
      transactions,

    investmentRecords:
      investments
  };


  if (!AI_URL) {

    thinking.textContent =
      "AI service is not configured.";

    return;
  }


  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      function() {

        controller.abort();

      },
      20000
    );


  try {

    const response =
      await fetch(
        AI_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              message:
                question,

              financialData:
                financialSnapshot
            }),

          signal:
            controller.signal
        }
      );


    clearTimeout(timeout);


    let data = {};


    try {

      data =
        await response.json();

    } catch (error) {

      console.warn(
        "AI returned invalid JSON."
      );
    }


    console.log(
      "MoneyMind AI:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.error ||
        data.message ||
        "AI request failed."
      );
    }


    thinking.textContent =
      data.reply ||
      data.message ||
      "I received your question, but no answer was returned.";

  } catch (error) {

    clearTimeout(timeout);


    console.error(
      "MoneyMind AI error:",
      error
    );


    if (
      error.name ===
      "AbortError"
    ) {

      thinking.textContent =
        "The AI is taking too long to respond. Please try again.";

    } else {

      thinking.textContent =
        error.message ||
        "MoneyMind AI could not connect right now.";
    }
  }


  chat.scrollTop =
    chat.scrollHeight;
}


// ======================================================
// QUICK QUESTIONS
// ======================================================

function quickQuestion(question) {

  const input =
    getElement("aiInput");


  if (!input) {
    return;
  }


  input.value =
    question;

  askAI();
}


// ======================================================
// CHAT MESSAGE
// ======================================================

function addChatMessage(
  message,
  type
) {

  const container =
    getElement("chatMessages");


  if (!container) {
    return;
  }


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


// ======================================================
// MODALS
// ======================================================

function closeModal(id) {

  const modal =
    getElement(id);


  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


// ======================================================
// CLICK OUTSIDE MODAL
// ======================================================

function setupModalClose() {

  window.addEventListener(
    "click",
    function(event) {

      document
        .querySelectorAll(".modal")
        .forEach(function(modal) {

          if (event.target === modal) {

            modal.classList.remove(
              "show"
            );
          }
        });
    }
  );
}


// ======================================================
// AUTH STATE LISTENER
// ======================================================

function setupAuthListener() {

  if (!supabaseClient) {
    return;
  }


  supabaseClient.auth.onAuthStateChange(
    function(event, session) {

      console.log(
        "Auth event:",
        event
      );


      if (
        session &&
        session.user
      ) {

        showApplication(
          session.user
        );

      } else {

        showAuthentication();
      }
    }
  );
}


// ======================================================
// INITIALIZE APPLICATION
// ======================================================

async function initializeApp() {

  console.log(
    "MoneyMind AI starting..."
  );


  transactions =
    Array.isArray(transactions)
      ? transactions
      : [];

  goals =
    Array.isArray(goals)
      ? goals
      : [];

  investments =
    Array.isArray(investments)
      ? investments
      : [];


  setupModalClose();

  setupAuthListener();


  await checkAuth();


  updateDashboard();

  renderTransactions();

  renderGoals();

  renderInvestments();


  console.log(
    "MoneyMind AI ready."
  );
}


// ======================================================
// EXPOSE FUNCTIONS TO HTML
// ======================================================

window.showSignup =
  showSignup;

window.showLogin =
  showLogin;

window.signupUser =
  signupUser;

window.loginUser =
  loginUser;

window.showSection =
  showSection;

window.toggleMenu =
  toggleMenu;

window.closeMenu =
  closeMenu;

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
  closeModal;


// ======================================================
// START APPLICATION
// ======================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();
}


console.log(
  "MoneyMind app.js loaded successfully."
);
```
