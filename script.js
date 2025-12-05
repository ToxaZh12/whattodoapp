const $ = id => document.getElementById(id);
const addBtn = $("addBtn");
const todoInput = $("todoInput");
const todoList = $("todoList");
const pagination = $("pagination");
const errorBox = document.querySelector(".error-message");
const todos = [];
const itemsPerPage = 3;
let currentPage = 1;
addBtn.onclick = () => {
  const text = todoInput.value.trim();
  if (!text) return showError("Please enter a task");

  todos.unshift(text);
  todoInput.value = "";
  currentPage = 1;
  render();
};

function render() {
  renderTodos();
  renderPagination();
}

function renderTodos() {
  todoList.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;

  todos.slice(start, start + itemsPerPage).forEach((task, i) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `
      <span class="todo-text">${task}</span>
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
  const pages = Math.ceil(todos.length / itemsPerPage);

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn";
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      currentPage = i;
      renderTodos();
      renderPagination();
    };
    pagination.append(btn);
  }
}

function editTask(index, li) {
  li.innerHTML = `
    <input class="todo-text" value="${todos[index]}">
    <button class="save-btn">Save</button>
    <button class="delete-btn">Delete</button>
  `;

  li.querySelector(".save-btn").onclick = () => {
    const value = li.querySelector("input").value.trim();
    if (!value) return showError("Task cannot be empty");
    todos[index] = value;
    renderTodos();
  };

  li.querySelector(".delete-btn").onclick = () => deleteTask(index);
}

function deleteTask(index) {
  todos.splice(index, 1);
  if ((currentPage - 1) * itemsPerPage >= todos.length) {
    currentPage = Math.max(1, currentPage - 1);
  }
  render();
}

function showError(text) {
  errorBox.textContent = text;
  errorBox.style.display = "block";
  setTimeout(() => (errorBox.style.display = "none"), 3000);
}