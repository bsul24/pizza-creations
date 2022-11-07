"use strict";

const createBtn = document.querySelector(".create-btn");
const newPizzaContainer = document.querySelector(".new-pizza-container");
const pizzaTiles = document.querySelector(".pizza-tiles");
const pizzas = [];
let newPizza;

class NewPizza {
  allToppings = localStorage.getItem("toppings").split(",");
  toppingsAvailable = this.allToppings;
  addIngBtn;
  toppingsAdded = 1;
  name;
  toppings;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
    <ul class="new-pizza">
      <button on class="save-pizza-btn">Save Pizza</button>
      <li class="new-pizza-name">
        <span>Name: </span><input class="new-pizza-name-input" type="text" />
      </li>
      <li>
        <span class="topping-number">Topping 1: </span>
        <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.allToppings)}
        </select>
        <button class="delete-topping-btn">X</button>
      </li>
      <button class="add-ing-btn">Add</button>
    </ul>`;
    newPizzaContainer.insertAdjacentHTML("afterbegin", ul);
    this.addDropDownChangeHandlers();
    this.addDeleteToppingHandlers();
    this.addIngBtn = document.querySelector(".add-ing-btn");
    this.addIngBtn.addEventListener("click", this.addIngredient.bind(this));
    const saveBtn = document.querySelector(".save-pizza-btn");
    saveBtn.addEventListener("click", this.savePizza.bind(this));
  }

  generateOptions(toppings) {
    let options = ``;
    toppings.forEach(
      (top) => (options += `<option value="${top}">${top}</option>`)
    );
    return options;
  }

  updateToppings() {
    const selectedToppings = [
      ...document.querySelectorAll(".new-pizza-toppings"),
    ];
    const usedToppings = new Set(selectedToppings.map((item) => item.value));
    this.toppingsAvailable = this.allToppings.filter(
      (top) => !usedToppings.has(top)
    );
    selectedToppings.forEach(
      (select) =>
        (select.innerHTML =
          (select.value === "none"
            ? `<option value="none" selected disabled hidden>Choose one</option>`
            : `<option value="${select.value}" selected>${select.value}</option>`) +
          `${this.generateOptions(this.toppingsAvailable)}`)
    );
  }

  addIngredient() {
    if (this.toppingsAdded === this.allToppings.length) return;
    const newIngHTML = `
      <li>
        <span class="topping-number">Topping X: </span>
        <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.toppingsAvailable)}
        </select>
        <button class="delete-topping-btn">X</button>
      </li>
    `;
    this.addIngBtn.insertAdjacentHTML("beforebegin", newIngHTML);
    this.addDropDownChangeHandlers();
    this.addDeleteToppingHandlers();
    this.updateToppingNumbers();
  }

  updateToppingNumbers() {
    const toppingNumbers = [...document.querySelectorAll(".topping-number")];
    for (let i = 0; i < toppingNumbers.length; i++) {
      toppingNumbers[i].textContent = `Topping ${i + 1}: `;
    }
    this.toppingsAdded = toppingNumbers.length;
  }

  deleteTopping(e) {
    e.target.closest("li").remove();
    this.updateToppingNumbers();
    this.updateToppings();
  }

  addDropDownChangeHandlers() {
    const dropDowns = [...document.querySelectorAll(".new-pizza-toppings")];
    dropDowns.forEach((drop) =>
      drop.addEventListener("change", this.updateToppings.bind(this))
    );
  }

  addDeleteToppingHandlers() {
    const deleteBtns = [...document.querySelectorAll(".delete-topping-btn")];
    deleteBtns.forEach((btn) =>
      btn.addEventListener("click", this.deleteTopping.bind(this))
    );
  }

  savePizza() {
    const name = document.querySelector(".new-pizza-name-input").value;
    if (name === "") {
      alert("Please name the pizza!");
      return;
    }
    this.name = name;
    const toppings = [...document.querySelectorAll(".new-pizza-toppings")];
    const toppingNames = toppings.reduce((acc, topping) => {
      if (topping.value !== "none") acc.push(topping.value);
      return acc;
    }, []);
    this.toppings = toppingNames;
    newPizza = "";
    pizzaTracker.createPizza(this);
    this.removeUI();
  }

  removeUI() {
    const newPizzaUI = document.querySelector(".new-pizza");
    newPizzaUI.remove();
  }
}

class Pizza {
  thisTile;
  thisName;
  thisToppings;
  toppingsList;
  allToppings;
  toppingsLeft;
  selecters;
  deleteBtn;
  editBtn;
  saveBtn;

  constructor(pizza) {
    this.name = pizza.name;
    // Sort toppings to make it easier to check if a pizza already exists with these toppings
    this.toppings = pizza.toppings.sort();
    this.generateMarkup();
  }

  generateMarkup() {
    const html = `
      <div class="pizza-tile">
      <div class="pizza-tile-btns">
        <button class="pizza-tile-delete-btn">X</button>
        <button class="pizza-tile-edit-btn">✏️</button>
      </div>
        <h2 class="pizza-name">${this.name}</h2>
        <h3 class="pizza-toppings">Toppings</h3>
        <ul class="toppings-list">
          ${this.generateToppings()}
        </ul>
      </div>
    `;
    pizzaTiles.insertAdjacentHTML("beforeend", html);
    this.storeDOM();
    this.addBtnHandlers();
  }

  generateToppings() {
    return this.toppings.reduce(
      (acc, top) => acc + `<li class="toppings-list-topping">${top}</li>`,
      ``
    );
  }

  addBtnHandlers() {
    this.editBtn.addEventListener("click", this.startEditMode.bind(this));
    this.deleteBtn.addEventListener("click", this.removePizza.bind(this));
  }

  storeDOM() {
    this.thisTile = document.querySelector(".pizza-tile:last-child");
    this.thisName = this.thisTile.querySelector(".pizza-name");
    this.thisToppings = [
      ...this.thisTile.querySelectorAll(".toppings-list-topping"),
    ];
    this.toppingsList = this.thisTile.querySelector(".toppings-list");
    this.deleteBtn = this.thisTile.querySelector(".pizza-tile-delete-btn");
    this.editBtn = this.thisTile.querySelector(".pizza-tile-edit-btn");
  }

  startEditMode() {
    if (this.saveBtn) {
      this.endEditMode();
      return;
    }
    this.thisName.setHTML(`<input type="text" value="${this.name}" />`);
    const saveBtn = `<button class="edit-save-btn">Save</button>`;
    this.thisTile.insertAdjacentHTML("beforeend", saveBtn);
    this.saveBtn = this.thisTile.querySelector(".edit-save-btn");
    this.saveBtn.addEventListener("click", this.endEditMode.bind(this));
    this.setToppingChoices();
    this.thisToppings.forEach(
      (top) =>
        (top.innerHTML = `<select class="pizza-tile-toppings-dropdown">${this.generateToppingsOptions(
          top.textContent
        )}</select>`)
    );
    this.addSelectHandlers();
  }

  setToppingChoices(edit = false) {
    this.allToppings = localStorage.getItem("toppings").split(",");
    this.thisToppings = edit
      ? [...this.thisTile.querySelectorAll(".pizza-tile-toppings-dropdown")]
      : [...this.thisTile.querySelectorAll(".toppings-list-topping")];
    const toppingsUsed = this.thisToppings.map((top) =>
      edit ? top.value : top.textContent
    );
    this.toppingsLeft = this.allToppings.filter(
      (top) => !toppingsUsed.some((topping) => topping === top)
    );
  }

  generateToppingsOptions(topping) {
    let options = topping
      ? `<option value="${topping}" selected>${topping}</option>`
      : ``;
    this.toppingsLeft.forEach(
      (top) => (options += `<option value="${top}">${top}</option>`)
    );
    return options;
  }

  addSelectHandlers() {
    this.selecters = [
      ...this.thisTile.querySelectorAll(".pizza-tile-toppings-dropdown"),
    ];
    this.selecters.forEach((sel) =>
      sel.addEventListener("change", this.updateToppingsOptions.bind(this))
    );
  }

  updateToppingsOptions() {
    this.setToppingChoices(true);
    console.log(this.selecters);
    this.selecters.forEach(
      (sel) =>
        (sel.innerHTML = `
        <select class="pizza-tile-toppings-dropdown">
          <option value="${sel.value}" selected>${sel.value}</option>
          ${this.generateToppingsOptions()}
        </select>
      `)
    );
  }

  endEditMode() {
    this.name = this.thisTile.querySelector("input").value;
    this.thisName.setHTML(`<h2 class="pizza-name">${this.name}</h2>`);
    this.saveBtn.remove();
    this.saveBtn = "";
    this.toppingsList.innerHTML = this.selecters.reduce(
      (acc, sel) => acc + `<li class="toppings-list-topping">${sel.value}</li>`,
      ``
    );
    // this.selecters.forEach(
    //   (sel) =>
    //     (sel.innerHTML = `<li class="toppings-list-topping">${sel.value}</li>`)
    // );
  }

  removePizza() {
    this.thisTile.remove();
    pizzaTracker.deletePizza(this);
  }
}

class PizzaTracker {
  allPizzas = [];

  constructor() {
    this.setAllPizzas();
  }

  setAllPizzas() {
    if (!localStorage.getItem("pizzas")) return;

    const pizzas = JSON.parse(localStorage.getItem("pizzas"));
    pizzas.forEach((piz) => this.createPizza(piz));
  }

  storePizzas() {
    localStorage.setItem("pizzas", JSON.stringify(this.allPizzas));
  }

  createPizza(pizza) {
    if (!this.checkIfDuplicate(pizza)) return;
    const newPizza = new Pizza(pizza);
    this.allPizzas.push(newPizza);
    this.storePizzas();
  }

  checkIfDuplicate(pizza) {
    if (this.allPizzas.some((piz) => piz.name === pizza.name)) {
      alert("There is already a pizza with this name!");
      return false;
    }
    if (
      this.allPizzas.some(
        (piz) =>
          JSON.stringify(piz.toppings) === JSON.stringify(pizza.toppings.sort())
      )
    ) {
      alert("There is already a pizza with all of these toppings!");
      return false;
    }
    return true;
  }

  deletePizza(pizza) {
    const pizzaIndex = this.allPizzas.indexOf(pizza);
    this.allPizzas.splice(pizzaIndex, 1);
  }
}
const pizzaTracker = new PizzaTracker();

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
};

createBtn.addEventListener("click", startNewPizza);
