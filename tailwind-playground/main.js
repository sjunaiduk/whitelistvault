table = document.getElementById("dim");

document.querySelectorAll(".table__row-details").forEach(function (row) {
  row.addEventListener("click", function () {
    document.querySelectorAll(".row-action--expanded").forEach(function (el) {
      if (el === row.parentElement) return; // skip the current element (the one we just clicked on
      el.classList.toggle("row-action--expanded");
      el.classList.toggle("action-hidden");
    });

    if (!row.parentElement.classList.contains("row-action--expanded")) {
      // make table li font color dim
      document.querySelectorAll(".table__row-details").forEach(function (el) {
        el.style.color = "rgba(255, 255, 255, 0.3)";
      });
    } else {
      document.querySelectorAll(".table__row-details").forEach(function (el) {
        el.style.color = "rgba(255, 255, 255, 0.8)";
      });
    }
    row.parentElement.classList.toggle("row-action--expanded");
    row.parentElement.classList.toggle("action-hidden");
  });
});

// if any other element is currently expanded, collapse it
