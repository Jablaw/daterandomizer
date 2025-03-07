document.addEventListener("DOMContentLoaded", () => {
  loadDateOptions();

  // Attach event listeners
  document.getElementById("randomizeBtn").addEventListener("click", randomizeDate);
  document.getElementById("skipBtn").addEventListener("click", skipDate);
  document.getElementById("confirmBtn").addEventListener("click", confirmDate);
  document.getElementById("viewAllBtn").addEventListener("click", viewAllOptions);
  document.getElementById("viewPastBtn").addEventListener("click", viewPastDates);
  document.getElementById("addBtn").addEventListener("click", addNewDateIdea);

  document.querySelectorAll(".rating span").forEach(star => {
    star.addEventListener("click", () => {
      let rating = parseInt(star.getAttribute("data-rating"));
      rateDate(rating);
    });
  });
});

// Global variable for current randomized (but not confirmed) date idea
let currentRandomDate = null;

// Load dateOptions from localStorage or use default from data.js.
// If localStorage contains an empty object, reset to default.
function loadDateOptions() {
  let stored = localStorage.getItem("dateOptions");
  if (stored) {
    try {
      let parsed = JSON.parse(stored);
      if (!parsed || Object.keys(parsed).length === 0) {
        window.dateOptions = dateOptions;
        localStorage.setItem("dateOptions", JSON.stringify(window.dateOptions));
      } else {
        window.dateOptions = parsed;
      }
    } catch (e) {
      window.dateOptions = dateOptions;
      localStorage.setItem("dateOptions", JSON.stringify(window.dateOptions));
    }
  } else {
    window.dateOptions = dateOptions;
    localStorage.setItem("dateOptions", JSON.stringify(window.dateOptions));
  }
}

// Save dateOptions to localStorage
function saveDateOptions() {
  localStorage.setItem("dateOptions", JSON.stringify(window.dateOptions));
}

// Randomize a date idea based on the selected category
function randomizeDate() {
  let selected = document.getElementById("categoryFilter").value;
  let categories = selected === "random" ? Object.keys(window.dateOptions) : [selected];
  if (!categories || categories.length === 0) {
    document.getElementById("result").innerHTML = "No categories available.";
    return;
  }
  let randCat = categories[Math.floor(Math.random() * categories.length)];
  let options = window.dateOptions[randCat];
  if (!options || options.length === 0) {
    document.getElementById("result").innerHTML = "No options in this category.";
    return;
  }
  let randOption = options[Math.floor(Math.random() * options.length)];
  currentRandomDate = { category: randCat, name: randOption.name, link: randOption.link };
  document.getElementById("result").innerHTML = `<b>${randCat}:</b> <a href="${randOption.link}" target="_blank">${randOption.name}</a>`;
  document.getElementById("skipBtn").classList.remove("hidden");
  document.getElementById("confirmBtn").classList.remove("hidden");
  document.getElementById("rating").classList.add("hidden");
}

// Skip the current date idea and generate a new one
function skipDate() {
  randomizeDate();
}

// Confirm the current date idea and save it to past dates; reveal the rating section
function confirmDate() {
  if (!currentRandomDate) return;
  let pastDates = JSON.parse(localStorage.getItem("pastDates")) || [];
  pastDates.unshift({ ...currentRandomDate, rating: null, timestamp: new Date().toISOString() });
  localStorage.setItem("pastDates", JSON.stringify(pastDates));
  document.getElementById("rating").classList.remove("hidden");
  document.getElementById("confirmBtn").classList.add("hidden");
  document.getElementById("skipBtn").classList.add("hidden");
  document.getElementById("result").innerHTML += `<br><span style="color: green;">Date Confirmed!</span>`;
}

// View all available date options
function viewAllOptions() {
  let options = JSON.parse(localStorage.getItem("dateOptions")) || window.dateOptions;
  let output = "";
  for (let cat in options) {
    output += `<h3>${cat}</h3><ul>`;
    options[cat].forEach(item => {
      output += `<li><a href="${item.link}" target="_blank">${item.name}</a></li>`;
    });
    output += `</ul>`;
  }
  let display = document.getElementById("displayArea");
  display.innerHTML = output;
  display.classList.remove("hidden");
}

// View past (confirmed) dates
function viewPastDates() {
  let pastDates = JSON.parse(localStorage.getItem("pastDates")) || [];
  let output = "<h2>Past Dates</h2>";
  if (pastDates.length === 0) {
    output += "<p>No past dates confirmed yet.</p>";
  } else {
    pastDates.forEach((date, index) => {
      let ratingText = date.rating ? "Rated: " + "★".repeat(date.rating) + "☆".repeat(5 - date.rating) : "Not rated";
      output += `<p>${index + 1}. <b>${date.category}:</b> <a href="${date.link}" target="_blank">${date.name}</a> - ${ratingText}</p>`;
    });
  }
  let display = document.getElementById("displayArea");
  display.innerHTML = output;
  display.classList.remove("hidden");
}

// Rate the most recent confirmed date
function rateDate(rating) {
  let pastDates = JSON.parse(localStorage.getItem("pastDates")) || [];
  if (pastDates.length > 0) {
    pastDates[0].rating = rating;
    localStorage.setItem("pastDates", JSON.stringify(pastDates));
    alert("You rated the date " + rating + " stars!");
  }
}

// Add a new date idea to the selected category
function addNewDateIdea() {
  let cat = document.getElementById("newCategory").value;
  let name = document.getElementById("newName").value.trim();
  let link = document.getElementById("newLink").value.trim() || "#";
  if (!name) {
    document.getElementById("addMessage").textContent = "Please enter a date idea.";
    return;
  }
  if (!window.dateOptions[cat]) {
    window.dateOptions[cat] = [];
  }
  window.dateOptions[cat].push({ name, link });
  saveDateOptions();
  document.getElementById("addMessage").textContent = `Added "${name}" to ${cat}.`;
  document.getElementById("newName").value = "";
  document.getElementById("newLink").value = "";
}
