const ApiUrl = "https://crudcrud.com/api/363d686d30354d1ebffedd73ae595185";
const myForm = document.getElementById('my-form');
const productName = document.getElementById('name');
const amount = document.getElementById('price');
const category = document.getElementById('category');
const list = document.getElementById('list');
const mssg = document.querySelector('.msg');

let editingProductId = null; // Track the currently editing product id

myForm.addEventListener('submit', onSubmit);

function onSubmit(e) {
    e.preventDefault();

    if (productName.value === "" || amount.value === "" || category.value === "select") {
        // Display an error message
        mssg.classList.add('error');
        mssg.textContent = 'Please enter all fields and select a category';

        // Remove error after 3 seconds
        setTimeout(() => mssg.remove(), 3000);
    } else {
        const productNameValue = productName.value;
        const amountValue = amount.value;
        const categoryValue = category.value;

        const productData = {
            productName: productNameValue,
            amount: amountValue,
            category: categoryValue
        };

        if (editingProductId) {
            // If editing, update the existing product
            axios
                .put(`${ApiUrl}/products/${editingProductId}`, productData)
                .then((res) => {
                    updateProductOnScreen(res.data);
                    resetForm();
                    editingProductId = null;
                })
                .catch((error) => console.log(error));
        } else {
            // If not editing, add a new product
            axios
                .post(`${ApiUrl}/products`, productData)
                .then((res) => {
                    showProductOnScreen(res.data);
                })
                .catch((error) => {
                    document.body.innerHTML = document.body.innerHTML + "<h4>Something went wrong</h4>";
                    console.log(error);
                });
        }
    }
}

// Sending a GET Request to CRUD Server
window.addEventListener("DOMContentLoaded", () => {
    axios
        .get(`${ApiUrl}/products`)
        .then((res) => {
            console.log(res);
            for (var i = 0; i < res.data.length; i++) {
                showProductOnScreen(res.data[i]);
            }
        })
        .catch((error) => console.log(error));
});

function showProductOnScreen(productData) {
    let li = document.createElement('li');
    li.id = `product-item-${productData._id}`;
    const details = document.createTextNode(`${productData.productName} : ${productData.amount} : ${productData.category} `);

    let editBtn = document.createElement('input');
    editBtn.type = 'button';
    editBtn.value = "Edit";
    editBtn.style.color = 'white';
    editBtn.style.backgroundColor = 'Blue';
    editBtn.onclick = () => editProduct(productData);

    let deleteBtn = document.createElement('input');
    deleteBtn.type = 'button';
    deleteBtn.value = "Delete";
    deleteBtn.style.color = 'white';
    deleteBtn.style.backgroundColor = 'Red';
    deleteBtn.onclick = () => deleteProduct(productData._id);

    li.appendChild(details);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);

    // Clear Fields
    resetForm();

    // Organize products by category
    const categoryList = document.getElementById(`category-${productData.category}`);
    if (!categoryList) {
        // If category list doesn't exist, create one
        const categoryHeader = document.createElement('strong');
        categoryHeader.textContent = `${productData.category} Products`;

        const newCategoryList = document.createElement('ul');
        newCategoryList.id = `category-${productData.category}`;

        const categoryContainer = document.createElement('div');
        categoryContainer.appendChild(categoryHeader);
        categoryContainer.appendChild(newCategoryList);

        document.getElementById('products').appendChild(categoryContainer);
    }

    const categoryItem = document.createElement('li');
    categoryItem.id = `category-item-${productData._id}`;
    categoryItem.textContent = `${productData.productName} : ${productData.amount}`;

    const categoryDeleteBtn = document.createElement('input');
    categoryDeleteBtn.type = 'button';
    categoryDeleteBtn.value = "Delete";
    categoryDeleteBtn.style.color = 'white';
    categoryDeleteBtn.style.backgroundColor = 'Red';
    categoryDeleteBtn.onclick = () => deleteProduct(productData._id);

    categoryItem.appendChild(categoryDeleteBtn);
    document.getElementById(`category-${productData.category}`).appendChild(categoryItem);
}

function editProduct(productData) {
    productName.value = productData.productName;
    amount.value = productData.amount;
    category.value = productData.category;
    editingProductId = productData._id;
}

function updateProductOnScreen(productData) {
    // Update the product in the overall product list
    const existingLi = document.getElementById(`product-item-${productData._id}`);
    if (existingLi) {
        existingLi.childNodes[0].nodeValue = `${productData.productName} : ${productData.amount} : ${productData.category} `;
    }

    // Update the product in its category section
    const existingCategoryItem = document.getElementById(`category-item-${productData._id}`);
    if (existingCategoryItem) {
        existingCategoryItem.childNodes[0].nodeValue = `${productData.productName} : ${productData.amount}`;
    }
}

function resetForm() {
    productName.value = '';
    amount.value = '';
    category.value = 'select';
    editingProductId = null;
}

function deleteProduct(productId) {
    // Sending a Delete Request to CRUD Server
    axios
        .delete(`${ApiUrl}/products/${productId}`)
        .then((res) => {
            const productLi = document.getElementById(`product-item-${productId}`);
            if (productLi) {
                list.removeChild(productLi);
            }

            const categoryItem = document.getElementById(`category-item-${productId}`);
            if (categoryItem) {
                categoryItem.parentNode.removeChild(categoryItem);
            }
            resetForm(); // Clear form when a product is deleted
        })
        .catch((error) => console.log(error));
}
