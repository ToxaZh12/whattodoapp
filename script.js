const $ = id => document.getElementById(id);

const addBtn = $("addBtn");
const todoInput = $("todoInput");
const opisInput = $("opisInput");
const deadlineInput = $("deadlineInput");
const priorityInput = $("priorityInput");
const statusInput = $("statusInput");
const todoList = $("todoList");
const pagination = $("pagination");
const errorBox = document.querySelector(".error-message");

let todos = [];
const itemsPerPage = 3;
let currentPage = 1;

loadTodos();

async function loadTodos() {
  try {
    const { data } = await supabase
      .from("whattodoapp")
      .select("id, text, opis, deadline, priority, status")
      .order("id", { ascending: false });

    todos = data || [];
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
  }

  render();
}

addBtn.onclick = async () => {
  const text = todoInput.value.trim();
  const opis = opisInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;
  const status = statusInput.value;

  if (!text) return showError("Enter a task");

  const newTodo = { text, opis, deadline, priority, status };

  todos.unshift(newTodo);
  localStorage.setItem("todos", JSON.stringify(todos));
  render();

  try {
    const { data } = await supabase
      .from("whattodoapp")
      .insert([newTodo])
      .select("id, text, opis, deadline, priority, status")
      .limit(1);

    todos[0] = data[0];
    localStorage.setItem("todos", JSON.stringify(todos));
    render();
  } catch {
    showError("Saved locally");
  }

  todoInput.value = "";
  opisInput.value = "";
};

function render() {
  renderTodos();
  renderPagination();
}

function renderTodos() {
  todoList.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;

  todos.slice(start, start + itemsPerPage).forEach((item, i) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b>${item.text}</b>
      <p>${item.opis || ""}</p>
      <p>📅 ${item.deadline || "no date"}</p>
      <p>⚡ ${item.priority}</p>
      <p>✅ ${item.status}</p>
      <button onclick="deleteTask(${start + i})">Delete</button>
    `;

    todoList.append(li);
  });
}

async function deleteTask(index) {
  const removed = todos.splice(index, 1)[0];
  localStorage.setItem("todos", JSON.stringify(todos));
  render();

  if (removed.id) {
    await supabase.from("whattodoapp").delete().eq("id", removed.id);
  }
}

function renderPagination() {
  pagination.innerHTML = "";
  const pages = Math.ceil(todos.length / itemsPerPage);

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      render();
    };
    pagination.append(btn);
  }
}

function showError(text) {
  errorBox.textContent = text;
  setTimeout(() => (errorBox.textContent = ""), 3000);
}
