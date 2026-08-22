// ============================
// MoneyMind AI
// ============================

let transactions = JSON.parse(localStorage.getItem("mm_transactions")) || [];
let goals = JSON.parse(localStorage.getItem("mm_goals")) || [];
let investments = JSON.parse(localStorage.getItem("mm_investments")) || [];


// ============================
// MONEY FORMAT
// ============================

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}


// ============================
// AI ASSISTANT
// ============================

function askAI() {

  const input = document.getElementById("aiInput");
  const chat = document.getElementById("chatMessages");

  if (!input || !chat) {
    console.log("AI elements not found.");
    return;
  }

  const question = input.value.trim();

  if (!question) {
    return;
  }

  // Show user's question
  const userMessage = document.createElement("div");

  userMessage.className = "message user";
  userMessage.textContent = question;

  chat.appendChild(userMessage);

  input.value = "";

  // Generate response
  const response = generateFinancialAdvice(question);

  // Show AI response
  setTimeout(function() {

    const aiMessage = document.createElement("div");

    aiMessage.className = "message ai";
    aiMessage.textContent = response;

    chat.appendChild(aiMessage);

    chat.scrollTop = chat.scrollHeight;

  }, 400);
}


// ============================
// QUICK QUESTIONS
// ============================

function quickQuestion(question) {

  const input = document.getElementById("aiInput");

  if (!input) {
    return;
  }

  input.value = question;

  askAI();
}


// ============================
// FINANCIAL ADVICE
// ============================

function generateFinancialAdvice(question) {

  const q = question.toLowerCase();

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;


  if (
    q.includes("expense") ||
    q.includes("spending") ||
    q.includes("reduce")
  ) {

    if (expenses > income && income > 0) {

      return "Your expenses are currently higher than your recorded income. Start by identifying your three biggest expenses and reduce non-essential spending first.";

    }

    return "To reduce expenses, track your spending for 30 days, separate needs from wants, and set weekly spending limits. Start with your biggest spending category.";

  }


  if (
    q.includes("save") ||
    q.includes("saving")
  ) {

    if (income <= 0) {

      return "Add your income first and I'll help you calculate a realistic monthly savings target.";

    }

    const suggested = income * 0.20;

    return "A good starting target is around 20% of your income. Based on your recorded income, that is approximately " + formatMoney(suggested) + " per month.";

  }


  if (q.includes("budget")) {

    return "A simple budget is: pay essential bills first, save a portion of your income, then use the remaining money for flexible spending. Review your budget every week.";

  }


  if (q.includes("invest")) {

    return "Before investing, consider building an emergency fund and paying down expensive debt. Then choose investments based on your goals, time horizon and risk tolerance.";

  }


  if (
    q.includes("balance") ||
    q.includes("money")
  ) {

    return "Your recorded income is " +
      formatMoney(income) +
      ", your expenses are " +
      formatMoney(expenses) +
      ", and your balance is " +
      formatMoney(balance) +
      ".";

  }


  return "I'm MoneyMind AI. I can help you with budgeting, saving, expenses, investments and financial goals. Ask me something like: How can I reduce my expenses?";

}


// ============================
// MAKE FUNCTIONS AVAILABLE
// ============================

window.askAI = askAI;
window.quickQuestion = quickQuestion;
window.generateFinancialAdvice = generateFinancialAdvice;
window.formatMoney = formatMoney;


