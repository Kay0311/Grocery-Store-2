import navbar from "./navbar.js";

const Home = Vue.component("home", {
  template: `
  <div>
  <navbar></navbar>
        <div class="container">
            <h2>Home</h2>
            This is the Home page.
        </div>
        </div>`,
  components: {
    navbar,
  },
});

export default Home;
