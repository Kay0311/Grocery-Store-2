import adminnavbar from "./adminnavbar.js";

const request = Vue.component("request", {
  template: `
        <div>
        <adminnavbar></adminnavbar>
        <div class="container">
        <h4>Manager Access Requests</h4>
        <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Request ID</th>
            <th scope="col">User ID</th>
            <th scope="col">User Name</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody v-if="manager_request.length > 0">
        <!-- <tr v-for="request in manager_request" v-if="norequest">-->
          <tr v-for="request in manager_request"> 
            <td>{{ request.request_id }}</td>
            <td>{{ request.user_id }}</td>
            <td>{{ request.username}}</td> 
            <td><button type="button" class="btn btn-primary" @click="acceptmanagerrequest(request)">Accept</button> 
            <button type="button" class="btn btn-danger" @click="rejectmanagerrequest(request)">Reject</button></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
          <td colspan="4">No manager access requests</td>
          </tr>
        </tbody>
        </table>
        <br>
        <h4>Section Create Request</h4>
        <table class="table table-striped">
        <thead> 
          <tr>
            <th scope="col">Request ID</th>
            <th scope="col">Section Name</th>
            <th scope="col">Request Description</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in sectionrequest" v-if="request.request_description == 'new section'">
            <td>{{ request.request_id }}</td>
            <td>{{ request.section_name }}</td>
            <td>{{ request.request_description }}</td>
            <td><button type="button" class="btn btn-primary" @click="acceptcreaterequest(request)">Accept</button> 
            <button type="button" class="btn btn-danger" @click="rejectcreaterequest(request)">Reject</button></td>
          </tr>
        </tbody>
        </table>
        <h4>Section Edit Requests</h4>
        <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Request ID</th>
            <th scope="col">Section Name</th>
            <th scope="col">New Sction Name</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in sectionrequest"  v-if="request.request_description === 'update section'">
            <td>{{ request.request_id }}</td>
            <td>{{ request.section_name }}</td>
            <td>{{ request.new_section_name}}</td> 
            <td><button type="button" class="btn btn-primary" @click="acceptcreaterequest(request)">Accept</button> 
            <button type="button" class="btn btn-danger" @click="rejectcreaterequest(request)">Reject</button></td>
          </tr>
        </tbody>
        </table>
        <h4>Section Delete Requests</h4>
        <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Request ID</th>
            <th scope="col">Section Name</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in sectionrequest" v-if="request.request_description === 'delete section'">

            <td>{{ request.request_id }}</td>   
            <td>{{ request.section_name }}</td>
            <td><button type="button" class="btn btn-primary" @click="acceptcreaterequest(request)">Accept</button>
            <button type="button" class="btn btn-danger" @click="rejectcreaterequest(request)">Reject</button></td>
          </tr>
        </tbody>
        </table>
        </div>
        </div>
    `,
  data() {
    return {
      sectionrequest: [],
      manager_request: [],
      norequest: false,
    };
  },
  mounted() {
    this.fetchsectionrequest();
    this.fetchmanagerrequest();
  },
  methods: {
    fetchmanagerrequest() {
      fetch("/manager/requests", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.manager_request = data;
          if (data.length == 0) {
            this.norequest = true;
          } else {
            this.norequest = false;
          }
        })
        .catch((error) => console.error(error));
    },
    acceptmanagerrequest(request) {
      if (!confirm("Are you sure you want to accept this request?")) return;
      fetch("/accept/manager/" + request.user_id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.fetchmanagerrequest();
        })
        .catch((error) => console.error(error));
    },
    rejectmanagerrequest(request) {
      if (!confirm("Are you sure you want to reject this request?")) return;
      fetch("/reject/manager/" + request.user_id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.fetchmanagerrequest();
        })
        .catch((error) => console.error(error));
    },
    fetchsectionrequest() {
      fetch("/api/sectionrequest")
        .then((response) => response.json())
        .then((data) => {
          this.sectionrequest = data;
        })
        .catch((error) => console.error(error));
    },
    acceptcreaterequest(request) {
      if (!confirm("Are you sure you want to accept this request?")) return;
      fetch("/api/sectionrequest/" + request.request_id, {
        method: "PUT",
        body: JSON.stringify({
          section_name: request.section_name,
          new_section_name: request.new_section_name,
          request_description: request.request_description,
          request_status: true,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.fetchsectionrequest();
        })
        .catch((error) => console.error(error));
    },
    rejectcreaterequest(request) {
      if (!confirm("Are you sure you want to reject this request?")) return;
      fetch("/api/sectionrequest/" + request.request_id, {
        method: "PUT",
        body: JSON.stringify({
          section_name: request.section_name,
          request_description: request.request_description,
          request_status: false,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.fetchsectionrequest();
        })
        .catch((error) => console.error(error));
    },
  },
});

export default request;
