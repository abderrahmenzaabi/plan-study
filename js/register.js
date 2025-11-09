const formTitle = document.getElementById('formTitle');
const nameField = document.getElementById('nameField');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const formButton = document.getElementById('formButton');
const loginOptions = document.getElementById('loginOptions');
const nameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authForm = document.getElementById('authForm');

let isRegister = false;

function toggleForm() {
  isRegister = !isRegister;

  if (isRegister) {
    formTitle.textContent = 'Register';
    nameField.style.display = 'block';
    formButton.textContent = "Sign Up";
    toggleLink.textContent = 'Sign In';
    toggleText.firstChild.textContent = 'Already have an account? ';
  } else {
    formTitle.textContent = 'Login';
    nameField.style.display = 'none';
    formButton.textContent = "Log In";
    toggleLink.textContent = 'Register';
    toggleText.firstChild.textContent = "Don't have an account? ";
  }

  nameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
}

authForm.addEventListener("submit", function(event) {
  event.preventDefault();
  if (isRegister) {
    registerUser();
  } else {
    loginUser();
  }
});

toggleLink.addEventListener('click', toggleForm);
function registerUser() {
  const username = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  fetch('http://localhost:3001/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);  
      toggleForm(); 
    } else {
      alert(data.error || 'An error occurred during registration');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during registration');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");

  if (token && username) {
    updateUIAfterLogin(username);

    if (window.location.pathname.includes("login.html")) {
      window.location.href = "planit.html";
    }
  }
});


