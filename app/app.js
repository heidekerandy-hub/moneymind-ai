// ======================================================
// MONEY MIND AI - CLEAN COMPLETE APP.JS
// ======================================================

// ======================================================
// SUPABASE
// ======================================================

const supabaseClient = window.supabaseClient;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ======================================================
// DATA STORAGE
// ======================================================

function loadArray(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    // IMPORTANT:
    // Only accept arrays.
    // This prevents:
    // transactions.filter is not a function

    if (Array.isArray(parsed)) {
      return parsed;
    }

    console.warn(
      key + " was not an array. Resetting it."
    );

    localStorage.removeItem(key);

    return [];

  } catch (error) {

    console.error(
      "Error loading " + key,
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
// AUTHENTICATION
// ======================================================

async function checkAuth() {

  const authScreen =
    document.getElementById("authScreen");

  if (!authScreen) {
    return;
  }

  if (!supabaseClient) {

    console.error(
      "Supabase client is missing."
    );

    authScreen.style.display = "flex";

    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

      authScreen.style.display = "flex";

      return;
    }

    if (data.session) {

      authScreen.style.display = "none";

      console.log(
        "Logged in:",
        data.session.user.email
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

  if (!emailInput || !passwordInput || !message) {
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

    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

    if (error) {

      console.error(
        "Signup error:",
        error
      );

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

  if (!emailInput || !passwordInput || !message) {
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

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

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
      data.user?.email
    );

    message.textContent =
      "Login successful.";

    const authScreen =
      document.getElementById("authScreen");

    if (authScreen) {
      authScreen.style.display = "none";
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
// AUTH SCREEN
// ======================================================

function showSignup() {

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  const message =
    document.getElementById("authMessage");

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
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  const message =
    document.getElementById("authMessage");

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
// NAVIGATION
// ======================================================

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".section");

  sections.forEach(function(section) {

    section.classList.remove("active");

  });

  const section =
    document.getElementById(sectionId);

  if (section) {

    section.classList.add("active");

  } else {

    console.warn(
      "Section not found:",
      sectionId
    );

    return;
  }

  const menu =
    document.getElementById("mobileMenu");

  if (menu) {
    menu.style.display = "none";
  }

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
    document.getElementById("mobileMenu");

  if (!menu) {

    console.warn(
      "mobileMenu element not found."
    );

    return;
  }

  const current =
    window.getComputedStyle(menu).display;

  if (current === "none") {

    menu.style.display = "flex";

  } else {

    menu.style.display = "none";
  }
}


// ======================================================
// FORMAT MONEY
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
// FORMAT DATE
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
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

  // Safety check

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
          Number(transaction.amount || 0);

      }, 0);


  const expenses =
    transactions
      .filter(function(transaction) {

        return transaction.type === "expense";

      })
      .reduce(function(sum, transaction) {

        return sum +
          Number(transaction.amount || 0);

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


  updateHealth(
    income,
    expenses
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
    document.getElementById("healthScore");

  const title =
    document.getElementById("healthTitle");

  const message =
    document.getElementById("healthMessage");


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

    modal.classList.add("show");
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

    id: Date.now(),

    type: type,

    description: description,

    amount: amount,

    category: category,

    date: new Date().toISOString()

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


  if (!Array.isArray(transactions)) {
    transactions = [];
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
// RENDER ALL TRANSACTIONS
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
      .map(function(transaction) {

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
                ${formatDate(
                  transaction.date
                )}
              </small>

            </div>

            <div class="${transaction.type}">
              ${sign}
              ${formatMoney(
                transaction.amount
              )}
            </div>

            <button
              class="delete-btn"
              onclick="window.deleteTransaction(${transaction.id})"
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
      .map(function(transaction) {

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
                ${formatDate(
                  transaction.date
                )}
              </small>

            </div>

            <div class="${transaction.type}">
              ${sign}
              ${formatMoney(
                transaction.amount
              )}
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
    document.getElementById(
      "goalModal"
    );

  if (modal) {
    modal.classList.add("show");
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

    id: Date.now(),

    name: name,

    target: target,

    saved: Math.max(0, saved)

  });


  saveData();


  document.getElementById(
    "goalName"
  ).value = "";

  document.getElementById(
    "goalTarget"
  ).value = "";

  document.getElementById(
    "goalSaved"
  ).value = "";


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


  if (!Array.isArray(goals)) {
    goals = [];
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
              onclick="window.deleteGoal(${goal.id})"
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
    document.getElementById(
      "investmentModal"
    );

  if (modal) {
    modal.classList.add("show");
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

    id: Date.now(),

    name: name,

    amount: amount,

    value:
      value > 0
        ? value
        : amount

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

        return String(investment.id) !==
          String(id);

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
      .map(function(investment) {

        const invested =
          Number(
            investment.amount || 0
          );


        const value =
          Number(
            investment.value || 0
          );


        const gain =
          value - invested;


        return `
          <div class="investment">

            <h3>
              ${escapeHTML(
                investment.name
              )}
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
              class="delete-btn"
              onclick="window.deleteInvestment(${investment.id})"
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


  // Show user's message

  addChatMessage(
    question,
    "user"
  );


  input.value = "";


  // AI thinking message

  const thinking =
    document.createElement("div");

  thinking.className =
    "message ai";

  thinking.textContent =
    "MoneyMind AI is thinking...";

  chat.appendChild(
    thinking
  );


  chat.scrollTop =
    chat.scrollHeight;


  // ====================================================
  // ALWAYS GUARANTEE ARRAYS
  // ====================================================

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  if (!Array.isArray(goals)) {
    goals = [];
  }

  if (!Array.isArray(investments)) {
    investments = [];
  }


  // ====================================================
  // CALCULATE FINANCIAL DATA
  // ====================================================

  const income =
    transactions
      .filter(function(transaction) {

        return transaction.type === "income";

      })
      .reduce(function(sum, transaction) {

        return sum +
          Number(transaction.amount || 0);

      }, 0);


  const expenses =
    transactions
      .filter(function(transaction) {

        return transaction.type === "expense";

      })
      .reduce(function(sum, transaction) {

        return sum +
          Number(transaction.amount || 0);

      }, 0);


  const balance =
    income - expenses;


  const savingsRate =
    income > 0
      ? (balance / income) * 100
      : 0;


  const invested =
    investments.reduce(
      function(sum, investment) {

        return sum +
          Number(
            investment.amount || 0
          );

      },
      0
    );


  const investmentValue =
    investments.reduce(
      function(sum, investment) {

        return sum +
          Number(
            investment.value || 0
          );

      },
      0
    );


  const investmentGain =
    investmentValue -
    invested;


  const financialSnapshot = {

    income: income,

    expenses: expenses,

    balance: balance,

    savingsRate:
      Number(
        savingsRate.toFixed(1)
      ),

    investments: invested,

    investmentValue:
      investmentValue,

    investmentGain:
      investmentGain,

    savingsGoals:
      goals,

    transactions:
      transactions,

    investmentRecords:
      investments

  };


  // ====================================================
  // CHECK AI URL
  // ====================================================

  if (!AI_URL) {

    thinking.textContent =
      "AI service is not configured.";

    return;
  }


  // ====================================================
  // CALL SUPABASE EDGE FUNCTION
  // ====================================================

  let controller =
    new AbortController();


  let timeout =
    setTimeout(function() {

      controller.abort();

    }, 15000);


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

    } catch (jsonError) {

      console.warn(
        "AI returned non-JSON response."
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
    document.createElement("div");

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
    document.getElementById(id);

  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


// ======================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener(
  "click",
  function(event) {

    document
      .querySelectorAll(".modal")
      .forEach(function(modal) {

        if (
          event.target === modal
        ) {

          modal.classList.remove(
            "show"
          );
        }

      });

  }
);


// ======================================================
// INITIALIZE APP
// ======================================================

async function initializeApp() {

  console.log(
    "MoneyMind AI starting..."
  );


  // Make sure old/broken data cannot crash the app

  if (!Array.isArray(transactions)) {
    transactions = [];
  }

  if (!Array.isArray(goals)) {
    goals = [];
  }

  if (!Array.isArray(investments)) {
    investments = [];
  }


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
// AUTH STATE LISTENER
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
// EXPOSE FUNCTIONS TO HTML
//
// IMPORTANT:
// All onclick="..." functions are
// attached to window here.
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
// START WHEN PAGE LOADS
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

