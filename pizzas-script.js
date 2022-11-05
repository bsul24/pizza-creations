"use strict";

const createBtn = document.querySelector(".create-btn");
const newPizzaContainer = document.querySelector(".new-pizza-container");
const seePizzasBtn = document.querySelector(".see-pizzas");
const pizzaTiles = document.querySelector(".pizza-tiles");
const pizzas = [];
let newPizza;

class NewPizza {
  allToppings = localStorage.getItem("toppings").split(",");
  toppingsAvailable = this.allToppings;
  addIngBtn;
  toppingsAdded = 1;
  pizzaName;
  pizzaToppings;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
    <ul class="new-pizza">
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
      <button class="save-pizza-btn">Save Pizza</button>
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
    this.pizzaName = name;
    const toppings = [...document.querySelectorAll(".new-pizza-toppings")];
    const toppingNames = toppings.reduce((acc, topping) => {
      if (topping.value !== "none") acc.push(topping.value);
      return acc;
    }, []);
    this.pizzaToppings = toppingNames;
    // pizzas.push(this);
    newPizza = "";
    generateNewPizza(this);
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

  constructor(pizza) {
    this.name = pizza.pizzaName;
    this.toppings = pizza.pizzaToppings;
    this.generateMarkup();
  }

  generateMarkup() {
    const html = `
      <div class="pizza-tile">
      <button class="pizza-tile-edit-btn">✏️</button>
        <h2 class="pizza-name">${this.name}</h2>
        <h3 class="pizza-toppings">Toppings</h3>
        <ul class="toppings-list">
          ${this.generateToppings()}
        </ul>
      </div>
    `;
    pizzaTiles.insertAdjacentHTML("beforeend", html);
    this.storeDOM();
    this.addEditBtnHandler();
  }

  generateToppings() {
    return this.toppings.reduce(
      (acc, top) => acc + `<li class="toppings-list-topping">${top}</li>`,
      ``
    );
  }

  addEditBtnHandler() {
    const editBtn = this.thisTile.querySelector(".pizza-tile-edit-btn");
    editBtn.addEventListener("click", this.startEditMode.bind(this));
  }

  storeDOM() {
    this.thisTile = document.querySelector(".pizza-tile:last-child");
    this.thisName = this.thisTile.querySelector(".pizza-name");
    this.thisToppings = this.thisTile.querySelectorAll(
      ".toppings-list-topping"
    );
  }

  startEditMode() {
    this.thisName.setHTML(`<input type="text" value="${this.name}" />`);
    const saveBtn = `<button class="edit-save-btn">Save</button>`;
    this.thisTile.insertAdjacentHTML("beforeend", saveBtn);
    this.thisTile
      .querySelector(".edit-save-btn")
      .addEventListener("click", this.endEditMode.bind(this));
  }

  endEditMode() {
    this.name = this.thisTile.querySelector("input").value;
    this.thisName.setHTML(`<h2 class="pizza-name">${this.name}</h2>`);
  }
}

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
};

const generateNewPizza = function (pizza) {
  const newPizza = new Pizza(pizza);
  pizzas.push(newPizza);
};

createBtn.addEventListener("click", startNewPizza);
