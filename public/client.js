const socket = io();

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const joinForm = document.getElementById("joinForm");
const usernameInput = document.getElementById("username");

const chatUsername = document.getElementById("chatUsername");
const $messages = document.getElementById("messages");
const $form = document.getElementById("form");
const $input = document.getElementById("input");

let username = "";

// Join form
joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (!username) return;

  socket.emit("user:join", username);

  // Switch pages
  loginPage.classList.add("d-none");
  chatPage.classList.remove("d-none");
  chatUsername.textContent = username;
});

// Send message
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;
  socket.emit("chat:message", text);
  $input.value = "";
});

// Display incoming message
socket.on("chat:message", (msg) => {
  // msg.username comes from server
  const side = msg.username === username ? "right" : "left";
  addMessage({ from: msg.username, text: msg.text, ts: msg.ts, side });
});

socket.on("system", (msg) => {
  const sysDiv = document.createElement("div");
  sysDiv.classList.add("text-center", "text-muted", "my-2", "fw-bold");
  sysDiv.innerHTML = `<small>${msg}</small>`;
  $messages.appendChild(sysDiv);
  $messages.scrollTop = $messages.scrollHeight;
});

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Add message to DOM
function addMessage({ from, text, ts, side }) {
  const messages = document.getElementById("messages");
  const msgDiv = document.createElement("div");

  msgDiv.classList.add("d-flex", "mb-2");

  if (side === "right") {
  msgDiv.classList.add("justify-content-end");
  msgDiv.innerHTML = `
    <div class="py-2 px-3 rounded fs-6 text-white fw-semibold" style="max-width: 60%; background-color:#327355;">
      
      <span class="fs-5">${text}</span>
      <div class="text-end text-body-secondary"><small>${formatTime(ts)}</small></div>
    </div>
  `;
} else {
  msgDiv.classList.add("justify-content-start");
  msgDiv.innerHTML = `
    <div class="py-2 px-3 rounded fw-semibold text-white " style="max-width: 60%; background-color:#739E97;">
      <small class="d-block fw-bold" style="color:#022601">${from}</small>
      <span class="fs-5">${text}</span>
      <div class="text-start text-body-secondary"><small >${formatTime(ts)}</small></div>
    </div>
  `;
}

// Update online users list
socket.on("user:list", (usernames) => {
  const usersList = document.getElementById("users");
  usersList.innerHTML = "";
  usernames.forEach(u => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "py-1", "px-2");
    li.textContent = (u === username) ? `${u} (You)` : u;
    usersList.appendChild(li);
  });
});

// Notification (join/leave)
socket.on("chat:notification", (msg) => {
  const notif = document.createElement("div");
  notif.classList.add("text-center", "text-muted", "my-2");
  notif.textContent = msg;
  messages.appendChild(notif);
  messages.scrollTop = messages.scrollHeight;
});




  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

