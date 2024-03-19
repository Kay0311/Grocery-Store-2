import router from "./router.js";
const app = new Vue({
  el: "#app",
  router: router,
  //delimiters : ['${','}'],
  data: {
    message: "Hello",
    text: "asdfg",
    flag: false,
  },
});
