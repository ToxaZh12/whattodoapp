const $ = id => document.getElementById(id);

const addBtn = $("addBtn");
const todoInput = $("todoInput");
const todoList = $("todoList");
const pagination = $("pagination");
const errorBox = document.querySelector(".error-message");

let todos = [];                // array of { id?, text } or only text depending on loaded source
const itemsPerPage = 3;
let currentPage = 1;

/* ===== Load on start: try Supabase, fallback to localStorage ===== */
loadTodos();

async function loadTodos() {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("id, text")
      .order("id", { ascending: false });

    if (!error && data) {
      // store as array of objects to keep ids for updates/deletes
      todos = data.map(t => ({ id: t.id, text: t.text }));
      localStorage.setItem("todos", JSON.stringify(todos));
    } else {
      todos = JSON.parse(localStorage.getItem("todos")) || [];
    }
  } catch (e) {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
  }
  render();
}

/* ===== Add ===== */
addBtn.onclick = async () => {
  const text = todoInput.value.trim();
  if (!text) return showError("Enter a task");

  // optimistic local update
  todos.unshift({ text }); 
  localStorage.setItem("todos", JSON.stringify(todos));
  todoInput.value = "";
  currentPage = 1;
  render();

  // persist to Supabase, then update id if returned
  try {
    const { data, error } = await supabase
      .from("todos")
      .insert([{ text }])
      .select("id, text")
      .limit(1);

    if (!error && data?.length) {
      // replace the first item (optimistic) with returned item (contains id)
      todos[0] = { id: data[0].id, text: data[0].text };
      localStorage.setItem("todos", JSON.stringify(todos));
      render();
    }
  } catch (e) {
    // ignore network failure (we already saved locally)
    showError("Saved locally — will sync when online");
  }
};

/* ===== Render ===== */
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
      <span class="todo-text">${escapeHtml(item.text)}</span>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    li.querySelector(".edit-btn").onclick = () => editTask(start + i, li);
    li.querySelector(".delete-btn").onclick = () => deleteTask(start + i);

    todoList.append(li);
  });
}

/* ===== Pagination ===== */
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

/* ===== Edit ===== */
function editTask(index, li) {
  const item = todos[index];
  li.innerHTML = `
    <input class="todo-text" value="${escapeHtml(item.text)}">
    <button class="save-btn">Save</button>
    <button class="delete-btn">Delete</button>
  `;

  li.querySelector(".save-btn").onclick = async () => {
    const value = li.querySelector("input").value.trim();
    if (!value) return showError("Task cannot be empty");

    const old = item;
    todos[index].text = value;
    localStorage.setItem("todos", JSON.stringify(todos));
    render();

    if (old.id) {
      // try persist change
      try {
        await supabase.from("todos").update({ text: value }).eq("id", old.id);
      } catch (e) { showError("Saved locally — will sync when online"); }
    } else {
      // no id yet: try to find created row server-side and update local id
      try {
        const { data } = await supabase.from("todos").select("id, text").eq("text", value).limit(1);
        if (data?.length) {
          todos[index].id = data[0].id;
          localStorage.setItem("todos", JSON.stringify(todos));
        }
      } catch (e) {}
    }
  };

  li.querySelector(".delete-btn").onclick = () => deleteTask(index);
}

/* ===== Delete ===== */
async function deleteTask(index) {
  const removed = todos.splice(index, 1)[0];
  localStorage.setItem("todos", JSON.stringify(todos));
  if ((currentPage - 1) * itemsPerPage >= todos.length) currentPage = Math.max(1, currentPage - 1);
  render();

  if (removed.id) {
    try {
      await supabase.from("todos").delete().eq("id", removed.id);
    } catch (e) { showError("Deleted locally — will sync when online"); }
  } else {
    // try delete by text as fallback
    try { await supabase.from("todos").delete().eq("text", removed.text); } catch (e) {}
  }
}

/* ===== Helpers ===== */
function showError(text) {
  errorBox.textContent = text;
  errorBox.style.display = "block";
  setTimeout(() => (errorBox.style.display = "none"), 3000);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
