const body = document.querySelector(".tech-tree");
const zoomInBtn = document.querySelector(".zoom-in-btn");
const zoomOutBtn = document.querySelector(".zoom-out-btn");

const ZOOM_AMOUNT = 1.1;

zoomInBtn.addEventListener("click", function() {
    body.style.zoom = window.getComputedStyle(body).getPropertyValue('zoom') * ZOOM_AMOUNT;
});
zoomOutBtn.addEventListener("click", function() {
    body.style.zoom = window.getComputedStyle(body).getPropertyValue('zoom') / ZOOM_AMOUNT;
});
