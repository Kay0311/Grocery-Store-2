const navbar = Vue.component("navbar", {
  template: `
  <nav class="navbar navbar-expand-sm bg-light navbar-light">
  <div class="container">
    <router-link class="navbar-brand" to="/">
      <span class="navbar-text"><strong>Grocery Store</strong></span>
    </router-link>
    <div class="d-flex justify-content-end w-100"> <!-- Use justify-content-end to push items to the right -->
      <ul class="navbar-nav">
        <router-link class="nav-link active" to="/" v-if="token">
          <span class="navbar-text"><strong>Home</strong></span>
        </router-link>
        <router-link class="nav-link active" to="/profile" v-if="token">
          <span class="navbar-text"><strong>Profile</strong></span>
        </router-link>
        <router-link class="nav-link active" to="/cart" v-if="token">
        <span class="navbar-text">
        <i class="bi bi-cart"></i> <!-- Bootstrap Icons cart icon -->
        <strong>Cart</strong>
        </span>
        </router-link>
        <router-link v-if="!token" class="nav-link active" to="/login">
          <span class="navbar-text"><strong>Login/Register</strong></span>
        </router-link>
        <button v-if="token" @click="logout" class="btn btn-link nav-link active">
          <span class="navbar-text"><i class="fas fa-sign-out-alt"></i><strong>Logout</strong></span>
        </button>
      </ul>
    </div>
  </div>
</nav>


    `,
  data() {
    return {
      token: "",
      searchedWord: "",
    };
  },
  mounted() {
    this.token = localStorage.getItem("token");
  },
  methods: {
    logout() {
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          this.$router.push("/");
          location.reload();
        });
    },
    search() {
      console.log("Searching for:", this.searchedWord);
    },
  },
});


export default navbar;
