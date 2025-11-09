const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("listcontainer");
const addButton = document.getElementById("add-button");

document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    loadTasks();
});

addButton.addEventListener("click", addTask);

function addTask() {
    if (inputBox.value.trim() === "") {
        alert("You must write something!");
        return;
    }

    const taskText = inputBox.value;
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in to add tasks!");
        return;
    }

    fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ taskText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            inputBox.value = ""; 
            loadTasks(); 
        } else {
            alert("Error adding task: " + (data.error || "Unknown error"));
        }
    })
    .catch(error => {
        console.error("Error adding task:", error);
        alert("Failed to add task.");
    });
}

function loadTasks() {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch("http://localhost:3001/tasks", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(tasks => {
        listContainer.innerHTML = "";

        tasks.forEach(task => {
            let li = document.createElement("li");
            li.classList.add("task-item");
            li.dataset.taskId = task.id;


            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            li.appendChild(checkbox);


            let taskText = document.createElement("span");
            taskText.textContent = task.task_text;
            taskText.classList.add("task-text");
            li.appendChild(taskText);


            let button = document.createElement("button");
            button.textContent = "Tackle with Pomodoro!";
            button.classList.add("task-button");
            

            button.onclick = function () {
                window.location.href = "pomodoro.html";
            };
            
            li.appendChild(button);

            let span = document.createElement("span");
            span.innerHTML = "\u00D7";
            span.classList.add("close");
            span.onclick = () => deleteTask(task.id);
            li.appendChild(span);

            listContainer.appendChild(li);
        });
    })
    .catch(error => console.error("Error loading tasks:", error));
}

function deleteTask(taskId) {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(`http://localhost:3001/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            loadTasks(); 
        } else {
            alert("Failed to delete task.");
        }
    })
    .catch(error => console.error("Error deleting task:", error));
}


listContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("checkbox")) {
        const listItem = e.target.closest("li");
        const taskText = listItem.querySelector(".task-text");
        const button = listItem.querySelector(".task-button");

        listItem.classList.toggle("checked");
        taskText.classList.toggle("text-completed");
        button.classList.toggle("disabled");
    }

    if (e.target.classList.contains("task-text")) {
        const checkbox = e.target.closest("li").querySelector(".checkbox");
        checkbox.click();
    }
    
});
