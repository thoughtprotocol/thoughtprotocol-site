// js/dice.js

function renderDice(container, value, bits = 8) {
    if (!container) return;
  
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
  
    const max = (1 << bits) - 1;
    if (n > max) return;
  
    const binary = n.toString(2).padStart(bits, "0");
    container.innerHTML = "";
  
    for (const bit of binary) {
      const die = document.createElement("span");
      die.className = "die" + (bit === "1" ? " on" : "");
      container.appendChild(die);
    }
  }

  function buildDiceTable(tbodyId, bits) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
  
    tbody.innerHTML = "";
  
    const max = (1 << bits) - 1;
  
    // --- Weight label row ---
    const weightRow = document.createElement("tr");
    const weightLabelCell = document.createElement("td");
    weightLabelCell.textContent = "Bit weight";
    weightLabelCell.className = "text-body-secondary small";
  
    const weightDiceCell = document.createElement("td");
    const weights = document.createElement("div");
    weights.className = "dice-byte dice-weights";
  
    const allWeights = [128, 64, 32, 16, 8, 4, 2, 1];
    const visibleWeights = allWeights.slice(8 - bits);
  
    visibleWeights.forEach(w => {
      const span = document.createElement("span");
      span.textContent = w;
      span.className = "dice-weight";
      weights.appendChild(span);
    });
  
    weightDiceCell.appendChild(weights);
    weightRow.appendChild(weightLabelCell);
    weightRow.appendChild(weightDiceCell);
    tbody.appendChild(weightRow);
  
    // --- Dice rows ---
    for (let value = 0; value <= max; value++) {
      const tr = document.createElement("tr");
  
      const tdDec = document.createElement("td");
      tdDec.textContent = value;
  
      const tdDice = document.createElement("td");
      const dice = document.createElement("div");
      dice.className = "dice-byte";
  
      tdDice.appendChild(dice);
      tr.appendChild(tdDec);
      tr.appendChild(tdDice);
      tbody.appendChild(tr);
  
      renderDice(dice, value, bits);
    }
  }
    
//  function buildDiceTable(tbodyId, bits) {
//    const tbody = document.getElementById(tbodyId);
//    if (!tbody) return;
//  
//    tbody.innerHTML = "";
//  
//    const max = (1 << bits) - 1;
//  
//    for (let value = 0; value <= max; value++) {
//      const tr = document.createElement("tr");
//  
//      const tdDec = document.createElement("td");
//      tdDec.textContent = value;
//  
//      const tdDice = document.createElement("td");
//      const dice = document.createElement("div");
//      dice.className = "dice-byte";
//      tdDice.appendChild(dice);
//  
//      tr.appendChild(tdDec);
//      tr.appendChild(tdDice);
//      tbody.appendChild(tr);
//  
//      renderDice(dice, value, bits);
//    }
//  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // Build only if those tbodies exist on the current page
    buildDiceTable("diceTableBits4", 4);
    buildDiceTable("diceTableBits5", 5);
    buildDiceTable("diceTableBits6", 6);
    buildDiceTable("diceTableBits7", 7);
    buildDiceTable("diceTableBits8", 8);
  });
  

// js/dice.js

/**
 * Render an 8-die "byte" for a number 0–255 into a container element.
 * A "1" bit shows a pip; a "0" bit is a blank die face.
 */
// function renderDiceByte(container, value) {
//    if (!container) return;
//  
//    const n = Number(value);
//    if (!Number.isFinite(n) || n < 0 || n > 255) return;
//  
//    const binary = n.toString(2).padStart(8, "0");
//    container.innerHTML = "";
//  
//    for (const bit of binary) {
//      const die = document.createElement("span");
//      die.className = "die" + (bit === "1" ? " on" : "");
//      container.appendChild(die);
//    }
//  }
//  
//  /**
//   * If a <tbody id="diceTableBody"></tbody> exists on the page,
//   * generate rows for 0–255 and inject a .dice-byte container into each row.
//   */
//  function buildDiceTableIfPresent() {
//    const tableBody = document.getElementById("diceTableBody");
//    if (!tableBody) return;
//  
//    // Clear in case of re-renders/hot reloads
//    tableBody.innerHTML = "";
//  
//    for (let value = 0; value <= 255; value++) {
//      const row = document.createElement("tr");
//  
//      const decCell = document.createElement("td");
//      decCell.textContent = value;
//  
//      const diceCell = document.createElement("td");
//      const dice = document.createElement("div");
//      dice.className = "dice-byte";
//      dice.dataset.value = String(value);
//  
//      diceCell.appendChild(dice);
//  
//      row.appendChild(decCell);
//      row.appendChild(diceCell);
//      tableBody.appendChild(row);
//    }
//  }
//  
//  /**
//   * Render any .dice-byte elements that declare a data-value.
//   */
//  function renderAllDiceBytes() {
//    document.querySelectorAll(".dice-byte[data-value]").forEach((el) => {
//      const value = parseInt(el.dataset.value, 10);
//      renderDiceByte(el, value);
//    });
//  }
//  
//  document.addEventListener("DOMContentLoaded", () => {
//    buildDiceTableIfPresent();
//    renderAllDiceBytes();
//  });
  









// dice.js
//function renderDiceByte(container, value) {
//    if (!container || value < 0 || value > 255) return;
//  
//    const binary = value.toString(2).padStart(8, "0");
//    container.innerHTML = "";
//  
//    for (const bit of binary) {
//      const die = document.createElement("span");
//      die.className = "die" + (bit === "1" ? " on" : "");
//      container.appendChild(die);
//    }
//  }
//  
//  // Auto-render any dice-byte blocks on the page
//  document.addEventListener("DOMContentLoaded", () => {
//    document.querySelectorAll(".dice-byte[data-value]").forEach(el => {
//      const value = parseInt(el.dataset.value, 10);
//      renderDiceByte(el, value);
//    });
//  });
  