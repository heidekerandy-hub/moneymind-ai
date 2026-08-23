// ======================================================
// MONEY MIND AI
// COMPLETE WORKING APP.JS
// ======================================================


// ======================================================
// SUPABASE
// ======================================================

const supabaseClient = window.supabaseClient || null;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ======================================================
// APPLICATION DATA
// ======================================================

let transactions = loadArray("mm_transactions");
let goals = loadArray("mm_goals");
let investments = loadArray("mm_investments");


// ======================================================
// SAFE ARRAY LOADER
// ======================================================

function loadArray(key) {

  try {

    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    console.warn(
      key + " is not an array. Resetting."
    );

    localStorage.removeItem(key);

    return [];

  } catch (error) {

    console.error(
      "Could not load " + key,
      error
    );

    localStorage.removeItem(key);

    return [];
  }
}


// ======================================================
// SAVE ALL DATA
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
      "Could not save MoneyMind data:",
      error
    );
  }
}


// ======================================================
// AUTHENTICATION
// ======================================================

async function checkAuth() {

  const authScreen =
    document.getElementById("authScreen");

  if (!authScreen) {
    return;
  }

  if (!supabaseClient) {

    console.warn(
      "Supabase client not found."
    );

    authScreen.style.display = "flex";

    return;
  }

  try {

    const result =
      await supabaseClient.auth.getSession();

    const session =
      result.data
        ? result.data.session
        : null;

    const error =
      result.error;

    if (error) {

      console.error(
        "Supabase session error:",
        error
      );

      authScreen.style.display = "flex";

      return;
    }

    if (session) {

      authScreen.style.display = "none";

      console.log(
        "Logged in:",
        session.user.email
      );

    } else {

      authScreen.style.display = "flex";
    }

  } catch (error) {

    console.error(
      "Authentication check failed:",
      error
    );

    authScreen.style.display = "flex";
  }
}


// ======================================================
// SIGN UP
// ======================================================

async function signupUser() {

  const emailInput =
    document.getElementById("signupEmail");

  const passwordInput =
    document.getElementById("signupPassword");

  const message =
    document.getElementById("authMessage");

  if (
    !emailInput ||
    !passwordInput ||
    !message
  ) {
    console.error(
      "Signup elements not found."
    );

    return;
  }

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

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

  if (!supabaseClient) {

    message.textContent =
      "Supabase authentication is unavailable.";

    return;
  }

  message.textContent =
    "Creating your account...";

  try {

    const result =
      await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

    const data =
      result.data;

    const error =
      result.error;

    if (error) {

      console.error(
        "Signup error:",
        error
      );

      message.textContent =
        error.message;

      return;
    }

    if (data && data.session) {

      message.textContent =
        "Account created successfully.";

      await checkAuth();

    } else {

      message.textContent =
        "Account created. Please check your email to confirm your account.";
    }

  } catch (error) {

    console.error(
      "Signup failed:",
      error
    );

    message.textContent =
      "Unable to create account. Please try again.";
  }
}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const emailInput =
    document.getElementById("loginEmail");

  const passwordInput =
    document.getElementById("loginPassword");

  const message =
    document.getElementById("authMessage");

  if (
    !emailInput ||
    !passwordInput ||
    !message
  ) {
    console.error(
      "Login elements not found."
    );

    return;
  }

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }

  if (!supabaseClient) {

    message.textContent =
      "Supabase authentication is unavailable.";

    return;
  }

  message.textContent =
    "Logging in...";

  try {

    const result =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    const data =
      result.data;

    const error =
      result.error;

    if (error) {

      console.error(
        "Login error:",
        error
      );

      message.textContent =
        error.message;

      return;
    }

    console.log(
      "Login successful:",
      data && data.user
        ? data.user.email
        : ""
    );

    message.textContent =
      "Login successful.";

    const authScreen =
      document.getElementById(
        "authScreen"
      );

    if (authScreen) {

      authScreen.style.display =
        "none";
    }

  } catch (error) {

    console.error(
      "Login failed:",
      error
    );

    message.textContent =
      "Unable to log in. Please try again.";
  }
}


// ======================================================
// LOGOUT
// ======================================================

async function logoutUser() {

  if (!supabaseClient) {
    return;
  }

  try {

    const result =
      await supabaseClient.auth.signOut();

    if (result.error) {

      console.error(
        "Logout error:",
        result.error
      );

      return;
    }

    console.log(
      "Logged out successfully."
    );

    const authScreen =
      document.getElementById(
        "authScreen"
      );

    if (authScreen) {

      authScreen.style.display =
        "flex";
    }

  } catch (error) {

    console.error(
      "Logout failed:",
      error
    );
  }
}


// ======================================================
// AUTH SCREEN SWITCHING
// ======================================================

function showSignup() {

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const signupForm =
    document.getElementById(
      "signupForm"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  if (loginForm) {
    loginForm.style.display = "none";
  }

  if (signupForm) {
    signupForm.style.display = "block";
  }

  if (message) {
    message.textContent = "";
  }
}


function showLogin() {

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const signupForm =
    document.getElementById(
      "signupForm"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  if (signupForm) {
    signupForm.style.display = "none";
  }

  if (loginForm) {
    loginForm.style.display = "block";
  }

  if (message) {
    message.textContent = "";
  }
}


// ======================================================
// MOBILE MENU
// ======================================================

function toggleMenu() {

  const menu =
    document.getElementById(
      "mobileMenu"
    );

  if (!menu) {

    console.error(
      "mobileMenu element not found."
    );

    return;
  }

  const isOpen =
    menu.classList.contains(
      "active"
    );

  if (isOpen) {

    menu.classList.remove(
      "active"
    );

    menu.style.display =
      "none";

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

  } else {

    menu.classList.add(
      "active"
    );

    menu.style.display =
      "flex";

    menu.setAttribute(
      "aria-hidden",
      "false"
    );
  }
}


// ======================================================
// CLOSE MOBILE MENU
// ======================================================

function closeMobileMenu() {

  const menu =
    document.getElementById(
      "mobileMenu"
    );

  if (!menu) {
    return;
  }

  menu.classList.remove(
    "active"
  );

  menu.style.display =
    "none";

  menu.setAttribute(
    "aria-hidden",
    "true"
  );
}


// ======================================================
// NAVIGATION
// ======================================================

function showSection(sectionId) {

  if (!sectionId) {
    return;
  }

  const sections =
    document.querySelectorAll(
      ".section"
    );

  sections.forEach(
    function(section) {

      section.classList.remove(
        "active"
      );

    }
  );


  const section =
    document.getElementById(
      sectionId
    );


  if (!section) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }


  section.classList.add(
    "active"
  );


  closeMobileMenu();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// MONEY FORMAT
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


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(date) {

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
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


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    String(value === null || value === undefined
      ? ""
      : value
    );

  return div.innerHTML;
}


// ======================================================
// DASHBOARD
// ======================================================

function calculateFinancials() {

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  let income = 0;

  let expenses = 0;

  transactions.forEach(
    function(transaction) {

      const amount =
        Number(
          transaction.amount || 0
        );

      if (
        transaction.type ===
        "income"
      ) {

        income += amount;

      } else if (
        transaction.type ===
        "expense"
      ) {

        expenses += amount;
      }

    }
  );


  const balance =
    income - expenses;


  const savingsRate =
    income > 0
      ? (balance / income) * 100
      : 0;


  return {

    income: income,

    expenses: expenses,

    balance: balance,

    savingsRate: savingsRate

  };
}


function updateDashboard() {

  const financials =
    calculateFinancials();


  const incomeElement =
    document.getElementById(
      "totalIncome"
    );

  const expenseElement =
    document.getElementById(
      "totalExpenses"
    );

  const balanceElement =
    document.getElementById(
      "balance"
    );


  if (incomeElement) {

    incomeElement.textContent =
      formatMoney(
        financials.income
      );
  }


  if (expenseElement) {

    expenseElement.textContent =
      formatMoney(
        financials.expenses
      );
  }


  if (balanceElement) {

    balanceElement.textContent =
      formatMoney(
        financials.balance
      );
  }


  updateHealth(
    financials.income,
    financials.expenses
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
    document.getElementById(
      "healthScore"
    );

  const title =
    document.getElementById(
      "healthTitle"
    );

  const message =
    document.getElementById(
      "healthMessage"
    );


  if (scoreElement) {

    scoreElement.textContent =
      score + "%";
  }


  if (!title || !message) {
    return;
  }


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


// ======================================================
// TRANSACTION MODAL
// ======================================================

function openTransactionModal() {

  const modal =
    document.getElementById(
      "transactionModal"
    );

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
    document.getElementById(
      "transactionType"
    )?.value || "expense";


  const description =
    document.getElementById(
      "transactionDescription"
    )?.value.trim() || "";


  const amount =
    Number(
      document.getElementById(
        "transactionAmount"
      )?.value
    );


  const category =
    document.getElementById(
      "transactionCategory"
    )?.value || "Other";


  if (
    !description ||
    !amount ||
    amount <= 0
  ) {

    alert(
      "Please enter a description and a valid amount."
    );

    return;
  }


  if (!Array.isArray(transactions)) {
    transactions = [];
  }


  transactions.unshift({

    id:
      Date.now(),

    type:
      type,

    description:
      description,

    amount:
      amount,

    category:
      category,

    date:
      new Date().toISOString()

  });


  saveData();


  const descriptionInput =
    document.getElementById(
      "transactionDescription"
    );

  const amountInput =
    document.getElementById(
      "transactionAmount"
    );


  if (descriptionInput) {

    descriptionInput.value =
      "";
  }


  if (amountInput) {

    amountInput.value =
      "";
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

  const confirmed =
    confirm(
      "Are you sure you want to delete this transaction?"
    );


  if (!confirmed) {
    return;
  }


  if (!Array.isArray(transactions)) {
    transactions = [];
  }


  transactions =
    transactions.filter(
      function(transaction) {

        return String(
          transaction.id
        ) !== String(id);

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
    document.getElementById(
      "allTransactions"
    );


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
      .map(
        function(transaction) {

          const sign =
            transaction.type ===
            "income"
              ? "+"
              : "-";


          const type =
            transaction.type ===
            "income"
              ? "income"
              : "expense";


          return `
            <div class="transaction">

              <div class="transaction-info">

                <strong>
                  ${escapeHTML(
                    transaction.description
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    transaction.category ||
                    "Other"
                  )}

                  •

                  ${formatDate(
                    transaction.date
                  )}
                </small>

              </div>

              <div class="${type}">
                ${sign}
                ${formatMoney(
                  transaction.amount
                )}
              </div>

              <button
                type="button"
                class="delete-btn"
                onclick="window.deleteTransaction('${String(transaction.id)}')"
              >
                Delete
              </button>

            </div>
          `;

        }
      )
      .join("");
}


// ======================================================
// RECENT TRANSACTIONS
// ======================================================

function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


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
      .map(
        function(transaction) {

          const sign =
            transaction.type ===
            "income"
              ? "+"
              : "-";


          const type =
            transaction.type ===
            "income"
              ? "income"
              : "expense";


          return `
            <div class="transaction">

              <div class="transaction-info">

                <strong>
                  ${escapeHTML(
                    transaction.description
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    transaction.category ||
                    "Other"
                  )}

                  •

                  ${formatDate(
                    transaction.date
                  )}
                </small>

              </div>

              <div class="${type}">
                ${sign}
                ${formatMoney(
                  transaction.amount
                )}
              </div>

            </div>
          `;

        }
      )
      .join("");
}


// ======================================================
// SAVINGS GOALS
// ======================================================

function openGoalModal() {

  const modal =
    document.getElementById(
      "goalModal"
    );

  if (modal) {

    modal.classList.add(
      "show"
    );
  }
}


function addGoal() {

  const name =
    document.getElementById(
      "goalName"
    )?.value.trim() || "";


  const target =
    Number(
      document.getElementById(
        "goalTarget"
      )?.value
    );


  const saved =
    Number(
      document.getElementById(
        "goalSaved"
      )?.value
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


  if (!Array.isArray(goals)) {
    goals = [];
  }


  goals.push({

    id:
      Date.now(),

    name:
      name,

    target:
      target,

    saved:
      Math.max(
        0,
        saved
      )

  });


  saveData();


  const nameInput =
    document.getElementById(
      "goalName"
    );

  const targetInput =
    document.getElementById(
      "goalTarget"
    );

  const savedInput =
    document.getElementById(
      "goalSaved"
    );


  if (nameInput) {
    nameInput.value = "";
  }

  if (targetInput) {
    targetInput.value = "";
  }

  if (savedInput) {
    savedInput.value = "";
  }


  closeModal(
    "goalModal"
  );


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


  if (!Array.isArray(goals)) {
    goals = [];
  }


  goals =
    goals.filter(
      function(goal) {

        return String(
          goal.id
        ) !== String(id);

      }
    );


  saveData();

  renderGoals();
}


function renderGoals() {

  const container =
    document.getElementById(
      "goalsList"
    );


  if (!container) {
    return;
  }


  if (
    !Array.isArray(goals) ||
    goals.length === 0
  ) {

    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';

    return;
  }


  container.innerHTML =
    goals
      .map(
        function(goal) {

          const target =
            Number(
              goal.target
            ) || 0;


          const saved =
            Number(
              goal.saved
            ) || 0;


          let percentage = 0;


          if (target > 0) {

            percentage =
              Math.min(
                100,
                Math.round(
                  (saved / target) * 100
                )
              );
          }


          return `
            <div class="goal">

              <h3>
                ${escapeHTML(
                  goal.name
                )}
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
                onclick="window.deleteGoal('${String(goal.id)}')"
              >
                Delete
              </button>

            </div>
          `;

        }
      )
      .join("");
}


// ======================================================
// INVESTMENTS
// ======================================================

function openInvestmentModal() {

  const modal =
    document.getElementById(
      "investmentModal"
    );


  if (modal) {

    modal.classList.add(
      "show"
    );
  }
}


function addInvestment() {

  const name =
    document.getElementById(
      "investmentName"
    )?.value.trim() || "";


  const amount =
    Number(
      document.getElementById(
        "investmentAmount"
      )?.value
    );


  const value =
    Number(
      document.getElementById(
        "investmentValue"
      )?.value
    );


  if (
    !name ||
    !amount ||
    amount <= 0
  ) {

    alert(
      "Please enter the investment name and amount."
    );

    return;
  }


  if (!Array.isArray(investments)) {
    investments = [];
  }


  investments.push({

    id:
      Date.now(),

    name:
      name,

    amount:
      amount,

    value:
      value > 0
        ? value
        : amount

  });


  saveData();


  const nameInput =
    document.getElementById(
      "investmentName"
    );

  const amountInput =
    document.getElementById(
      "investmentAmount"
    );

  const valueInput =
    document.getElementById(
      "investmentValue"
    );


  if (nameInput) {
    nameInput.value = "";
  }

  if (amountInput) {
    amountInput.value = "";
  }

  if (valueInput) {
    valueInput.value = "";
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


  if (!Array.isArray(investments)) {
    investments = [];
  }


  investments =
    investments.filter(
      function(investment) {

        return String(
          investment.id
        ) !== String(id);

      }
    );


  saveData();

  renderInvestments();
}


function renderInvestments() {

  const container =
    document.getElementById(
      "investmentsList"
    );


  if (!container) {
    return;
  }


  if (
    !Array.isArray(investments) ||
    investments.length === 0
  ) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }


  container.innerHTML =
    investments
      .map(
        function(investment) {

          const invested =
            Number(
              investment.amount
            ) || 0;


          const value =
            Number(
              investment.value
            ) || 0;


          const gain =
            value - invested;


          const gainClass =
            gain >= 0
              ? "income"
              : "expense";


          const gainSign =
            gain >= 0
              ? "+"
              : "";


          return `
            <div class="investment">

              <h3>
                ${escapeHTML(
                  investment.name
                )}
              </h3>

              <p>
                Invested:
                ${formatMoney(
                  invested
                )}
              </p>

              <p>
                Current value:
                ${formatMoney(
                  value
                )}
              </p>

              <strong class="${gainClass}">
                ${gainSign}
                ${formatMoney(gain)}
              </strong>

              <br><br>

              <button
                type="button"
                class="delete-btn"
                onclick="window.deleteInvestment('${String(investment.id)}')"
              >
                Delete
              </button>

            </div>
          `;

        }
      )
      .join("");
}


// ======================================================
// FINANCIAL SNAPSHOT FOR AI
// ======================================================

function createFinancialSnapshot() {

  const financials =
    calculateFinancials();


  let invested = 0;

  let investmentValue = 0;


  if (!Array.isArray(investments)) {
    investments = [];
  }


  investments.forEach(
    function(investment) {

      invested +=
        Number(
          investment.amount || 0
        );

      investmentValue +=
        Number(
          investment.value || 0
        );

    }
  );


  const investmentGain =
    investmentValue - invested;


  return {

    income:
      financials.income,

    expenses:
      financials.expenses,

    balance:
      financials.balance,

    savingsRate:
      Number(
        financials.savingsRate.toFixed(1)
      ),

    totalInvested:
      invested,

    investmentValue:
      investmentValue,

    investmentGain:
      investmentGain,

    savingsGoals:
      goals,

    transactions:
      transactions,

    investments:
      investments

  };
}


// ======================================================
// AI ASSISTANT
// ======================================================

async function askAI() {

  const input =
    document.getElementById(
      "aiInput"
    );

  const chat =
    document.getElementById(
      "chatMessages"
    );


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


  // USER MESSAGE

  addChatMessage(
    question,
    "user"
  );


  input.value =
    "";


  // THINKING MESSAGE

  const thinking =
    document.createElement(
      "div"
    );


  thinking.className =
    "message ai";


  thinking.textContent =
    "MoneyMind AI is analyzing your finances...";


  chat.appendChild(
    thinking
  );


  chat.scrollTop =
    chat.scrollHeight;


  // SAFETY

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  if (!Array.isArray(goals)) {
    goals = [];
  }

  if (!Array.isArray(investments)) {
    investments = [];
  }


  // FINANCIAL SNAPSHOT

  const financialSnapshot =
    createFinancialSnapshot();


  console.log(
    "Personalized financial snapshot:",
    financialSnapshot
  );


  if (!AI_URL) {

    thinking.textContent =
      "MoneyMind AI is not configured.";

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


    clearTimeout(
      timeout
    );


    let data = {};


    try {

      data =
        await response.json();

    } catch (error) {

      console.warn(
        "AI response was not valid JSON.",
        error
      );

    }


    console.log(
      "MoneyMind AI response:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.error ||
        data.message ||
        "AI request failed."
      );
    }


    const reply =
      data.reply ||
      data.message ||
      "I couldn't generate a response.";


    thinking.textContent =
      reply;


  } catch (error) {

    clearTimeout(
      timeout
    );


    console.error(
      "MoneyMind AI error:",
      error
    );


    if (
      error.name ===
      "AbortError"
    ) {

      thinking.textContent =
        "MoneyMind AI is taking too long to respond. Please try again.";

    } else {

      thinking.textContent =
        "MoneyMind AI could not connect right now. Please try again.";
    }

  }


  chat.scrollTop =
    chat.scrollHeight;
}


// ======================================================
// QUICK AI QUESTIONS
// ======================================================

function quickQuestion(question) {

  const input =
    document.getElementById(
      "aiInput"
    );


  if (!input) {
    return;
  }


  input.value =
    question;


  askAI();
}


// ======================================================
// ADD CHAT MESSAGE
// ======================================================

function addChatMessage(
  message,
  type
) {

  const container =
    document.getElementById(
      "chatMessages"
    );


  if (!container) {
    return;
  }


  const div =
    document.createElement(
      "div"
    );


  div.className =
    "message " + type;


  div.textContent =
    message;


  container.appendChild(
    div
  );


  container.scrollTop =
    container.scrollHeight;
}


// ======================================================
// MODALS
// ======================================================

function closeModal(id) {

  const modal =
    document.getElementById(
      id
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


// ======================================================
// CLICK OUTSIDE MODAL
// ======================================================

window.addEventListener(
  "click",
  function(event) {

    const modals =
      document.querySelectorAll(
        ".modal"
      );


    modals.forEach(
      function(modal) {

        if (
          event.target ===
          modal
        ) {

          modal.classList.remove(
            "show"
          );
        }

      }
    );

  }
);


// ======================================================
// ENTER KEY FOR AI
// ======================================================

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key ===
      "Enter"
    ) {

      const active =
        document.activeElement;


      if (
        active &&
        active.id ===
        "aiInput"
      ) {

        if (!event.shiftKey) {

          event.preventDefault();

          askAI();
        }
      }
    }

  }
);


// ======================================================
// SUPABASE AUTH STATE
// ======================================================

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    function(event, session) {

      console.log(
        "Auth event:",
        event
      );


      const authScreen =
        document.getElementById(
          "authScreen"
        );


      if (!authScreen) {
        return;
      }


      if (session) {

        authScreen.style.display =
          "none";

      } else {

        authScreen.style.display =
          "flex";
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


  // Guarantee valid arrays

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  if (!Array.isArray(goals)) {
    goals = [];
  }

  if (!Array.isArray(investments)) {
    investments = [];
  }


  // Authentication

  await checkAuth();


  // Render application

  updateDashboard();

  renderTransactions();

  renderGoals();

  renderInvestments();


  // Make sure menu starts closed

  closeMobileMenu();


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

window.logoutUser =
  logoutUser;

window.showSection =
  showSection;

window.toggleMenu =
  toggleMenu;

window.closeMobileMenu =
  closeMobileMenu;

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


// ======================================================
// FINAL DEBUG MESSAGE
// ======================================================

console.log(
  "MoneyMind app.js loaded successfully."
);
