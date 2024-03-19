import navbar from "./navbar.js";

const profile = Vue.component("profile", {
  template: `
  <div>
  <navbar></navbar>
  <div class="container mt-4">
    <div class="d-flex align-items-center mb-4">
      <i class="bi bi-person-circle fs-2 me-2"></i> <!-- Bootstrap Icons person circle icon -->
      <h2 class="mb-0">Profile</h2>
    </div>
    <div>
      <h6>Username: {{ name }}</h6>
      <h6>Email Address: {{ email }}</h6>
      <h6>Role: {{ role }}</h6>
      <!-- If the role is user only then show - button to register as manager-->
      <p v-if="role === 'user'">Want to register as a manager?</p>
          <button v-if="role === 'user'" class="btn btn-primary" @click="RegisterManager">Register As Manager</button>
    </div>
  </div>
  </div>
    `,
  data() {
    return {
      name: "",
      email: "",
      password: "",
      role: "",
    };
  },
  components: {
    navbar,
  },
  methods: {
    fetchprofile() {
      const token = localStorage.getItem("token");
      fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token + "",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.name = data.username;
          this.email = data.email;
          this.role = data.roles;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    RegisterManager() {
      const token = localStorage.getItem("token");
      fetch("/register/manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token + "",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          alert(data.message);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    this.fetchprofile();
  },
});

export default profile;
