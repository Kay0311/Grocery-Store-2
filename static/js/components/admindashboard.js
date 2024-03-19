import adminnavbar from "./adminnavbar.js";

const adminDashboard = Vue.component("admin-dashboard", {
  template: `
        <div>
            <adminnavbar></adminnavbar>
            <div class="container">
                <h1>Admin Dashboard</h1>
                <div v-if="nosection">
                    <h5>No section has been Created</h5>
                    <button class="btn btn-primary" v-on:click="showsectionForm">Create Section</button>
                </div>
                <div v-else>
                    <button class="btn btn-primary" v-on:click="showsectionForm">Add Section</button>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Section ID</th>
                                <th>Section Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="section in section">
                                <td>{{section.section_id}}</td>
                                <td>{{section.section_name}}</td>
                                <td>
                                    <button class="btn btn-primary" @click="showeditsectionForm(section)">Edit</button>
                                    <button class="btn btn-danger" @click="deletesection(section.section_id)">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Section Name Modal -->
            <div v-if="isModalVisible" class="custom-modal-overlay">
                <div class="custom-modal">
                  <div class="modal-header">
                    <h5 class="modal-title">Create Section</h5>
                    <span @click="closeModal" class="close-btn">&times;</span>
                  </div>
                  <div class="modal-body">
                    <form @submit.prevent="submitSection">
                      <div class="form-group">
                        <label for="section_name">Section Name</label>
                        <input
                          type="text"
                          name="section_name"
                          id="section_name"
                          v-model="section_name"
                        />
                      </div>
                        <div style="margin-top:20px;">
                            <button type="submit" class="btn btn-primary">Submit</button>
                            <button type="button" class="btn btn-danger" @click="closeModal">Cancel</button>
                        </div>
                    </form>
                  </div>
                </div>
              </div>

              <div v-if="isupdateModalVisible" class="custom-modal-overlay">
              <div class="custom-modal">
                <div class="modal-header">
                  <h5 class="modal-title">Update Section</h5>
                  <span @click="closeModal" class="close-btn">&times;</span>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="submitupdateSection">
                    <div class="form-group">
                      <label for="section_name">Section Name</label>
                      <input
                        type="text"
                        name="section_name"
                        id="section_name"
                        v-model="selectedSection.section_name"
                      />
                    </div>
                      <div style="margin-top:20px;">
                          <button type="submit" class="btn btn-primary">Submit</button>
                          <button type="button" class="btn btn-danger" @click="closeupdateModal">Cancel</button>
                      </div>
                  </form>
                </div>
              </div>
            </div>
            
        </div>
    `,
  data() {
    return {
      message: "Admin Dashboard",
      section: [],
      nosection: false,
      section_name: "",
      isModalVisible: false,
      isupdateModalVisible: false,
      modalTitle: "",
      selectedSection: {
        section_id: "",
        section_name: "",
      },
    };
  },
  components: {
    adminnavbar,
  },
  mounted() {
    this.fetchsection();
  },
  methods: {
    fetchsection() {
      fetch("/api/section")
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.section = data;
          if (this.section.length == 0) {
            this.nosection = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    showeditsectionForm(section) {
      this.isupdateModalVisible = true;
      this.selectedSection.section_name = section.section_name;
      this.selectedSection.section_id = section.section_id;
    },
    closeupdateModal() {
      // Close the modal
      this.isupdateModalVisible = false;
    },
    showsectionForm() {
      this.isModalVisible = true;
    },
    closeModal() {
      // Close the modal
      this.isModalVisible = false;
    },
    submitSection() {
      fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section_name: this.section_name,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.closeModal();
          this.fetchsection();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submitupdateSection() {
      fetch("/api/section/" + this.selectedSection.section_id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section_name: this.selectedSection.section_name,
        }),
      })
        .then((response) => {
          if (response.ok) {
            this.closeupdateModal();
            this.fetchsection();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deletesection(id) {
      fetch("/api/section/" + id, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            this.fetchsection();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export default adminDashboard;
