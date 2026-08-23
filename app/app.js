// ======================================================
// MONEYMIND AI - COMPLETE WORKING APP.JS
// ======================================================

"use strict";

// ======================================================
// SUPABASE
// ======================================================

const supabaseClient = window.supabaseClient || null;

const AI_URL =
  "https://pgbetpprhyrplrzxjzvb.supabase.co/functions/v1/smart-responder";


// ======================================================
// DATA
// ======================================================

function loadArray(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];

  } catch (error) {
    console.error("Could not load:", key, error);
    return [];
  }
}


let transactions = loadArray("mm_transactions");
let goals = loadArray("mm_goals");
let investments = loadArray("mm_investments");


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
// AUTH MESSAGE
// ======================================================

function showAuthMessage(message) {

  const element =
    document.getElementById("authMessage");

  if (element) {
    element.textContent = message || "";
  }
}


// ======================================================
// SHOW APPLICATION
// ======================================================

function showApplication(user) {

  const authScreen =
    document.getElementById("authScreen");

  if (authScreen) {
    authScreen.style.display = "none";
  }

  console.log(
    "Logged in:",
    user?.email || "user"
  );
}


// ======================================================
// SHOW AUTHENTICATION
// ======================================================

function showAuthentication() {

  const authScreen =
    document.getElementById("authScreen");

  if (authScreen) {
    authScreen.style.display = "flex";
  }
}


// ======================================================
// CHECK AUTH
// ======================================================

async function checkAuth() {

  if (!supabaseClient) {

    console.error(
      "Supabase client not found."
    );

    showAuthentication();

    showAuthMessage(
      "Authentication service unavailable."
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


    if (data?.session) {

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
// LOGIN
// ======================================================

async function loginUser() {

  const emailInput =
    document.getElementById("loginEmail");

  const passwordInput =
    document.getElementById("loginPassword");


  if (!emailInput || !passwordInput) {

    console.error(
      "Login fields not found."
    );

    return;
  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


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


    console.log(
      "Login successful:",
      data?.user?.email
    );


    showAuthMessage(
      "Login successful."
    );


    if (data?.user) {

      showApplication(
        data.user
      );

    }

  } catch (error) {

    console.error(
      "Login failed:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to log in."
    );

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


  if (!emailInput || !passwordInput) {
    return;
  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


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
    "Creating account..."
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


    if (data?.session) {

      showAuthMessage(
        "Account created successfully."
      );

      showApplication(
        data.user
      );

    } else {

      showAuthMessage(
        "Account created. Check your email to confirm your account."
      );

    }

  } catch (error) {

    console.error(
      "Signup failed:",
      error
    );

    showAuthMessage(
      error.message ||
      "Unable to create account."
    );

  }
}


// ======================================================
// AUTH SCREEN SWITCH
// ======================================================

function showSignup() {

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");


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
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");


  if (signupForm) {
    signupForm.style.display = "none";
  }

  if (loginForm) {
    loginForm.style.display = "block";
  }

  showAuthMessage("");
}


// ======================================================
// MENU
// ======================================================

function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");


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

    if (button) {

      button.setAttribute(
        "aria-expanded",
        "false"
      );

    }

    console.log(
      "Menu closed."
    );

  } else {

    menu.classList.add("open");

    if (button) {

      button.setAttribute(
        "aria-expanded",
        "true"
      );

    }

    console.log(
      "Menu opened."
    );
  }
}


// ======================================================
// CLOSE MENU
// ======================================================

function closeMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");


  if (menu) {
    menu.classList.remove("open");
  }


  if (button) {

    button.setAttribute(
      "aria-expanded",
      "false"
    );

  }
}


// ======================================================
// SHOW SECTION
// ======================================================

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".section");


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


  closeMenu();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

  const value =
    Number(amount) || 0;


  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }
  ).format(value);
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

function calculateFinancials() {

  const income =
    transactions
      .filter(
        transaction =>
          transaction.type === "income"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          Number(transaction.amount || 0),
        0
      );


  const expenses =
    transactions
      .filter(
        transaction =>
          transaction.type === "expense"
      )
      .reduce(
        (sum, transaction) =>
          sum +
          Number(transaction.amount || 0),
        0
      );


  return {
    income,
    expenses,
    balance: income - expenses
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
      ((income - expenses) / income) *
      100;


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
      "You're doing well. Consider increasing your savings.";

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
      "Please enter a valid description and amount."
    );

    return;
  }


  transactions.unshift({

    id: Date.now(),

    type,

    description,

    amount,

    category,

    date:
      new Date().toISOString()

  });


  saveData();


  document.getElementById(
    "transactionDescription"
  ).value = "";


  document.getElementById(
    "transactionAmount"
  ).value = "";


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


  if (transactions.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    transactions
      .map(
        transaction => {

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
                ${sign}${formatMoney(
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
    transactions.slice(0, 5);


  if (recent.length === 0) {

    container.innerHTML =
      '<p class="empty">No transactions yet.</p>';

    return;
  }


  container.innerHTML =
    recent
      .map(
        transaction => {

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
                ${sign}${formatMoney(
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
// GOALS
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

    id: Date.now(),

    name,

    target,

    saved:
      Math.max(0, saved)

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


  if (goals.length === 0) {

    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';

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


  investments.push({

    id: Date.now(),

    name,

    amount,

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
      "Delete this investment?"
    )
  ) {
    return;
  }


  investments =
    investments.filter(
      investment =>
        String(investment.id) !==
        String(id)
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


  if (investments.length === 0) {

    container.innerHTML =
      '<p class="empty">No investments recorded yet.</p>';

    return;
  }


  container.innerHTML =
    investments
      .map(
        investment => {

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
                class="delete-btn"
                onclick="window.deleteInvestment(${investment.id})"
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
    "MoneyMind AI is thinking...";


  chat.appendChild(
    thinking
  );


  chat.scrollTop =
    chat.scrollHeight;


  const financials =
    calculateFinancials();


  const savingsRate =
    financials.income > 0
      ? (
          financials.balance /
          financials.income
        ) * 100
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


  const investmentValue =
    investments.reduce(
      (sum, investment) =>
        sum +
        Number(
          investment.value || 0
        ),
      0
    );


  const financialSnapshot = {

    income:
      financials.income,

    expenses:
      financials.expenses,

    balance:
      financials.balance,

    savingsRate:
      Number(
        savingsRate.toFixed(1)
      ),

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


  try {

    const controller =
      new AbortController();


    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        15000
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


    clearTimeout(timeout);


    const data =
      await response.json()
        .catch(
          () => ({})
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
      "I could not generate a response.";


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
        "The AI request timed out. Please try again.";

    } else {

      thinking.textContent =
        "MoneyMind AI could not connect right now.";

    }

  }


  chat.scrollTop =
    chat.scrollHeight;
}


// ======================================================
// QUICK QUESTION
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
    document.getElementById(id);


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }
}


// ======================================================
// CLICK OUTSIDE MODAL
// ======================================================

document.addEventListener(
  "click",
  function(event) {

    if (
      event.target.classList &&
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


// ======================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// ======================================================

document.addEventListener(
  "click",
  function(event) {

    const menu =
      document.getElementById(
        "mobileMenu"
      );

    const button =
      document.querySelector(
        ".menu-btn"
      );


    if (!menu || !button) {
      return;
    }


    if (
      menu.classList.contains("open") &&
      !menu.contains(event.target) &&
      !button.contains(event.target)
    ) {

      closeMenu();

    }

  }
);


// ======================================================
// ESCAPE KEY
// ======================================================

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape"
    ) {

      closeMenu();

      document
        .querySelectorAll(".modal.show")
        .forEach(
          modal =>
            modal.classList.remove(
              "show"
            )
        );

    }

  }
);


// ======================================================
// AUTH STATE
// ======================================================

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    function(event, session) {

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


  updateDashboard();

  renderTransactions();

  renderGoals();

  renderInvestments();


  await checkAuth();


  console.log(
    "MoneyMind AI ready."
  );
}


// ======================================================
// IMPORTANT:
// EXPOSE ALL FUNCTIONS TO HTML
// ======================================================

window.loginUser =
  loginUser;

window.signupUser =
  signupUser;

window.showSignup =
  showSignup;

window.showLogin =
  showLogin;

window.checkAuth =
  checkAuth;

window.toggleMenu =
  toggleMenu;

window.closeMenu =
  closeMenu;

window.showSection =
  showSection;

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

window.updateDashboard =
  updateDashboard;


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


console.log(
  "MoneyMind app.js loaded successfully."
);
