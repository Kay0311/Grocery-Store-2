import navbar from "./navbar.js";

const register = Vue.component("register", {
  template: `
<div>
  <navbar></navbar>
<div class="container">
  <div class="row">
    <div class="col-md-6 offset-md-3 mt-5">
        <form @submit.prevent="registerUser" class="form-signin">
              <h1 class="h3 mb-3 font-weight-normal">Register</h1>
              <label for="inputUsername" class="sr-only">Username</label>
              <input v-model="username" type="text" id="inputUsername" class="form-control" placeholder="Username" required autofocus>
              <label for="inputEmail" class="sr-only">Email address</label>
              <input v-model="email" type="email" id="inputEmail" class="form-control" placeholder="Email address" required>
              <label for="inputPassword" class="sr-only">Password</label>
              <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
              <button class="btn btn-lg btn-primary btn-block" type="submit">Register</button>
              <h6>Already have an account?</h6>
              <div class="form-group">
              <router-link to="/login" tag="a" class="btn btn-secondary">Login</router-link>
              </div>
        </form>
    </div>
  </div>
</div>
</div>
`,
  data() {
    return {
      username: "",
      email: "",
      password: "",
    };
  },
  components: {
    navbar,
  },
  methods: {
    registerUser() {
      fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password,
        }),
      })
        .then((response) => {
          if (response.status === 201) {
            this.$router.push("/login");
          } else {
            throw new Error("User not registered");
          }
        })
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default register;
