document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const dataTable = document.getElementById("dataTable");
  const tableBody = dataTable.querySelector("tbody");
  const tableHeader = dataTable.querySelector("thead");
  const tooltip = document.getElementById("tooltip");
  const favoritesTableBody = document.querySelector("#favoritesTable tbody");

  let globalData = [];

  fetch("SMT3.csv")
    .then(function (res) {
      return res.text();
    })
    .then(function (csvText) {
      globalData = Papa.parse(csvText.trim(), { skipEmptyLines: true }).data.filter(function (row) {
        return row.length === 6;
      });
      populateTable(globalData);

      searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = globalData.filter(function (row, i) {
          return i === 0 || row.some(function (cell) {
            return cell.toLowerCase().includes(searchTerm);
          });
        });
        populateTable(filteredData);
      });
    });

  function populateTable(data) {
    tableBody.innerHTML = "";
    tableHeader.innerHTML = "";

    const headerRow = document.createElement("tr");
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const headerText = data[0][colIndex];
      const th = document.createElement("th");
      th.textContent = headerText;

      const lower = headerText.toLowerCase();
      const tooltipMap = {
        "weak": { text: "This element deals more damage to enemy", bg: "#8b0000" },
        "strong": { text: "This element deals less damage to enemy", bg: "#00008b" },
        "null": { text: "This element deals no damage to enemy", bg: "#2f4f4f" },
        "drain": { text: "This element is absorbed by enemy", bg: "#006400" },
        "repel": { text: "This element will be reflected by enemy", bg: "#8b8000" }
      };

      if (tooltipMap[lower]) {
        th.dataset.tooltip = tooltipMap[lower].text;
        th.dataset.tooltipBg = tooltipMap[lower].bg;
      }

      th.addEventListener("mouseover", function () {
        if (th.dataset.tooltip) {
          tooltip.textContent = th.dataset.tooltip;
          tooltip.style.backgroundColor = th.dataset.tooltipBg;
          tooltip.style.display = "block";
        }
      });

      th.addEventListener("mousemove", function (e) {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY + 10 + "px";
      });

      th.addEventListener("mouseout", function () {
        tooltip.style.display = "none";
      });

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
          button.onclick = function () {
            addToFavorites(row[0], row[1]);
          };
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
      if (rows[i].children[0].textContent === name) {
        return;
      }
    }

    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const weakCell = document.createElement("td");

    const button = document.createElement("button");
    button.className = "demon-button";
    button.textContent = name;
    button.onclick = function () {
      tr.remove();
    };

    nameCell.appendChild(button);
    weakCell.textContent = weak;

    tr.appendChild(nameCell);
    tr.appendChild(weakCell);
    favoritesTableBody.appendChild(tr);
  }

  dataTable.addEventListener("mouseover", function (e) {
    if (e.target.tagName !== "TD") return;

    const cell = e.target;
    const cellIndex = cell.cellIndex;

    const allTds = dataTable.querySelectorAll("tbody td");
    for (let i = 0; i < allTds.length; i++) {
      allTds[i].classList.remove("hovered-col", "hovered-cell");
    }

    const allRows = dataTable.querySelectorAll("tbody tr");
    for (let i = 0; i < allRows.length; i++) {
      const td = allRows[i].cells[cellIndex];
      if (td) {
        td.classList.add("hovered-col");
      }
    }

    cell.classList.add("hovered-cell");
  });

  dataTable.addEventListener("mouseout", function (e) {
    if (e.target.tagName !== "TD") return;

    const allTds = dataTable.querySelectorAll("tbody td");
    for (let i = 0; i < allTds.length; i++) {
      allTds[i].classList.remove("hovered-col", "hovered-cell");
    }
  });
});
