"use strict";

const createBtn = document.querySelector(".create-btn");
let newPizza;

class NewPizza {
  toppingsAvailable = new Set(localStorage.getItem("toppings").split(","));
  toppingsUsed = new Set();
  toppingsCount = 0;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
    <ul class="new-pizza">
      <li class="new-pizza-name">
        <span>Name: </span><input type="text" />
      </li>
      <li>
        <span>Topping ${this.toppingsCount + 1}: </span>
        <select class="new-pizza-toppings">
          ${this.generateOptions(this.toppingsAvailable)}
        </select>
      </li>
    </ul>`;
    createBtn.insertAdjacentHTML("afterend", ul);
    const dropDown = document.querySelector(".new-pizza-toppings");
    dropDown.addEventListener("change", this.updateToppings.bind(this));
  }

  generateOptions(toppings) {
    let options = `<option value="none" selected disabled hidden>Choose one</option>`;
    toppings.forEach(
      (top) => (options += `<option value="${top}">${top}</option>`)
    );
    return options;
  }

  updateToppings() {
    console.log("hi");
  }
}

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
  console.log(newPizza);
};

// const startNewPizza = function () {
//   const toppingsAvailable = new Set(
//     localStorage.getItem("toppings").split(",")
//   );
//   console.log(toppingsAvailable);
//   const toppingsUsed = new Set();
//   const toppingsCount = 0;
//   const ul = `
//   <ul class="new-pizza">
//     <li class="new-pizza-name">
//       <span>Name: </span><input type="text" />
//     </li>
//     <li>
//       <span>Topping ${toppingsCount + 1}: </span>
//       <select class="new-pizza-toppings">
//         ${generateOptions(toppingsAvailable)}
//       </select>
//     </li>
//   </ul>`;
//   createBtn.insertAdjacentHTML("afterend", ul);
//   const dropDown = document.querySelector(".new-pizza-toppings");
//   dropDown.addEventListener("change");
// };

// const generateOptions = function (toppings) {
//   let options = ``;
//   console.log(toppings);
//   console.log(toppings.size);
//   toppings.forEach((top) => (options += `<option>${top}</option>`));
//   console.log(options);
//   return options;
// };

createBtn.addEventListener("click", startNewPizza);
// console.log(localStorage);
