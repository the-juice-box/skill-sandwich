const box = document.querySelector(".tech-tree");

let isDown = false;
let startX;
let startY;
let scrollLeft;
let scrollTop;

box.addEventListener("mousedown", (e) => {
  console.log("DOWN " + box.scrollTop);

  isDown = true;
  startX = e.pageX - box.offsetLeft;
  startY = e.pageY - box.offsetTop;

  console.log("pageY " + e.pageY);
  scrollLeft = box.scrollLeft;
  scrollTop = box.scrollTop;
  box.style.cursor = "grabbing";
});

box.addEventListener("mouseleave", () => {
  isDown = false;
  box.style.cursor = "grab";
});

box.addEventListener("mouseup", () => {
  isDown = false;
  box.style.cursor = "grab";
});

document.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  console.log("MOVE");
  e.preventDefault();
  const x = e.pageX - box.offsetLeft;
  const y = e.pageY - box.offsetTop;

  console.log("y start " + startY);
  const walkX = (x - startX) * 0.01; // Change this number to adjust the scroll speed
  const walkY = (y - startY) * 0.01; // Change this number to adjust the scroll speed

  window.scrollBy(walkX, walkY);
  //console.log("scrollLeft " + box.scrollLeft);
  //box.scrollLeft += walkX; // these don't do anything
 // box.scrollTop += walkY; // https://stackoverflow.com/questions/76066584/how-to-enable-touch-like-scrolling-by-grabbing-and-dragging-with-the-mouse

  console.log("Scroll top " + (scrollTop - walkY));
});
