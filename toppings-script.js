"use strict";

/**********
 *** DOM **
 **********/

const addBtn = document.querySelector(".add-btn");
const toppingInput = document.querySelector("#add-topping");
const addSubmitBtn = document.querySelector(".add-submit-btn");
const toppingForm = document.querySelector(".topping-form");
const toppingsList = document.querySelector(".toppings");
const toppingsListItems = [...document.querySelectorAll(".topping")];
const deleteBtns = [...document.querySelectorAll(".delete-btn")];
const editBtns = [...document.querySelectorAll(".edit-btn")];

/***********
 ** State **
 ***********/
const allToppings = new Set();
toppingsListItems.forEach((item) => {
  const topping = item.querySelector("span").textContent;
  allToppings.add(topping.toUpperCase());
});

/****************
 *** Functions **
 ****************/

const storeAllToppings = function () {
  localStorage.setItem("toppings", [...allToppings]);
  console.log(localStorage);
};
storeAllToppings();

// Only allow letters to be typed by calling this function every time something is typed into the input area
const checkIfLetter = function (e) {
  if (!e.data) return;

  if (
    (e.data.toUpperCase() >= "A" && e.data.toUpperCase() <= "Z") ||
    e.data === " "
  )
    return;

  toppingInput.value = toppingInput.value.slice(0, -1);
};

// Loop over all list items and see if the topping already exists. Do a case insensitive check
const checkIfDuplicate = function (topping) {
  return allToppings.has(topping.toUpperCase());
};

const addTopping = function (e) {
  e.preventDefault();
  const topping = toppingInput.value;
  if (!topping) return;
  if (checkIfDuplicate(topping)) {
    toppingInput.value = "";
    toppingInput.blur();
    return;
  }
  allToppings.add(topping.toUpperCase());
  storeAllToppings();
  const html = `
  <li class="topping">
    <span class="topping-text">${topping}</span>
    <div class="topping-btns">
      <button class="delete-btn">X</button>
      <button class="edit-btn">✏️</button>
    </div>
  </li>
  `;
  toppingsList.insertAdjacentHTML("beforeend", html);
  /* 
  Check console, there is an error coming from here
  */
  toppingsList
    .querySelector("li:last-child .delete-btn")
    .addEventListener("click", deleteTopping);
  toppingsList
    .querySelector("li:last-child .edit-btn")
    .addEventListener("click", editTopping);
  toppingInput.value = "";
  toppingInput.blur();
};

const deleteTopping = function (e) {
  e.target.closest("li").remove();
};

const editTopping = function (e) {
  const item = e.target.closest("li");
  if (item.querySelector("input")) {
    console.log("here");
    saveToppingEdit(item.querySelector("input"));
    return;
  }
  item.firstElementChild.classList.toggle("hidden");
  const topping = item.querySelector("span").textContent;
  const toppingEditor = `<input type="text" value="${topping}" class="topping-text" />`;
  item.insertAdjacentHTML("afterbegin", toppingEditor);
  const toppingInput = item.firstElementChild;
  toppingInput.setSelectionRange(topping.length, topping.length);
  toppingInput.focus();
  toppingInput.addEventListener("change", saveToppingEdit);
  toppingInput.addEventListener("blur", saveToppingEdit);
  // const editBtn = e.target;
  // editBtn.removeEventListener("click", editTopping);
  // editBtn.addEventListener("click", saveToppingEdit);
};

const saveToppingEdit = function (e) {
  // const editBtn = e.target.closest("li").querySelector(".edit-btn");
  // editBtn.removeEventListener("click", saveToppingEdit);
  // editBtn.addEventListener("click", editTopping);
  // // let toppingInput;
  // if (e.target.nodeName === "BUTTON") {
  //   toppingInput = e.target.closest("li").querySelector("input");
  // } else {
  const toppingInput = e.target;
  // }
  const toppingText = document.querySelector(".hidden");
  if (!toppingText) return;
  toppingText.textContent = toppingInput.value;
  toppingText.classList.toggle("hidden");
  toppingInput.remove();
};

/**********************
 *** Event Listeners **
 **********************/

toppingInput.addEventListener("input", checkIfLetter);
toppingForm.addEventListener("submit", addTopping);
deleteBtns.forEach((btn) => btn.addEventListener("click", deleteTopping));
editBtns.forEach((btn) => btn.addEventListener("click", editTopping));
