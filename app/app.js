// ======================================================
// MONEYMIND AI
// COMPLETE APPLICATION JAVASCRIPT
// ======================================================


// ======================================================
// SUPABASE
// ======================================================

const supabaseClient = window.supabaseClient;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ======================================================
// APPLICATION DATA
// ======================================================

let transactions = loadArray("mm_transactions");
let goals = loadArray("mm_goals");
let investments = loadArray("mm_investments");


// ======================================================
// LOCAL STORAGE
// ======================================================

function loadArray(key) {

  try {

    const value =
      localStorage.getItem(key);

    if (!value) {
      return [];
    }

    const parsed =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    localStorage.removeItem(key);

    return [];

  } catch (error) {

    console.error(
      "Could not load:",
      key,
      error
    );

    localStorage.removeItem(key);

    return [];
  }
}


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


// ======================================================
// UTILITY
// ======================================================

function formatMoney(value) {

  const amount =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }
  ).format(amount);
}


function formatDate(value) {

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
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


// ======================================================
// AUTH
// ======================================================

async function checkAuth() {

  console.log("Checking authentication...");

  if (!window.supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showAuthMessage(
      "Authentication service unavailable."
    );

    showAuthentication();

    return;
  }

  try {

    const {
      data,
      error
    } =
      await window.supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    console.log(
      "Current session:",
      data.session
    );

    if (
      data.session &&
      data.session.user
    ) {

      console.log(
        "Logged in:",
        data.session.user.email
      );

      showApplication(
        data.session.user
      );

    } else {

      console.log(
        "No active session."
      );

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
// SHOW APP
// ======================================================

function showApplication(user) {

  const authScreen =
    document.getElementById("authScreen");

  const app =
    document.getElementById("app");

  if (authScreen) {
    authScreen.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  const userEmail =
    document.getElementById("userEmail");

  if (userEmail && user) {

    userEmail.textContent =
      user.email || "";
  }

  updateDashboard();

  renderTransactions();

  renderGoals();

  renderInvestments();

  updateAISnapshot();
}


function showAuthentication() {

  const authScreen =
    document.getElementById("authScreen");

  const app =
    document.getElementById("app");

  if (authScreen) {
    authScreen.classList.remove("hidden");
  }

  if (app) {
    app.classList.add("hidden");
  }
}


// ======================================================
// AUTH MESSAGE
// ======================================================

function showAuthMessage(message) {

  const element =
    document.getElementById("authMessage");

  if (element) {
    element.textContent = message;
  }
}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const email =
    document.getElementById(
      "loginEmail"
    )?.value.trim();

  const password =
    document.getElementById(
      "loginPassword"
    )?.value;

  if (!email || !password) {

    showAuthMessage(
      "Please enter your email and password."
    );

    return;
  }

  if (!supabaseClient) {

    showAuthMessage(
      "Supabase is not available."
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

    console.log(
      "Logged in:",
      data.user?.email
    );

    showAuthMessage(
      "Login successful."
    );

    showApplication(
      data.user
    );

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to login."
    );
  }
}


// ======================================================
// SIGNUP
// ======================================================

async function signupUser() {

  const email =
    document.getElementById(
      "signupEmail"
    )?.value.trim();

  const password =
    document.getElementById(
      "signupPassword"
    )?.value;

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

  showAuthMessage(
    "Creating account..."
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

    if (data.session) {

      showApplication(
        data.user
      );

    } else {

      showAuthMessage(
        "Account created. Please confirm your email."
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
// LOGOUT
// ======================================================

async function logoutUser() {

  if (!supabaseClient) {
    return;
  }

  try {

    await supabaseClient.auth.signOut();

    showAuthentication();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }
}


// ======================================================
// AUTH SCREEN SWITCHING
// ======================================================

function showSignup() {

  document
    .getElementById("loginForm")
    ?.classList.add("hidden");

  document
    .getElementById("signupForm")
    ?.classList.remove("hidden");

  showAuthMessage("");
}


function showLogin() {

  document
    .getElementById("signupForm")
    ?.classList.add("hidden");

  document
    .getElementById("loginForm")
    ?.classList.remove("hidden");

  showAuthMessage("");
}


// ======================================================
// NAVIGATION
// ======================================================

function showSection(sectionId) {

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


  const selected =
    document.getElementById(
      sectionId
    );

  if (!selected) {

    console.error(
      "Section not found:",
      sectionId
    );

    return;
  }


  selected.classList.add(
    "active"
  );


  const navItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
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


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// MENU
// ======================================================
// ======================================================
// MOBILE MENU
// ======================================================

function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");

  if (!menu) {
    console.error("mobileMenu not found.");
    return;
  }

  const isOpen =
    menu.classList.contains("open");

  if (isOpen) {

    menu.classList.remove("open");

    if (button) {
      button.setAttribute(
        "aria-expanded",
        "false"
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
    }

    console.log("Menu opened.");
  }
}
function closeMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");

  if (!menu) {
    return;
  }

  menu.classList.remove("open");

  if (button) {
    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  console.log("Menu closed.");
}
// ======================================================
// TRANSACTION MODAL
// ======================================================

function openTransactionModal() {

  document
    .getElementById(
      "transactionModal"
    )
    ?.classList.add("show");
}


function addTransaction() {

  const type =
    document.getElementById(
      "transactionType"
    )?.value;

  const description =
    document.getElementById(
      "transactionDescription"
    )?.value.trim();

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
      "Please enter a description and valid amount."
    );

    return;
  }


  transactions.unshift({

    id:
      Date.now(),

    type:
      type || "expense",

    description,

    amount,

    category,

    date:
      new Date().toISOString()

  });


  saveData();

  closeModal(
    "transactionModal"
  );


  document.getElementById(
    "transactionDescription"
  ).value = "";

  document.getElementById(
    "transactionAmount"
  ).value = "";


  renderTransactions();

  updateDashboard();

  updateAISnapshot();
}


// ======================================================
// DELETE TRANSACTION
// ======================================================

function deleteTransaction(id) {

  if (
    !confirm(
      "Delete this transaction?"
    )
  ) {
    return;
  }

  transactions =
    transactions.filter(
      transaction =>
        String(transaction.id) !==
        String(id)
    );

  saveData();

  renderTransactions();

  updateDashboard();

  updateAISnapshot();
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
    !transactions.length
  ) {

    container.innerHTML =
      `<p class="empty">
        No transactions yet.
      </p>`;

    return;
  }


  container.innerHTML =
    transactions
      .map(
        transaction => {

          const isIncome =
            transaction.type ===
            "income";

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
                    transaction.category
                  )}
                  •
                  ${formatDate(
                    transaction.date
                  )}
                </small>

              </div>

              <div class="${
                isIncome
                  ? "income"
                  : "expense"
              }">

                ${isIncome ? "+" : "-"}

                ${formatMoney(
                  transaction.amount
                )}

              </div>

              <button
                class="delete-btn"
                data-delete-transaction="${
                  transaction.id
                }"
                type="button"
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
    transactions.slice(
      0,
      5
    );


  if (!recent.length) {

    container.innerHTML =
      `<p class="empty">
        No transactions yet.
      </p>`;

    return;
  }


  container.innerHTML =
    recent
      .map(
        transaction => {

          const isIncome =
            transaction.type ===
            "income";

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
                    transaction.category
                  )}
                  •
                  ${formatDate(
                    transaction.date
                  )}
                </small>

              </div>

              <div class="${
                isIncome
                  ? "income"
                  : "expense"
              }">

                ${isIncome ? "+" : "-"}

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
// FINANCIAL CALCULATIONS
// ======================================================

function calculateFinancials() {

  const income =
    transactions
      .filter(
        t =>
          t.type === "income"
      )
      .reduce(
        (sum, t) =>
          sum +
          Number(t.amount || 0),
        0
      );


  const expenses =
    transactions
      .filter(
        t =>
          t.type === "expense"
      )
      .reduce(
        (sum, t) =>
          sum +
          Number(t.amount || 0),
        0
      );


  const balance =
    income -
    expenses;


  const savingsRate =
    income > 0
      ? (balance / income) * 100
      : 0;


  const invested =
    investments.reduce(
      (sum, investment) =>
        sum +
        Number(
          investment.amount || 0
        ),
      0
    );


  const currentValue =
    investments.reduce(
      (sum, investment) =>
        sum +
        Number(
          investment.value || 0
        ),
      0
    );


  return {

    income,

    expenses,

    balance,

    savingsRate,

    invested,

    currentValue,

    investmentGain:
      currentValue -
      invested

  };
}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

  const financials =
    calculateFinancials();


  document.getElementById(
    "totalIncome"
  ).textContent =
    formatMoney(
      financials.income
    );


  document.getElementById(
    "totalExpenses"
  ).textContent =
    formatMoney(
      financials.expenses
    );


  document.getElementById(
    "balance"
  ).textContent =
    formatMoney(
      financials.balance
    );


  document.getElementById(
    "dashboardSavingsRate"
  ).textContent =
    `${Math.max(
      0,
      financials.savingsRate
    ).toFixed(1)}%`;


  updateHealth(
    financials
  );

  generatePersonalInsight(
    financials
  );

  renderRecentTransactions();
}


// ======================================================
// FINANCIAL HEALTH
// ======================================================

function updateHealth(financials) {

  let score = 0;


  if (financials.income > 0) {

    if (
      financials.savingsRate >= 30
    ) {

      score = 100;

    } else if (
      financials.savingsRate >= 20
    ) {

      score = 85;

    } else if (
      financials.savingsRate >= 10
    ) {

      score = 70;

    } else if (
      financials.savingsRate >= 0
    ) {

      score = 50;

    } else {

      score = 20;
    }
  }


  document.getElementById(
    "healthScore"
  ).textContent =
    `${score}%`;


  let title =
    "Let's get started";

  let message =
    "Add your income and expenses to see your financial health.";


  if (score >= 85) {

    title =
      "Excellent financial health";

    message =
      "Your current savings position is strong.";

  } else if (score >= 70) {

    title =
      "Good financial health";

    message =
      "You're saving, but there may still be room to improve.";

  } else if (score >= 50) {

    title =
      "Needs attention";

    message =
      "A significant portion of your income is being consumed by expenses.";

  } else if (score > 0) {

    title =
      "Financial warning";

    message =
      "Your expenses are currently higher than your income.";
  }


  document.getElementById(
    "healthTitle"
  ).textContent =
    title;


  document.getElementById(
    "healthMessage"
  ).textContent =
    message;
}


// ======================================================
// PERSONALIZED INSIGHT
// ======================================================

function generatePersonalInsight(
  financials
) {

  const element =
    document.getElementById(
      "personalInsight"
    );

  if (!element) {
    return;
  }


  if (
    financials.income === 0 &&
    financials.expenses === 0
  ) {

    element.textContent =
      "Start by recording your income and regular expenses. MoneyMind will then identify your savings rate, spending pressure and financial priorities.";

    return;
  }


  if (
    financials.balance < 0
  ) {

    element.textContent =
      `Your expenses currently exceed your recorded income by ${formatMoney(
        Math.abs(
          financials.balance
        )
      )}. Your first priority should be controlling non-essential spending and identifying expenses that can be reduced.`;

    return;
  }


  if (
    financials.savingsRate < 10
  ) {

    element.textContent =
      `You're currently keeping about ${financials.savingsRate.toFixed(
        1
      )}% of recorded income. A useful next step is to create a fixed savings target before increasing discretionary spending.`;

    return;
  }


  if (
    financials.savingsRate < 20
  ) {

    element.textContent =
      `You're saving approximately ${financials.savingsRate.toFixed(
        1
      )}% of your income. You're moving in the right direction; reducing one or two recurring expenses could accelerate your progress.`;

    return;
  }


  element.textContent =
    `You're retaining approximately ${financials.savingsRate.toFixed(
      1
    )}% of your recorded income. Your next priority can be building your emergency fund and allocating surplus money toward appropriate long-term investments.`;
}


// ======================================================
// GOALS
// ======================================================

function openGoalModal() {

  document
    .getElementById(
      "goalModal"
    )
    ?.classList.add("show");
}


function addGoal() {

  const name =
    document.getElementById(
      "goalName"
    )?.value.trim();

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
      "Please enter a goal name and target."
    );

    return;
  }


  goals.push({

    id:
      Date.now(),

    name,

    target,

    saved:
      Math.max(
        0,
        Math.min(
          saved,
          target
        )
      )

  });


  saveData();

  closeModal(
    "goalModal"
  );

  renderGoals();
}


function deleteGoal(id) {

  if (
    !confirm(
      "Delete this savings goal?"
    )
  ) {
    return;
  }


  goals =
    goals.filter(
      goal =>
        String(goal.id) !==
        String(id)
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


  if (!goals.length) {

    container.innerHTML =
      `<p class="empty">
        No savings goals yet.
      </p>`;

    return;
  }


  container.innerHTML =
    goals
      .map(
        goal => {

          const target =
            Number(goal.target) || 0;

          const saved =
            Number(goal.saved) || 0;

          const percentage =
            target > 0
              ? Math.min(
                  100,
                  Math.round(
                    (saved / target) *
                    100
                  )
                )
              : 0;


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
                class="delete-btn"
                data-delete-goal="${goal.id}"
                type="button"
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

  document
    .getElementById(
      "investmentModal"
    )
    ?.classList.add("show");
}


function addInvestment() {

  const name =
    document.getElementById(
      "investmentName"
    )?.value.trim();

  const amount =
    Number(
      document.getElementById(
        "investmentAmount"
      )?.value
    );

  const value =
    Number(
      document.getElementById(
        "investmentCurrentValue"
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


  investments.push({

    id:
      Date.now(),

    name,

    amount,

    value:
      value >= 0
        ? value
        : amount

  });


  saveData();

  closeModal(
    "investmentModal"
  );

  renderInvestments();

  updateDashboard();

  updateAISnapshot();
}


function deleteInvestment(id) {

  if (
    !confirm(
      "Delete this investment?"
    )
  ) {
    return;
  }


  investments =
    investments.filter(
      investment =>
        String(
          investment.id
        ) !==
        String(id)
    );


  saveData();

  renderInvestments();

  updateDashboard();

  updateAISnapshot();
}


function renderInvestments() {

  const container =
    document.getElementById(
      "investmentsList"
    );

  if (!container) {
    return;
  }


  const financials =
    calculateFinancials();


  document.getElementById(
    "totalInvested"
  ).textContent =
    formatMoney(
      financials.invested
    );


  document.getElementById(
    "investmentValue"
  ).textContent =
    formatMoney(
      financials.currentValue
    );


  const gainElement =
    document.getElementById(
      "investmentGain"
    );


  gainElement.textContent =
    formatMoney(
      financials.investmentGain
    );


  gainElement.className =
    financials.investmentGain >= 0
      ? "income"
      : "expense";


  if (!investments.length) {

    container.innerHTML =
      `<p class="empty">
        No investments recorded yet.
      </p>`;

    return;
  }


  container.innerHTML =
    investments
      .map(
        investment => {

          const invested =
            Number(
              investment.amount
            ) || 0;

          const value =
            Number(
              investment.value
            ) || 0;

          const gain =
            value -
            invested;


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
                class="delete-btn"
                data-delete-investment="${
                  investment.id
                }"
                type="button"
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
// AI SNAPSHOT
// ======================================================

function updateAISnapshot() {

  const financials =
    calculateFinancials();


  document.getElementById(
    "aiIncome"
  ).textContent =
    formatMoney(
      financials.income
    );


  document.getElementById(
    "aiExpenses"
  ).textContent =
    formatMoney(
      financials.expenses
    );


  document.getElementById(
    "aiBalance"
  ).textContent =
    formatMoney(
      financials.balance
    );


  document.getElementById(
    "aiSavingsRate"
  ).textContent =
    `${Math.max(
      0,
      financials.savingsRate
    ).toFixed(1)}%`;
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


  const financials =
    calculateFinancials();


  const financialSnapshot = {

    income:
      financials.income,

    expenses:
      financials.expenses,

    balance:
      financials.balance,

    savingsRate:
      Number(
        financials.savingsRate.toFixed(
          1
        )
      ),

    investments:
      financials.invested,

    investmentValue:
      financials.currentValue,

    investmentGain:
      financials.investmentGain,

    savingsGoals:
      goals,

    transactions:
      transactions,

    investmentRecords:
      investments

  };


  try {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        20000
      );


    const response =
      await fetch(
        AI_URL,
        {
          method:
            "POST",

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


    let data;


    try {

      data =
        await response.json();

    } catch {

      data = {};
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
      "No response was returned.";

  } catch (error) {

    console.error(
      "MoneyMind AI error:",
      error
    );


    if (
      error.name ===
      "AbortError"
    ) {

      thinking.textContent =
        "MoneyMind AI took too long to respond. Please try again.";

    } else {

      thinking.textContent =
        "MoneyMind AI could not connect right now. Please try again.";
    }
  }


  chat.scrollTop =
    chat.scrollHeight;
}


// ======================================================
// CHAT MESSAGE
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
    `message ${type}`;

  div.textContent =
    message;


  container.appendChild(
    div
  );


  container.scrollTop =
    container.scrollHeight;
}


// ======================================================
// QUICK QUESTIONS
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
// EVENT LISTENERS
// ======================================================

function setupEventListeners() {


  // MENU

  document
    .getElementById(
      "menuButton"
    )
    ?.addEventListener(
      "click",
      toggleMenu
    );


  // AUTH

  document
    .getElementById(
      "loginButton"
    )
    ?.addEventListener(
      "click",
      loginUser
    );


  document
    .getElementById(
      "signupButton"
    )
    ?.addEventListener(
      "click",
      signupUser
    );


  document
    .getElementById(
      "showSignupButton"
    )
    ?.addEventListener(
      "click",
      showSignup
    );


  document
    .getElementById(
      "showLoginButton"
    )
    ?.addEventListener(
      "click",
      showLogin
    );


  document
    .getElementById(
      "logoutButton"
    )
    ?.addEventListener(
      "click",
      logoutUser
    );


  // NAVIGATION

  document
    .querySelectorAll(
      ".nav-item[data-section]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            showSection(
              button.dataset.section
            )
        );

      }
    );


  // DASHBOARD

  document
    .getElementById(
      "dashboardAddTransaction"
    )
    ?.addEventListener(
      "click",
      openTransactionModal
    );


  document
    .getElementById(
      "viewTransactionsButton"
    )
    ?.addEventListener(
      "click",
      () =>
        showSection(
          "transactions"
        )
    );


  // TRANSACTIONS

  document
    .getElementById(
      "transactionsAddButton"
    )
    ?.addEventListener(
      "click",
      openTransactionModal
    );


  document
    .getElementById(
      "saveTransactionButton"
    )
    ?.addEventListener(
      "click",
      addTransaction
    );


  // GOALS

  document
    .getElementById(
      "goalAddButton"
    )
    ?.addEventListener(
      "click",
      openGoalModal
    );


  document
    .getElementById(
      "saveGoalButton"
    )
    ?.addEventListener(
      "click",
      addGoal
    );


  // INVESTMENTS

  document
    .getElementById(
      "investmentAddButton"
    )
    ?.addEventListener(
      "click",
      openInvestmentModal
    );


  document
    .getElementById(
      "saveInvestmentButton"
    )
    ?.addEventListener(
      "click",
      addInvestment
    );


  // AI

  document
    .getElementById(
      "sendAIButton"
    )
    ?.addEventListener(
      "click",
      askAI
    );


  document
    .getElementById(
      "aiInput"
    )
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          askAI();
        }
      }
    );


  // AI SUGGESTIONS

  document
    .querySelectorAll(
      ".suggestions button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            quickQuestion(
              button.dataset.question
            )
        );

      }
    );


  // CLOSE MODALS

  document
    .querySelectorAll(
      "[data-close]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () =>
            closeModal(
              button.dataset.close
            )
        );

      }
    );


  // CLICK OUTSIDE MODAL

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


  // DELETE TRANSACTIONS

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-delete-transaction]"
        );

      if (!button) {
        return;
      }

      deleteTransaction(
        button.dataset.deleteTransaction
      );

    }
  );


  // DELETE GOALS

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-delete-goal]"
        );

      if (!button) {
        return;
      }

      deleteGoal(
        button.dataset.deleteGoal
      );

    }
  );


  // DELETE INVESTMENTS

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-delete-investment]"
        );

      if (!button) {
        return;
      }

      deleteInvestment(
        button.dataset.deleteInvestment
      );

    }
  );


  // CLOSE MENU WHEN CLICKING OUTSIDE

 function closeMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");

  if (!menu) {
    return;
  }

  menu.classList.remove("open");

  if (button) {
    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  console.log("Menu closed.");
}
// ======================================================
// SUPABASE AUTH LISTENER
// ======================================================

function setupAuthListener() {

  if (!supabaseClient) {
    return;
  }


  supabaseClient.auth.onAuthStateChange(
    (
      event,
      session
    ) => {

      console.log(
        "Auth event:",
        event
      );


      if (session) {

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
// INITIALIZE
// ======================================================

async function initializeApp() {

  console.log(
    "MoneyMind AI starting..."
  );


  transactions =
    Array.isArray(
      transactions
    )
      ? transactions
      : [];


  goals =
    Array.isArray(
      goals
    )
      ? goals
      : [];


  investments =
    Array.isArray(
      investments
    )
      ? investments
      : [];


  setupEventListeners();

  setupAuthListener();

  await checkAuth();


  console.log(
    "MoneyMind AI ready."
  );
}


// ======================================================
// START
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
