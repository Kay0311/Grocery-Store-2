import managernavbar from "./managernavbar.js";

const managerDashboard = Vue.component("manager-dashboard", {
  template: `
    <div>
      <managernavbar></managernavbar>
      <div class="container">
        <h1>Manager Dashboard</h1>
        <div v-if="noProduct">
          <h5>No product has been added</h5>
          <button class="btn btn-primary" @click="showProductForm">Add Product</button>
        </div>
        <div v-else>
          <button class="btn btn-primary" @click="showProductForm">Add Product</button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Manufacturing Date</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products">
                <td>{{ product.p_id }}</td>
                <td>{{ product.product_name }}</td>
                <td>{{ product.manufacturingdate }}</td>
                <td>{{ product.expirydate }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.unit }}</td>
                <td>
                  <button class="btn btn-primary" @click="showEditProductForm(product)">Edit</button>
                  <button class="btn btn-danger" @click="deleteProduct(product.p_id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="container">
        <h1>Sections</h1>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Section ID</th>
              <th>Section Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in sections">
              <td>{{ section.section_id }}</td>
              <td>{{ section.section_name }}</td>
              <td>
                <button class="btn btn-primary" @click="showEditSectionForm(section)">Edit</button>
                <button class="btn btn-danger" @click="deleteSection(section)">Delete</button>
                <button class="btn btn-secondary" @click="exportsection(section.section_id)">Export</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-primary" @click="showSectionForm">Add Section</button>
      </div>


      <!-- Product Name Modal -->
      <div v-if="isModalVisible" class="custom-modal-overlay">
        <div class="custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Add Product</h5>
            <span @click="closeModal" class="close-btn">&times;</span>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitProduct">
              <!-- Update form fields based on your product model -->
              <div class="form-group">
                <label for="product_name">Product Name</label>
                <input type="text" name="product_name" id="product_name" v-model="productName" />
              </div>
              <div class="form-group">
              <label for="section_name">Section</label>
              <select name="section_id" id="section_id" v-model="sectionName">
                <option value="">Select Section</option>
                <option v-for="section in sections" :value="section.section_name">{{ section.section_name }}</option>
              </select>
            </div>

              <div class="form-group">
                <label for="manufacturing_date">Manufacturing Date</label>
                <input type="datetime-local" name="manufacturing_date" id="manufacturing_date" v-model="manufacturingDate" />
              </div>
              <div class="form-group">
                <label for="expiry_date">Expiry Date</label>
                <input type="datetime-local" name="expiry_date" id="expiry_date" v-model="expiryDate" />
              </div>
              <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="text" name="quantity" id="quantity" v-model="quantity" />
              </div>
              <div class="form-group">
              <label for="price">Price</label>
              <input type="text" name="price" id="price" v-model="price" />
            </div>
              <div class="form-group">
                <label for="unit">Unit</label>
                <input type="text" name="unit" id="unit" v-model="unit" />
              </div>
              <div style="margin-top:20px;">
                <button type="submit" class="btn btn-primary">Submit</button>
                <button type="button" class="btn btn-danger" @click="closeModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>



      <!-- Update Product Modal -->
      <div v-if="isUpdateModalVisible" class="custom-modal-overlay">
        <div class="custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Update Product</h5>
            <span @click="closeUpdateModal" class="close-btn">&times;</span>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitUpdateProduct">
              <!-- Update form fields based on your product model -->
              <div class="form-group">
                <label for="product_name">Product Name</label>
                <input type="text" name="product_name" id="product_name" v-model="selectedProduct.product_name" />
              </div>
              <div class="form-group">
              <label for="section_name">Section</label>
              <select name="section_id" id="section_id" v-model="selectedProduct.section_name">
                <option value="">Select Section</option>
                <option v-for="section in sections" :value="section.section_name">{{ section.section_name }}</option>
              </select>
            </div>
              <div class="form-group">
                <label for="manufacturing_date">Manufacturing Date</label>
                <input type="datetime-local" name="manufacturing_date" id="manufacturing_date" v-model="selectedProduct.manufacturing_date" />
              </div>
              <div class="form-group">
                <label for="expiry_date">Expiry Date</label>
                <input type="datetime-local" name="expiry_date" id="expiry_date" v-model="selectedProduct.expiry_date" />
              </div>
              <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="text" name="quantity" id="quantity" v-model="selectedProduct.quantity" />
              </div>
              <div class="form-group">
              <label for="price">Price</label>
              <input type="text" name="price" id="price" v-model="selectedProduct.price" />
            </div>

              <div class="form-group">
                <label for="unit">Unit</label>
                <input type="text" name="unit" id="unit" v-model="selectedProduct.unit" />
              </div>
              <div style="margin-top:20px;">
                <button type="submit" class="btn btn-primary">Submit</button>
                <button type="button" class="btn btn-danger" @click="closeUpdateModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!-- Section Name Modal -->
      <div v-if="issectionModalVisible" class="custom-modal-overlay">
          <div class="custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">Create Section</h5>
              <span @click="closecsectionModal" class="close-btn">&times;</span>
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
                      <button type="button" class="btn btn-danger" @click="closecsectionModal">Cancel</button>
                  </div>
              </form>
            </div>
          </div>
        </div>

        <div v-if="isupdatesectionModalVisible" class="custom-modal-overlay">
        <div class="custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Update Section</h5>
            <span @click="closesectionModal" class="close-btn">&times;</span>
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
                    <button type="button" class="btn btn-danger" @click="closesectionModal">Cancel</button>
                </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      message: "Manager Dashboard",
      products: [],
      noProduct: false,
      productName: "",
      manufacturingDate: "",
      expiryDate: "",
      quantity: "",
      unit: "",
      sections: [],
      sectionName: "",
      price: "",
      selectedSection: { old_section_name: "" },
      isModalVisible: false,
      issectionModalVisible: false,
      isUpdateModalVisible: false,
      isupdatesectionModalVisible: false,
      selectedProduct: {
        manufacturing_date: "",
        expiry_date: "",
      },
    };
  },
  components: {
    managernavbar,
  },
  mounted() {
    this.fetchProducts();
    this.fetchSections();
  },
  methods: {
    deleteSection(section) {
      if (!confirm("Are you sure you want to delete this section?")) return;
      fetch("/api/sectionrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          section_name: section.section_name,
          request_description: "delete section",
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
          this.closesectionModal();
          alert(data.message);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submitupdateSection() {
      if (!confirm("Are you sure you want to update this section?")) return;
      fetch("/api/sectionrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          section_name: this.selectedSection.old_section_name,
          new_section_name: this.selectedSection.section_name,
          request_description: "update section",
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
          this.closesectionModal();
          alert(data.message);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    exportsection(section) {
      if (!confirm("Are you sure you want to export this section?")) return;
      fetch("/export/" + section, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          alert(data.message);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submitSection() {
      fetch("/api/sectionrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          section_name: this.section_name,
          request_description: "new section",
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
          this.closecsectionModal();
          this.fetchSections();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    showSectionForm() {
      this.issectionModalVisible = true;
    },
    closecsectionModal() {
      // Close the modal
      this.issectionModalVisible = false;
    },
    showEditSectionForm(section) {
      this.selectedSection = {
        old_section_name: section.section_name,
        ...section,
      };
      this.isupdatesectionModalVisible = true;
    },
    closesectionModal() {
      // Close the modal
      this.isupdatesectionModalVisible = false;
    },
    fetchSections() {
      fetch("/api/section", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.sections = data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    fetchProducts() {
      fetch("/api/product", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.products = data;
          if (this.products.length == 0) {
            this.noProduct = true;
          } else {
            this.noProduct = false;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    showEditProductForm(product) {
      this.selectedProduct = { ...product };
      this.isUpdateModalVisible = true;
    },
    closeUpdateModal() {
      // Close the modal
      this.isUpdateModalVisible = false;
    },
    showProductForm() {
      this.isModalVisible = true;
    },
    closeModal() {
      // Close the modal
      this.isModalVisible = false;
    },
    submitProduct() {
      fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          product_name: this.productName,
          manufacturingdate: this.manufacturingDate,
          expirydate: this.expiryDate,
          quantity: this.quantity,
          unit: this.unit,
          price: this.price,
          section_name: this.sectionName,
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
          if(data.error){
            alert(data.error);
          }
          else{
            alert(data.message);
            this.closeModal();
            this.fetchProducts();
          }
          
        })
        .catch((error) => {
          alert(error.message);
        });
    },
    submitUpdateProduct() {
      if (!confirm("Are you sure you want to update this product?")) return;
      fetch("/api/product/" + this.selectedProduct.p_id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: this.selectedProduct.product_name,
          manufacturingdate: this.selectedProduct.manufacturing_date,
          expirydate: this.selectedProduct.expiry_date,
          quantity: this.selectedProduct.quantity,
          unit: this.selectedProduct.unit,
          price: this.selectedProduct.price,
          section_name: this.selectedProduct.section_name,
        }),
      })
        .then((response) => {
          if (response.ok) {
            this.closeUpdateModal();
            this.fetchProducts();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deleteProduct(id) {
      if (!confirm("Are you sure you want to delete this product?")) return;

      fetch("/api/product/" + id, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            this.fetchProducts();
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
export default managerDashboard;
