// =====================================================
// MONEYMIND AI - COMPLETE APPLICATION
// =====================================================

// =====================================================
// CONFIGURATION
// =====================================================

const supabaseClient = window.supabaseClient;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// =====================================================
// APPLICATION DATA
// =====================================================

let transactions = loadArray("mm_transactions");
let goals = loadArray("mm_goals");
let investments = loadArray("mm_investments");


// =====================================================
// LOCAL STORAGE
// =====================================================

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
      "Invalid stored data:",
      key
    );

    localStorage.removeItem(key);

    return [];

  } catch (error) {

    console.error(
      "Storage error:",
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


// =====================================================
// HELPERS
// =====================================================

function formatMoney(amount) {

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }
  ).format(
    Number(amount) || 0
  );
}


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


function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}


function ensureArrays() {

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  if (!Array.isArray(goals)) {
    goals = [];
  }

  if (!Array.isArray(investments)) {
    investments = [];
  }
}


// =====================================================
// MENU
// =====================================================

function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.getElementById("menuButton");

  if (!menu) {

    console.error(
      "MoneyMind: mobileMenu not found."
    );

    return;
  }

  const isOpen =
    menu.classList.toggle("open");

  menu.setAttribute(
    "aria-hidden",
    String(!isOpen)
  );

  if (button) {

    button.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    button.textContent =
      isOpen ? "✕" : "☰";
  }

  console.log(
    "MoneyMind menu:",
    isOpen ? "OPEN" : "CLOSED"
  );
}


// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId) {

  const section =
    document.getElementById(sectionId);

  if (!section) {

    console.error(
      "MoneyMind: section not found:",
      sectionId
    );

    return;
  }


  document
    .querySelectorAll(".section")
    .forEach(function(item) {

      item.classList.remove("active");

    });


  section.classList.add("active");


  closeMenu();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  console.log(
    "MoneyMind section:",
    sectionId
  );
}


function closeMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.getElementById("menuButton");

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

    button.textContent = "☰";
  }
}


// =====================================================
// AUTH
// =====================================================

async function checkAuth() {

  const authScreen =
    document.getElementById("authScreen");

  if (!authScreen) {
    return;
  }


  if (!supabaseClient) {

    console.error(
      "Supabase client unavailable."
    );

    authScreen.style.display =
      "flex";

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


    if (data.session) {

      authScreen.style.display =
        "none";

      console.log(
        "Logged in:",
        data.session.user.email
      );

    } else {

      authScreen.style.display =
        "flex";
    }

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    authScreen.style.display =
      "flex";
  }
}


// =====================================================
// SIGNUP
// =====================================================

async function signupUser() {

  const email =
    document
      .getElementById("signupEmail")
      ?.value
      .trim();

  const password =
    document
      .getElementById("signupPassword")
      ?.value;

  const message =
    document.getElementById(
      "authMessage"
    );


  if (!message) {
    return;
  }


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

      message.textContent =
        "Account created successfully.";

      await checkAuth();

    } else {

      message.textContent =
        "Account created. Check your email to confirm your account.";
    }

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    message.textContent =
      error.message ||
      "Unable to create account.";
  }
}


// =====================================================
// LOGIN
// =====================================================

async function loginUser() {

  const email =
    document
      .getElementById("loginEmail")
      ?.value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      ?.value;

  const message =
    document.getElementById(
      "authMessage"
    );


  if (!message) {
    return;
  }


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


    message.textContent =
      "Login successful.";

    console.log(
      "Logged in:",
      data.user?.email
    );


    await checkAuth();

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    message.textContent =
      error.message ||
      "Unable to log in.";
  }
}


// =====================================================
// LOGOUT
// =====================================================

async function logoutUser() {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {
      throw error;
    }


    closeMenu();

    console.log(
      "MoneyMind logged out."
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }
}


// =====================================================
// AUTH FORMS
// =====================================================

function showSignup() {

  document
    .getElementById("loginForm")
    ?.classList
    .add("hidden");

  document
    .getElementById("signupForm")
    ?.classList
    .remove("hidden");

  const message =
    document.getElementById(
      "authMessage"
    );

  if (message) {
    message.textContent = "";
  }
}


function showLogin() {

  document
    .getElementById("signupForm")
    ?.classList
    .add("hidden");

  document
    .getElementById("loginForm")
    ?.classList
    .remove("hidden");

  const message =
    document.getElementById(
      "authMessage"
    );

  if (message) {
    message.textContent = "";
  }
}


// =====================================================
// TRANSACTION MODAL
// =====================================================

function openTransactionModal() {

  document
    .getElementById("transactionModal")
    ?.classList
    .add("show");
}


// =====================================================
// ADD TRANSACTION
// =====================================================

function addTransaction() {

  ensureArrays();


  const type =
    document
      .getElementById("transactionType")
      ?.value ||
    "expense";


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
    document
      .getElementById("transactionCategory")
      ?.value ||
    "Other";


  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter a valid description and amount."
    );

    return;
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


  document
    .getElementById("transactionDescription")
    .value = "";

  document
    .getElementById("transactionAmount")
    .value = "";


  closeModal(
    "transactionModal"
  );


  renderTransactions();

  updateDashboard();
}


// =====================================================
// DELETE TRANSACTION
// =====================================================

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
      function(transaction) {

        return String(transaction.id) !==
          String(id);

      }
    );


  saveData();

  renderTransactions();

  updateDashboard();
}


// =====================================================
// RENDER TRANSACTIONS
// =====================================================

function transactionHTML(transaction, showDelete) {

  const sign =
    transaction.type === "income"
      ? "+"
      : "-";


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
            transaction.category || "Other"
          )}
          •
          ${formatDate(transaction.date)}
        </small>

      </div>

      <div class="${transaction.type}">
        ${sign}
        ${formatMoney(transaction.amount)}
      </div>

      ${
        showDelete
          ? `
            <button
              type="button"
              class="delete-btn"
              data-delete-transaction="${transaction.id}"
            >
              Delete
            </button>
          `
          : ""
      }

    </div>
  `;
}


function renderTransactions() {

  const container =
    document.getElementById(
      "allTransactions"
    );


  if (!container) {
    return;
  }


  if (transactions.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    transactions
      .map(function(transaction) {

        return transactionHTML(
          transaction,
          true
        );

      })
      .join("");
}


function renderRecentTransactions() {

  const container =
    document.getElementById(
      "recentTransactions"
    );


  if (!container) {
    return;
  }


  const recent =
    transactions.slice(0, 5);


  if (recent.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    recent
      .map(function(transaction) {

        return transactionHTML(
          transaction,
          false
        );

      })
      .join("");
}


// =====================================================
// GOALS
// =====================================================

function openGoalModal() {

  document
    .getElementById("goalModal")
    ?.classList
    .add("show");
}


function addGoal() {

  ensureArrays();


  const name =
    document
      .getElementById("goalName")
      ?.value
      .trim();


  const target =
    Number(
      document
        .getElementById("goalTarget")
        ?.value
    );


  const saved =
    Number(
      document
        .getElementById("goalSaved")
        ?.value
    ) || 0;


  if (
    !name ||
    !Number.isFinite(target) ||
    target <= 0
  ) {

    alert(
      "Please enter a valid goal name and target."
    );

    return;
  }


  goals.push({

    id:
      Date.now(),

    name:
      name,

    target:
      target,

    saved:
      Math.max(0, saved)

  });


  saveData();


  document.getElementById("goalName").value = "";
  document.getElementById("goalTarget").value = "";
  document.getElementById("goalSaved").value = "";


  closeModal("goalModal");

  renderGoals();

  updateDashboard();
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
      function(goal) {

        return String(goal.id) !==
          String(id);

      }
    );


  saveData();

  renderGoals();

  updateDashboard();
}


function renderGoals() {

  const container =
    document.getElementById(
      "goalsList"
    );


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
                  saved / target * 100
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
              data-delete-goal="${goal.id}"
            >
              Delete
            </button>

          </div>
        `;

      })
      .join("");
}


// =====================================================
// INVESTMENTS
// =====================================================

function openInvestmentModal() {

  document
    .getElementById("investmentModal")
    ?.classList
    .add("show");
}


function addInvestment() {

  ensureArrays();


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


  if (
    !name ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter a valid investment name and amount."
    );

    return;
  }


  investments.push({

    id:
      Date.now(),

    name:
      name,

    amount:
      amount,

    value:
      Number.isFinite(value) &&
      value >= 0
        ? value
        : amount

  });


  saveData();


  document.getElementById("investmentName").value = "";
  document.getElementById("investmentAmount").value = "";
  document.getElementById("investmentValue").value = "";


  closeModal(
    "investmentModal"
  );


  renderInvestments();

  updateDashboard();
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
      function(investment) {

        return String(investment.id) !==
          String(id);

      }
    );


  saveData();

  renderInvestments();

  updateDashboard();
}


function renderInvestments() {

  const container =
    document.getElementById(
      "investmentsList"
    );


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

            <strong class="${
              gain >= 0
                ? "income"
                : "expense"
            }">
              ${gain >= 0 ? "+" : ""}
              ${formatMoney(gain)}
            </strong>

            <br><br>

            <button
              type="button"
              class="delete-btn"
              data-delete-investment="${investment.id}"
            >
              Delete
            </button>

          </div>
        `;

      })
      .join("");
}


// =====================================================
// FINANCIAL CALCULATIONS
// =====================================================

function calculateFinancialSnapshot() {

  ensureArrays();


  const income =
    transactions
      .filter(function(transaction) {

        return transaction.type === "income";

      })
      .reduce(function(sum, transaction) {

        return sum +
          Number(transaction.amount) || 0;

      }, 0);


  const expenses =
    transactions
      .filter(function(transaction) {

        return transaction.type === "expense";

      })
      .reduce(function(sum, transaction) {

        return sum +
          Number(transaction.amount) || 0;

      }, 0);


  const balance =
    income - expenses;


  const savingsRate =
    income > 0
      ? balance / income * 100
      : 0;


  const invested =
    investments
      .reduce(function(sum, investment) {

        return sum +
          (Number(investment.amount) || 0);

      }, 0);


  const investmentValue =
    investments
      .reduce(function(sum, investment) {

        return sum +
          (Number(investment.value) || 0);

      }, 0);


  const investmentGain =
    investmentValue - invested;


  return {

    income,

    expenses,

    balance,

    savingsRate:
      Number(
        savingsRate.toFixed(1)
      ),

    invested,

    investmentValue,

    investmentGain,

    transactionCount:
      transactions.length,

    goalCount:
      goals.length,

    investmentCount:
      investments.length,

    goals:
      goals,

    transactions:
      transactions,

    investments:
      investments

  };
}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

  const snapshot =
    calculateFinancialSnapshot();


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

  const investmentElement =
    document.getElementById(
      "totalInvestments"
    );

  const savingsRateElement =
    document.getElementById(
      "savingsRate"
    );

  const investmentGainElement =
    document.getElementById(
      "investmentGain"
    );

  const goalCountElement =
    document.getElementById(
      "goalCount"
    );


  if (incomeElement) {
    incomeElement.textContent =
      formatMoney(snapshot.income);
  }

  if (expenseElement) {
    expenseElement.textContent =
      formatMoney(snapshot.expenses);
  }

  if (balanceElement) {
    balanceElement.textContent =
      formatMoney(snapshot.balance);
  }

  if (investmentElement) {
    investmentElement.textContent =
      formatMoney(snapshot.investmentValue);
  }

  if (savingsRateElement) {
    savingsRateElement.textContent =
      snapshot.savingsRate + "%";
  }

  if (investmentGainElement) {
    investmentGainElement.textContent =
      formatMoney(snapshot.investmentGain);
  }

  if (goalCountElement) {
    goalCountElement.textContent =
      snapshot.goalCount;
  }


  updateHealth(
    snapshot.income,
    snapshot.expenses
  );


  renderRecentTransactions();
}


// =====================================================
// FINANCIAL HEALTH
// =====================================================

function updateHealth(
  income,
  expenses
) {

  let score = 0;


  if (income > 0) {

    const rate =
      (income - expenses) /
      income *
      100;


    if (rate >= 30) {

      score = 100;

    } else if (rate >= 20) {

      score = 85;

    } else if (rate >= 10) {

      score = 70;

    } else if (rate >= 0) {

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
      "Your current savings position is strong.";

  } else if (score >= 70) {

    title.textContent =
      "Good financial health";

    message.textContent =
      "You're building a reasonable financial position.";

  } else if (score >= 50) {

    title.textContent =
      "Needs attention";

    message.textContent =
      "Your expenses are taking a significant portion of your income.";

  } else if (score > 0) {

    title.textContent =
      "Warning";

    message.textContent =
      "Your current expenses are higher than your income.";

  } else {

    title.textContent =
      "Let's get started";

    message.textContent =
      "Add your income and expenses to see your financial health.";
  }
}


// =====================================================
// AI CHAT
// =====================================================

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
    document.createElement("div");


  div.className =
    "message " + type;


  div.textContent =
    message;


  container.appendChild(div);


  container.scrollTop =
    container.scrollHeight;
}


// =====================================================
// PERSONALIZED AI SUMMARY
// =====================================================

function updateAISummary(snapshot) {

  const element =
    document.getElementById(
      "personalizedSummary"
    );


  if (!element) {
    return;
  }


  let status;


  if (snapshot.income <= 0) {

    status =
      "I need your income and expense information before I can provide a detailed personal analysis.";

  } else if (snapshot.savingsRate >= 20) {

    status =
      `Your current savings rate is ${snapshot.savingsRate}%. You are currently saving ${formatMoney(snapshot.balance)} based on the transactions recorded.`;

  } else if (snapshot.balance >= 0) {

    status =
      `You currently have ${formatMoney(snapshot.balance)} left after recorded expenses. Your savings rate is ${snapshot.savingsRate}%, so there may be room to improve your monthly savings.`;

  } else {

    status =
      `Your recorded expenses exceed your income by ${formatMoney(Math.abs(snapshot.balance))}. Reducing expenses should be a priority.`;
  }


  element.innerHTML = `
    <strong>Your personalized financial analysis</strong>

    <p>
      ${escapeHTML(status)}
    </p>
  `;
}


// =====================================================
// ASK AI
// =====================================================

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
      "AI interface not found."
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
    "MoneyMind AI is analyzing your finances...";


  chat.appendChild(
    thinking
  );


  chat.scrollTop =
    chat.scrollHeight;


  const financialSnapshot =
    calculateFinancialSnapshot();


  updateAISummary(
    financialSnapshot
  );


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
      25000
    );


  try {

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


    clearTimeout(timeout);


    let data = {};


    try {

      data =
        await response.json();

    } catch (error) {

      console.warn(
        "AI response was not JSON."
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


    thinking.textContent =
      data.reply ||
      data.message ||
      "MoneyMind AI did not return an answer.";


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
        "MoneyMind AI took too long to respond. Please try again.";

    } else {

      thinking.textContent =
        "MoneyMind AI could not connect right now. Please try again.";
    }
  }


  chat.scrollTop =
    chat.scrollHeight;
}


// =====================================================
// QUICK QUESTIONS
// =====================================================

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


// =====================================================
// MODALS
// =====================================================

function closeModal(id) {

  const modal =
    document.getElementById(id);


  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

  // MENU

  const menuButton =
    document.getElementById(
      "menuButton"
    );


  if (menuButton) {

    menuButton.addEventListener(
      "click",
      toggleMenu
    );
  }


  // NAVIGATION

  document
    .querySelectorAll(
      "#mobileMenu [data-section]"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          showSection(
            button.dataset.section
          );

        }
      );

    });


  // LOGOUT

  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logoutUser
    );
  }


  // QUICK QUESTIONS

  document
    .querySelectorAll(
      "[data-question]"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          quickQuestion(
            button.dataset.question
          );

        }
      );

    });


  // ENTER KEY FOR AI

  const aiInput =
    document.getElementById(
      "aiInput"
    );


  if (aiInput) {

    aiInput.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          askAI();
        }

      }
    );
  }


  // DELETE TRANSACTIONS

  document.addEventListener(
    "click",
    function(event) {

      const transactionButton =
        event.target.closest(
          "[data-delete-transaction]"
        );


      if (transactionButton) {

        deleteTransaction(
          transactionButton.dataset
            .deleteTransaction
        );

        return;
      }


      const goalButton =
        event.target.closest(
          "[data-delete-goal]"
        );


      if (goalButton) {

        deleteGoal(
          goalButton.dataset
            .deleteGoal
        );

        return;
      }


      const investmentButton =
        event.target.closest(
          "[data-delete-investment]"
        );


      if (investmentButton) {

        deleteInvestment(
          investmentButton.dataset
            .deleteInvestment
        );

      }

    }
  );


  // CLOSE MENU WHEN CLICKING OUTSIDE

  document.addEventListener(
    "click",
    function(event) {

      const menu =
        document.getElementById(
          "mobileMenu"
        );

      const button =
        document.getElementById(
          "menuButton"
        );


      if (
        !menu ||
        !button
      ) {
        return;
      }


      if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
      ) {

        closeMenu();

      }

    }
  );


  // CLOSE MODALS

  document.addEventListener(
    "click",
    function(event) {

      if (
        event.target.classList.contains(
          "modal"
        )
      ) {

        event.target.classList.remove(
          "show"
        );
      }

    }
  );


  // ESCAPE KEY

  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeMenu();


        document
          .querySelectorAll(".modal.show")
          .forEach(function(modal) {

            modal.classList.remove(
              "show"
            );

          });

      }

    }
  );
}


// =====================================================
// AUTH STATE
// =====================================================

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


// =====================================================
// INITIALIZE
// =====================================================

async function initializeApp() {

  console.log(
    "MoneyMind AI starting..."
  );


  ensureArrays();


  setupEventListeners();


  setupAuthListener();


  await checkAuth();


  updateDashboard();

  renderTransactions();

  renderGoals();

  renderInvestments();


  updateAISummary(
    calculateFinancialSnapshot()
  );


  console.log(
    "MoneyMind AI ready."
  );
}


// =====================================================
// EXPOSE PUBLIC FUNCTIONS
// =====================================================

window.toggleMenu =
  toggleMenu;

window.showSection =
  showSection;

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


// =====================================================
// START
// =====================================================

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
