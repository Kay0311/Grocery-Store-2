import navbar from "./navbar.js";

const login = Vue.component("login", {
  template: `
    <div>
    <navbar></navbar>
    <div class="container">
      <form @submit.prevent="loginUser">
      <div class="form-group">
          <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
        </div>
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" class="form-control" required>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>
        <h6>Don't have an account?</h6>
        <div class="form-group">
          <router-link to="/register" tag="a" class="btn btn-secondary">Register</router-link>
        </div>
      </form>
    </div>
    </div>
  `,
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  components: {
    navbar,
  },
  methods: {
    loginUser() {
      const formData = {
        username: this.username,
        password: this.password,
      };
      console.log(formData);
      fetch("/userlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 404) {
            this.errorMessage = "User Not Found";
          } else {
            this.errorMessage = "Invalid username and/or password";
          }
        })
        .then((data) => {
          if (data) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            if (data.role == "admin") {
              this.$router.push("/admin");
            } else if (data.role == "manager") {
              this.$router.push("/manager");
            } else {
              this.$router.push("/");
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export default login;
