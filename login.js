document.addEventListener("DOMContentLoaded", () => {
  updateUI();
});

// Function to handle login
function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", data.username);

        updateUI(); // Update UI immediately
        
        // Redirect to planit.html after successful login
        window.location.href = "planit.html";
      } else {
        alert("Invalid credentials");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("Login failed");
    });
}

// Function to update UI based on login status
function updateUI() {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const navRight = document.getElementById("nav-right");
  const startNowButton = document.querySelector(".start_now");

  if (token && username) {
    navRight.innerHTML = `
      <div class="dropdown">
        <button class="dropbtn">${username} <i class="fa fa-caret-down"></i></button>
        <div class="dropdown-content">
          <a href="profile.html">Profile</a>
          <a href="#" id="logoutButton">Logout</a>
        </div>
      </div>
    `;

    // Update "Start Now" button for logged-in users
    if (startNowButton) {
      startNowButton.textContent = "Start Now";
      startNowButton.parentElement.setAttribute("href", "planit.html");
    }

    // Add event listener for logout button
    document.getElementById("logoutButton").addEventListener("click", logoutUser);
  } else {
    // Update "Start Now" button for guests
    if (startNowButton) {
      startNowButton.textContent = "Start Now as a Guest";
      startNowButton.parentElement.setAttribute("href", "planitguest.html");
    }

    navRight.innerHTML = `<button class="log" id="loginButton" onclick="window.location.href='login.html'">Log in</button>
`;;
  }
}

// Function to log out
function logoutUser() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  
  updateUI(); // Update UI immediately

  // Redirect to home page after logout
  window.location.href = "home.html";
}

// Attach login event listener to form
document.getElementById("authForm")?.addEventListener("submit", loginUser);
