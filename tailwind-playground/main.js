document.querySelectorAll(".show-row-action").forEach(function (el) {
  el.addEventListener("click", function () {
    el.parentElement.parentElement.classList.toggle("row-action--expanded");
    el.parentElement.parentElement.classList.toggle("action-hidden");
  });
});
