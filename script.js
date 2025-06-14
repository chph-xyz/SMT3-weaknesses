document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const dataTable = document.getElementById("dataTable");
  const favoritesTable = document.getElementById("favoritesTable");
  const tableBody = dataTable.querySelector("tbody");
  const tableHeader = dataTable.querySelector("thead");
  const tooltip = document.getElementById("tooltip");
  const favoritesTableBody = favoritesTable.querySelector("tbody");
  const resetFavoritesButton = document.getElementById("resetFavoritesButton");
  const focusSearchButton = document.getElementById("focusSearchButton");

  let globalData = [];

  const tooltipMap = {
    "weak":   { text: "This element deals more damage to enemy",       bg: "#8b0000" },
    "strong": { text: "This element deals less damage to enemy",       bg: "#00008b" },
    "null":   { text: "This element deals no damage to enemy",         bg: "#2f4f4f" },
    "drain":  { text: "This element is absorbed by enemy",             bg: "#006400" },
    "repel":  { text: "This element will be reflected by enemy",       bg: "#8b8000" }
  };

  fetch("SMT3.csv")
    .then(res => res.text())
    .then(csvText => {
      globalData = Papa.parse(csvText.trim(), { skipEmptyLines: true }).data.filter(row => row.length === 6);
      populateTable(globalData);

      searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = globalData.filter((row, i) => {
          return i === 0 || row.some(cell => cell.toLowerCase().includes(searchTerm));
        });
        populateTable(filteredData);
      });
    });

  focusSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    populateTable(globalData);
  });

  resetFavoritesButton.addEventListener("click", () => {
    favoritesTableBody.innerHTML = "";
  });

  function populateTable(data) {
    tableBody.innerHTML = "";
    tableHeader.innerHTML = "";

    const headerRow = document.createElement("tr");
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const headerText = data[0][colIndex];
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    }
    tableHeader.appendChild(headerRow);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const tr = document.createElement("tr");

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const td = document.createElement("td");
        if (colIndex === 0) {
          const button = document.createElement("button");
          button.className = "demon-button";
          button.textContent = row[0];
          button.onclick = () => addToFavorites(row[0], row[1]);
          td.appendChild(button);
        } else {
          td.textContent = row[colIndex];
        }
        tr.appendChild(td);
      }
      tableBody.appendChild(tr);
    }
  }

  function addToFavorites(name, weak) {
    const rows = favoritesTableBody.children;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].children[0].textContent === name) return;
    }

    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const weakCell = document.createElement("td");

    const button = document.createElement("button");
    button.className = "demon-button";
    button.textContent = name;
    button.onclick = () => tr.remove();

    nameCell.appendChild(button);
    weakCell.textContent = weak;

    tr.appendChild(nameCell);
    tr.appendChild(weakCell);
    favoritesTableBody.appendChild(tr);
  }

  function handleTooltipHover(e, table, headerSelector) {
    const target = e.target;
    if (target.tagName !== "TD") return;
    if (target.cellIndex === 0) {
      tooltip.style.display = "none";
      return;
    }

    const colIndex = target.cellIndex;
    const headerCell = document.querySelector(`${headerSelector} th:nth-child(${colIndex + 1})`);
    const tooltipKey = headerCell.textContent.toLowerCase();
    const tooltipData = tooltipMap[tooltipKey];

    if (tooltipData) {
      const base = tooltipData.text;
      const content = target.textContent;
      let extra = "";

      if (content.includes("Nat")) extra += "Nat - Fir Ice Elc Frc\n";
      if (content.includes("Mor")) extra += "Mor - Lgt Drk\n";
      if (content.includes("Spi")) extra += "Spi - Crs Nrv Mnd\n";
      if (content.includes("Sta")) extra += "Sta - Lgt Drk Crs Nrv Mnd\n";

      tooltip.innerHTML = base + (extra ? "<br>" + extra.trim().replace(/\n/g, "<br>") : "");
      tooltip.style.backgroundColor = tooltipData.bg;
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }

    clearHoverClasses();
    const allRows = table.querySelectorAll("tbody tr");
    for (let i = 0; i < allRows.length; i++) {
      const td = allRows[i].cells[colIndex];
      if (td) td.classList.add("hovered-col");
    }
    target.classList.add("hovered-cell");
  }

  function clearHoverClasses() {
    const allTds = document.querySelectorAll("td");
    allTds.forEach(td => td.classList.remove("hovered-col", "hovered-cell"));
  }

  [dataTable, favoritesTable].forEach((table) => {
    table.addEventListener("mouseover", (e) => {
      const headerSelector = table.id === "dataTable" ? "#dataTable thead" : "#favoritesTable thead";
      handleTooltipHover(e, table, headerSelector);
    });

    table.addEventListener("mousemove", function (e) {
      if (tooltip.style.display === "block") {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY + 10 + "px";
      }
    });

    table.addEventListener("mouseout", function (e) {
      if (e.target.tagName !== "TD") return;
      clearHoverClasses();
      tooltip.style.display = "none";
    });
  });
});
