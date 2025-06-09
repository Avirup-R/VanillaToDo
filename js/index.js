let modalBtns = [...document.querySelectorAll(".button")];
modalBtns.forEach(function (btn) {
  btn.onclick = function () {
    let modal = btn.getAttribute("data-modal");
    document.getElementById(modal).style.display = "block";
  };
});
let closeBtns = [...document.querySelectorAll(".close")];
closeBtns.forEach(function (btn) {
  btn.onclick = function () {
    let modal = btn.closest(".modal");
    modal.style.display = "none";
  };
});
window.onclick = function (event) {
  if (event.target.className === "modal") {
    event.target.style.display = "none";
  }
};

// Vanilla ToDo App JS

document.addEventListener("DOMContentLoaded", function () {
  // Modal logic
  const modal = document.getElementById("modalOne");
  const openModalBtn = document.querySelector('[data-modal="modalOne"]');
  const closeModalBtn = document.querySelector(".modal .close");
  const form = modal.querySelector("form");
  const taskInput = form.querySelector('input[name="ToDo"]');
  const deadlineInput = form.querySelector('input[type="datetime-local"]');
  const descInput = form.querySelector("textarea");

  // Containers
  const pendingContainer = document
    .querySelectorAll(".container")[1]
    .querySelector(".row.justify-content-center");
  const completedContainer = document
    .querySelectorAll(".container")[2]
    .querySelector(".row.justify-content-center");

  // Storage keys
  const PENDING_KEY = "vanilla_todo_pending";
  const COMPLETED_KEY = "vanilla_todo_completed";

  // Helpers
  function saveTasks() {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingTasks));
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedTasks));
  }

  function loadTasks() {
    pendingTasks = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  function getDeadlineColor(deadline) {
    if (!deadline) return "red";
    const now = new Date();
    const dl = new Date(deadline);
    if (isNaN(dl.getTime())) return "red";
    if (dl < now) return "red";
    const diffMs = dl - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) return "blue";
    return "black";
  }

  function createTaskRow(task, isPending, idx) {
    const row = document.createElement("div");
    row.className = "row align-items-center flex w-100 task-row";
    row.style.marginTop = "20px";
    row.style.overflowX = "auto";
    const deadlineColor = getDeadlineColor(task.deadline);
    const titleColor = deadlineColor;
    const descColor = deadlineColor;
    const dateColor = deadlineColor;
    row.innerHTML = `
      <div class="col-lg-2 col-md-2 col-3 task date align-items-center justify-content-center"><h5 class="mb-0" style="color:${dateColor}">${formatDate(
      task.createdAt
    )}</h5></div>
      <div class="col-lg-5 col-md-4 col-5 task toDo flex align-items-center task-title task-editable" style="cursor:pointer;"><h5 class="mb-0" style="color:${titleColor}">${
      task.title
    }</h5><div class="desc ml-2" style="font-size:12px;color:${descColor};">${
      task.desc || ""
    }</div></div>
      <div class="col-lg-2 col-md-3 col-3 task deadline flex align-items-center justify-content-center"><h5 class="mb-0" style="color:${deadlineColor}">${formatDate(
      task.deadline
    )}</h5></div>
      <div class=" align-items-center justify-content-center">
        <h5 class="mb-0">
          ${
            isPending
              ? `<button class=\"btn btn-done\" data-idx=\"${idx}\">Done</button>`
              : `<button class=\"btn btn-done\" data-idx=\"${idx}\" data-type=\"completed\">Return</button>`
          }
        </h5>
      </div>
      <div class=" remove flex align-items-center justify-content-center">
        <button class="btn btn-remove" title="Remove Task" data-idx="${idx}" data-type="${
      isPending ? "pending" : "completed"
    }">&#128465;</button>
      </div>
    `;
    // Only allow edit on clicking the task (toDo) div
    row.querySelector(".task-editable").addEventListener("click", function (e) {
      openEditModal(task, isPending, idx);
      e.stopPropagation();
    });
    return row;
  }

  // Modal for editing
  function openEditModal(task, isPending, idx) {
    // Create modal if not exists
    let editModal = document.getElementById("editModal");
    if (!editModal) {
      editModal = document.createElement("div");
      editModal.id = "editModal";
      editModal.className = "modal";
      editModal.innerHTML = `
        <div class="modal-content" style="border-radius: 25px; max-width: 500px; margin: 60px auto; background: #8dbcc7; box-shadow: 0 2px 5px #8dbcc7; border: 1px solid #000;">
          <div class="contact-form" style="border-radius: 25px; background: #8dbcc7; padding: 25px;">
            <a class="close" id="editModalClose" style="position:relative; left:30px; cursor:pointer; font-size:28px; font-weight:bold; color:#aaa; float:right;">&times;</a>
            <form id="editTaskForm">
              <h2 style="color:#000; margin-bottom:20px;">Edit Task</h2>
              <div>
                <input type="text" name="editTitle" placeholder="Task" required style="width:90%;padding:10px;margin-bottom:20px;border-radius:25px;border:1px solid #1c87c9;outline:none;" />
                <input type="datetime-local" name="editDeadline" placeholder="Deadline" style="width:90%;padding:10px;margin-bottom:20px;border-radius:25px;border:1px solid #1c87c9;outline:none;" />
              </div>
              <span style="color:#000;display:block;padding:0 0 5px;">Description</span>
              <div>
                <textarea name="editDesc" rows="4" style="width:90%;padding:10px;margin-bottom:20px;border-radius:25px;border:1px solid #1c87c9;outline:none;"></textarea>
              </div>
              <button type="submit" style="width:100%;padding:10px;border-radius:25px;border:none;background:#1c87c9;font-size:16px;font-weight:400;color:#fff;">Save</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(editModal);
    }
    // Fill form with task data
    const form = editModal.querySelector("#editTaskForm");
    form.editTitle.value = task.title;
    form.editDeadline.value = task.deadline
      ? new Date(task.deadline).toISOString().slice(0, 16)
      : "";
    form.editDesc.value = task.desc || "";
    // Show modal
    editModal.style.display = "block";
    // Close modal
    editModal.querySelector("#editModalClose").onclick = function () {
      editModal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target === editModal) {
        editModal.style.display = "none";
      }
    };
    // Save handler
    form.onsubmit = function (e) {
      e.preventDefault();
      const newTitle = form.editTitle.value.trim();
      const newDeadline = form.editDeadline.value;
      const newDesc = form.editDesc.value.trim();
      if (!newTitle) {
        alert("Task title is required!");
        return;
      }
      task.title = newTitle;
      task.deadline = newDeadline ? new Date(newDeadline).toISOString() : "";
      task.desc = newDesc;
      saveTasks();
      renderTasks();
      editModal.style.display = "none";
    };
  }

  function renderTasks() {
    // Clear
    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    // Render pending
    pendingTasks.forEach((task, idx) => {
      const row = createTaskRow(task, true, idx);
      pendingContainer.appendChild(row);
    });
    // Render completed
    completedTasks.forEach((task, idx) => {
      const row = createTaskRow(task, false, idx);
      completedContainer.appendChild(row);
    });
  }

  // Modal open/close
  openModalBtn.onclick = function () {
    modal.style.display = "block";
  };
  closeModalBtn.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Task data
  let pendingTasks = [];
  let completedTasks = [];
  loadTasks();
  renderTasks();

  // Add new task
  form.onsubmit = function (e) {
    e.preventDefault();
    const title = taskInput.value.trim();
    const deadline = deadlineInput.value;
    const desc = descInput.value.trim();
    if (!title) {
      alert("Task title is required!");
      return;
    }
    const task = {
      title,
      deadline,
      desc,
      createdAt: new Date().toISOString(),
    };
    pendingTasks.push(task);
    saveTasks();
    renderTasks();
    form.reset();
    modal.style.display = "none";
  };

  // Mark as done
  pendingContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-done")) {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      const [task] = pendingTasks.splice(idx, 1);
      completedTasks.push(task);
      saveTasks();
      renderTasks();
    }
  });
  // Add remove event listeners for both pending and completed containers
  pendingContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-remove")) {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      pendingTasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    }
  });
  completedContainer.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("btn-done") &&
      e.target.getAttribute("data-type") === "completed"
    ) {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      const [task] = completedTasks.splice(idx, 1);
      pendingTasks.push(task);
      saveTasks();
      renderTasks();
    }
    if (e.target.classList.contains("btn-remove")) {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      completedTasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    }
  });
});
