document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const dataTable = document.getElementById("dataTable");
  const tableBody = dataTable.querySelector("tbody");
  const tableHeader = dataTable.querySelector("thead");
  const tooltip = document.getElementById("tooltip");
  const favoritesTableBody = document.querySelector("#favoritesTable tbody");

  let globalData = [];

  const tooltipMap = {
    "weak": { text: "This element deals more damage to enemy", bg: "#8b0000" },
    "strong": { text: "This element deals less damage to enemy", bg: "#00008b" },
    "null": { text: "This element deals no damage to enemy", bg: "#2f4f4f" },
    "drain": { text: "This element is absorbed by enemy", bg: "#006400" },
    "repel": { text: "This element will be reflected by enemy", bg: "#8b8000" }
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

  function populateTable(data) {
    tableBody.innerHTML = "";
    tableHeader.innerHTML = "";

    // Create header
    const headerRow = document.createElement("tr");
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const headerText = data[0][colIndex];
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    }
    tableHeader.appendChild(headerRow);

    // Create rows
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

  // Hover logic for rows & columns excluding first column (index 0)
  dataTable.addEventListener("mouseover", function (e) {
    const target = e.target;
    if (target.tagName !== "TD") return;
    if (target.cellIndex === 0) {
      tooltip.style.display = "none";
      return;
    }

    const colIndex = target.cellIndex;
    const tooltipKey = tableHeader.querySelector("th:nth-child(" + (colIndex + 1) + ")").textContent.toLowerCase();
    const tooltipData = tooltipMap[tooltipKey];

    if (tooltipData) {
      tooltip.textContent = tooltipData.text;
      tooltip.style.backgroundColor = tooltipData.bg;
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }

    // Highlight column and cell
    clearHoverClasses();
    const allRows = dataTable.querySelectorAll("tbody tr");
    for (let i = 0; i < allRows.length; i++) {
      const td = allRows[i].cells[colIndex];
      if (td) td.classList.add("hovered-col");
    }
    target.classList.add("hovered-cell");
  });

  dataTable.addEventListener("mousemove", function (e) {
    if (tooltip.style.display === "block") {
      tooltip.style.left = e.pageX + 10 + "px";
      tooltip.style.top = e.pageY + 10 + "px";
    }
  });

  dataTable.addEventListener("mouseout", function (e) {
    if (e.target.tagName !== "TD") return;
    clearHoverClasses();
    tooltip.style.display = "none";
  });

  function clearHoverClasses() {
    const allTds = dataTable.querySelectorAll("tbody td");
    allTds.forEach(td => td.classList.remove("hovered-col", "hovered-cell"));
  }
});