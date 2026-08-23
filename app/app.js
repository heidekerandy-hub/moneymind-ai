// ==========================================
// MONEY MIND AUTHENTICATION
// ==========================================

async function askAI() {

  const input =
    document.getElementById("aiInput");

  const chat =
    document.getElementById("chatMessages");

  if (!input || !chat) {
    console.error("MoneyMind AI elements not found.");
    return;
  }

  const question =
    input.value.trim();

  if (!question) return;

  // Show user's question
  addChatMessage(question, "user");

  input.value = "";

  // Show thinking message
  const thinking =
    document.createElement("div");

  thinking.className = "message ai";
  thinking.textContent = "MoneyMind AI is analyzing your finances...";

  chat.appendChild(thinking);

  chat.scrollTop = chat.scrollHeight;

  // Calculate financial snapshot
  const income =
    transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses =
    transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance =
    income - expenses;

  const savingsRate =
    income > 0
      ? ((balance / income) * 100)
      : 0;

  const invested =
    investments.reduce(
      (sum, investment) =>
        sum + Number(investment.amount || 0),
      0
    );

  const investmentValue =
    investments.reduce(
      (sum, investment) =>
        sum + Number(investment.value || 0),
      0
    );

  const investmentGain =
    investmentValue - invested;

  const financialSnapshot = {

    income: income,

    expenses: expenses,

    balance: balance,

    savingsRate:
      Number(savingsRate.toFixed(1)),

    investments: invested,

    investmentValue: investmentValue,

    investmentGain: investmentGain,

    savingsGoals: goals,

    transactions: transactions,

    investmentRecords: investments

  };

  try {

    const response =
      await fetch(AI_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: question,

          financialData:
            financialSnapshot

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
      "I couldn't generate a response.";

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
}window.showSignup = showSignup;
window.showLogin = showLogin;
window.signupUser = signupUser;
window.loginUser = loginUser;

// ==========================================
// AUTH BUTTON FUNCTIONS
// ==========================================

window.showSignup = function () {

  document.getElementById("loginForm").style.display = "none";

  document.getElementById("signupForm").style.display = "block";

  document.getElementById("authMessage").textContent = "";
};


window.showLogin = function () {

  document.getElementById("signupForm").style.display = "none";

  document.getElementById("loginForm").style.display = "block";

  document.getElementById("authMessage").textContent = "";
};


window.signupUser = signupUser;
window.loginUser = loginUser;
window.toggleMenu = toggleMenu;
window.showSection = showSection;

window.openTransactionModal = openTransactionModal;
window.addTransaction = addTransaction;
window.deleteTransaction = deleteTransaction;

window.openGoalModal = openGoalModal;
window.addGoal = addGoal;
window.deleteGoal = deleteGoal;

window.openInvestmentModal = openInvestmentModal;
window.addInvestment = addInvestment;
window.deleteInvestment = deleteInvestment;

window.askAI = askAI;
window.quickQuestion = quickQuestion;

window.closeModal = closeModal;

window.showSignup = showSignup;
window.showLogin = showLogin;
window.signupUser = signupUser;
window.loginUser = loginUser;
