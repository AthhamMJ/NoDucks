const container = document.getElementById("lottie-animation");

lottie.loadAnimation({
  container,
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "./jupiternoducks.json",
});