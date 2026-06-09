const API_BASE = "http://127.0.0.1:8000";

let conversationHistory = [];

// Drag and drop
const uploadBox = document.getElementById("upload-box");
const fileInput = document.getElementById("file-input");

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    fileInput.files = e.dataTransfer.files;
    document.getElementById("file-name").textContent = "✅ " + file.name;
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) {
    document.getElementById("file-name").textContent = "✅ " + fileInput.files[0].name;
  }
});

async function analyzeResume() {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload a PDF resume first.");
    return;
  }

  const role = document.getElementById("role-select").value;
  const experience = document.getElementById("experience-select").value;
  const jd = document.getElementById("jd-input").value;

  // Show loading state
  document.getElementById("analyze-btn").disabled = true;
  document.getElementById("btn-text").classList.add("hidden");
  document.getElementById("btn-loader").classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jd);
  formData.append("role", role);
  formData.append("experience_level", experience);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    renderResults(data);

  } catch (err) {
    alert("Could not connect to backend. Make sure it is running on port 8000.");
    console.error(err);
  } finally {
    document.getElementById("analyze-btn").disabled = false;
    document.getElementById("btn-text").classList.remove("hidden");
    document.getElementById("btn-loader").classList.add("hidden");
  }
}

function renderResults(data) {
  // Show results section
  document.getElementById("results-section").classList.remove("hidden");
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });

  // ATS Score animation
  animateScore(data.ats_score || 0);

  // Score reasoning
  document.getElementById("score-reasoning").textContent = data.score_reasoning || "";

  // Strengths
  const strengthsEl = document.getElementById("strengths-list");
  strengthsEl.innerHTML = (data.strengths || []).map(s =>
    `<div class="strength-item">✓ ${s}</div>`
  ).join("");

  // Keyword bar
  const pct = data.keyword_match_percentage || 0;
  document.getElementById("keyword-pct").textContent = pct + "%";
  setTimeout(() => {
    document.getElementById("keyword-bar").style.width = pct + "%";
  }, 300);

  // Matched keywords
  document.getElementById("matched-keywords").innerHTML =
    (data.matched_keywords || []).map(k =>
      `<span class="pill pill-matched">${k}</span>`
    ).join("");

  // Missing keywords
  document.getElementById("missing-keywords").innerHTML =
    (data.missing_keywords || []).map(k =>
      `<span class="pill pill-missing">${k}</span>`
    ).join("");

  // Issues
  document.getElementById("issues-list").innerHTML =
    (data.issues || []).map(issue => `
      <div class="issue-item">
        <div class="issue-dot dot-${issue.type}"></div>
        <div class="issue-content">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description}</div>
        </div>
      </div>
    `).join("");

  // Quick wins
  document.getElementById("quick-wins-list").innerHTML =
    (data.quick_wins || []).map(win =>
      `<div class="quick-win-item">⚡ ${win}</div>`
    ).join("");

  // Scaler recommendations
  document.getElementById("scaler-cards").innerHTML =
    (data.scaler_recommendations || []).map(rec => `
      <div class="scaler-card">
        <div class="scaler-card-title">${rec.course_name}</div>
        <div class="scaler-card-gap">Skill Gap: ${rec.skill_gap}</div>
        <div class="scaler-card-reason">${rec.reason}</div>
        <div class="scaler-card-footer">
          <span class="scaler-weeks">~${rec.estimated_weeks} weeks</span>
          <a href="${rec.scaler_url}" target="_blank" class="scaler-link">View Course →</a>
        </div>
      </div>
    `).join("");

  // Reset chat
  conversationHistory = [];
  document.getElementById("chat-messages").innerHTML = `
    <div class="chat-bubble bot-bubble">
      ✅ Resume analyzed! I now have full context of your resume. Ask me anything — how to improve it, what skills to add, or how to prepare for your target role.
    </div>
  `;
}

function animateScore(targetScore) {
  const circle = document.getElementById("score-circle");
  const numberEl = document.getElementById("score-number");
  const circumference = 314;

  let current = 0;
  const duration = 1200;
  const increment = targetScore / (duration / 16);

  // Color based on score
  let color = "#dc2626";
  if (targetScore >= 75) color = "#16a34a";
  else if (targetScore >= 50) color = "#d97706";
  circle.style.stroke = color;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
    }
    const offset = circumference - (current / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    numberEl.textContent = Math.round(current);
  }, 16);
}

async function sendChat() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";

  const messagesEl = document.getElementById("chat-messages");

  // Add user bubble
  messagesEl.innerHTML += `<div class="chat-bubble user-bubble">${message}</div>`;
  messagesEl.innerHTML += `<div class="chat-bubble bot-bubble" id="typing">...</div>`;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  conversationHistory.push({ role: "user", content: message });

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: conversationHistory,
      }),
    });

    const data = await res.json();
    const reply = data.reply || "Sorry, I couldn't process that.";

    // Remove typing indicator and add real reply
    document.getElementById("typing").remove();
    messagesEl.innerHTML += `<div class="chat-bubble bot-bubble">${reply}</div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;

    conversationHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    document.getElementById("typing").remove();
    messagesEl.innerHTML += `<div class="chat-bubble bot-bubble">⚠️ Could not reach the backend. Is it running?</div>`;
  }
}

function resetApp() {
  document.getElementById("results-section").classList.add("hidden");
  document.getElementById("file-input").value = "";
  document.getElementById("file-name").textContent = "";
  document.getElementById("jd-input").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}