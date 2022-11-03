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

// Only allow letters to be typed by calling this function every time something is typed into the input area
const checkIfLetter = function (e) {
  if (!e.data) return;

  if (e.data.toUpperCase() >= "A" && e.data.toUpperCase() <= "Z") return;

  toppingInput.value = toppingInput.value.slice(0, -1);
};

// Loop over all list items and see if the topping already exists. Do a case insensitive check
const checkIfDuplicate = function (topping) {
  return toppingsListItems.some(
    (item) => item.dataset.topping.toUpperCase() === topping.toUpperCase()
  );
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
  const html = `<li class="topping" data-topping="${topping}">${topping} <button class="delete-btn">X</button> <button>✏️</button></li>`;
  toppingsList.insertAdjacentHTML("beforeend", html);
  toppingsList.lastChild
    .querySelector(".delete-btn")
    .addEventListener("click", deleteTopping);
  toppingInput.value = "";
  toppingInput.blur();
};

const deleteTopping = function (e) {
  // console.log(e.target.closest("li"));
  e.target.closest("li").remove();
};

const editTopping = function (e) {
  const item = e.target.closest("li");
  item.firstElementChild.classList.toggle("hidden");
  const topping = item.dataset.topping;
  const toppingEditor = `<input type="text" value="${topping}" />`;
  item.insertAdjacentHTML("afterbegin", toppingEditor);
  const toppingInput = item.firstElementChild;
  toppingInput.setSelectionRange(topping.length, topping.length);
  toppingInput.focus();
  toppingInput.addEventListener("change", saveToppingEdit);
  toppingInput.addEventListener("blur", saveToppingEdit);
};

const saveToppingEdit = function (e) {
  const toppingInput = e.target;
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
