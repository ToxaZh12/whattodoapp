const $ = id => document.getElementById(id);

const addBtn = $("addBtn");
const todoInput = $("todoInput");
const todoOpis = $("todoOpis");
const todoDeadline = $("todoDeadline");
const todoPriority = $("todoPriority");
const todoStatus = $("todoStatus");

const todoList = $("todoList");
const pagination = $("pagination");
const errorBox = document.querySelector(".error-message");

let todos = [];
const itemsPerPage = 3;
let currentPage = 1;

loadTodos();

async function loadTodos() {
  try {
    const { data, error } = await supabase
      .from("whattodoapp")
      .select("id, text, opis, deadline, priority, status")
      .order("id", { ascending: false });

    if (!error && data) {
      todos = data;
      localStorage.setItem("todos", JSON.stringify(todos));
    } else {
      todos = JSON.parse(localStorage.getItem("todos")) || [];
    }
  } catch {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
  }

  render();
}

addBtn.onclick = async () => {
  const text = todoInput.value.trim();
  const opis = todoOpis.value.trim();
  const deadline = todoDeadline.value;
  const priority = todoPriority.value;
  const status = todoStatus.value;

  if (!text || !opis || !deadline || !priority || !status) {
    return showError("Fill all fields");
  }

  const newTodo = { text, opis, deadline, priority, status };
  todos.unshift(newTodo);

  localStorage.setItem("todos", JSON.stringify(todos));

  todoInput.value = "";
  todoOpis.value = "";
  todoDeadline.value = "";
  todoPriority.value = "";
  todoStatus.value = "";

  currentPage = 1;
  render();

  try {
    const { data, error } = await supabase
      .from("whattodoapp")
      .insert([newTodo])
      .select("id, text, opis, deadline, priority, status")
      .limit(1);

    if (!error && data?.length) {
      todos[0] = data[0];
      localStorage.setItem("todos", JSON.stringify(todos));
      render();
    } else {
      showError("Supabase insert error");
    }
  } catch {
    showError("Saved locally — will sync when online");
  }
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
    li.className = "todo-item";

    li.innerHTML = `
      <strong>${escapeHtml(item.text)}</strong><br>
      <small>${escapeHtml(item.opis)}</small><br>
      <small>📅 ${item.deadline}</small><br>
      <small>⭐ Priority: ${item.priority}</small><br>
      <small>📌 Status: ${item.status}</small><br>

      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    li.querySelector(".edit-btn").onclick = () => editTask(start + i, li);
    li.querySelector(".delete-btn").onclick = () => deleteTask(start + i);

    todoList.append(li);
  });
}

function renderPagination() {
  pagination.innerHTML = "";
  const pages = Math.max(1, Math.ceil(todos.length / itemsPerPage));

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn";
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => { currentPage = i; render(); };
    pagination.append(btn);
  }
}

function editTask(index, li) {
  const item = todos[index];

  li.innerHTML = `
    <input class="todo-text" value="${escapeHtml(item.text)}">
    <input class="todo-text" value="${escapeHtml(item.opis)}">
    <input type="date" class="todo-text" value="${item.deadline}">

    <select class="todo-text">
      <option value="low" ${item.priority === "low" ? "selected" : ""}>Low</option>
      <option value="medium" ${item.priority === "medium" ? "selected" : ""}>Medium</option>
      <option value="high" ${item.priority === "high" ? "selected" : ""}>High</option>
    </select>

    <select class="todo-text">
      <option value="todo" ${item.status === "todo" ? "selected" : ""}>Todo</option>
      <option value="in-progress" ${item.status === "in-progress" ? "selected" : ""}>In Progress</option>
      <option value="done" ${item.status === "done" ? "selected" : ""}>Done</option>
    </select>

    <button class="save-btn">Save</button>
    <button class="delete-btn">Delete</button>
  `;

  li.querySelector(".save-btn").onclick = async () => {
    const inputs = li.querySelectorAll("input, select");

    const updated = {
      text: inputs[0].value.trim(),
      opis: inputs[1].value.trim(),
      deadline: inputs[2].value,
      priority: inputs[3].value,
      status: inputs[4].value
    };

    if (!updated.text || !updated.opis || !updated.deadline || !updated.priority || !updated.status) {
      return showError("Fill all fields");
    }

    todos[index] = { ...todos[index], ...updated };
    localStorage.setItem("todos", JSON.stringify(todos));
    render();

    if (item.id) {
      await supabase.from("whattodoapp").update(updated).eq("id", item.id);
    }
  };

  li.querySelector(".delete-btn").onclick = () => deleteTask(index);
}

async function deleteTask(index) {
  const removed = todos.splice(index, 1)[0];

  localStorage.setItem("todos", JSON.stringify(todos));

  if ((currentPage - 1) * itemsPerPage >= todos.length)
    currentPage = Math.max(1, currentPage - 1);

  render();

  if (removed.id) {
    await supabase.from("whattodoapp").delete().eq("id", removed.id);
  }
}

function showError(text) {
  errorBox.textContent = text;
  errorBox.style.display = "block";
  setTimeout(() => (errorBox.style.display = "none"), 3000);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}
