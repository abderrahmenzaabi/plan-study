// Select DOM elements
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("listcontainer");
const addButton = document.getElementById("add-button");

// Event listener for adding a new task
addButton.addEventListener("click", addTask);

function addTask() {
  // Check if the input is empty
  if (inputBox.value.trim() === "") {
    alert("You must write something!");
    return;
  }
  
  // Create a new list item
  let li = document.createElement("li");
  li.classList.add("task-item");

  // Create a proper checkbox (input element) like the database version
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox");
  li.appendChild(checkbox);

  // Add task text container
  let taskText = document.createElement("span");
  taskText.textContent = inputBox.value;
  taskText.classList.add("task-text");
  li.appendChild(taskText);

  // Add the "Tackle with Pomodro!" button
  let button = document.createElement("button");
  button.textContent = "Tackle with Pomodoro!";
  button.classList.add("task-button");
  
  // Add an onclick event to navigate to pomodoro.html
  button.onclick = function () {
      window.location.href = "login.html";
  };
  
  li.appendChild(button);

  let span = document.createElement("span");
  span.innerHTML = "\u00D7"; 
  span.classList.add("close");
  li.appendChild(span);

  listContainer.appendChild(li);


  inputBox.value = "";

  span.addEventListener("click", function () {
    li.remove();
  });
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
