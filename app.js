const entryForm = document.getElementById('entry-form');
const entriesBody = document.getElementById('entries-body');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');

const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.querySelector('.close-button');
const editForm = document.getElementById('edit-form');

const financeChartCtx = document.getElementById('finance-chart').getContext('2d');
let entries = JSON.parse(localStorage.getItem('financeEntries')) || [];
let financeChart = new Chart(financeChartCtx, {
    type: 'pie',
    data: {
        labels: ['Total Income', 'Total Expenses'],
        datasets: [{
            data: [0, 0],
            backgroundColor: [
                '#00b894', // Green for Income
                '#d63031'  // Red for Expenses
            ],
            hoverBackgroundColor: [
                '#55efc4',
                '#fab1a0'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Income vs. Expenses'
            }
        }
    },
});
function saveEntries() {
    localStorage.setItem('financeEntries', JSON.stringify(entries));
}
function updateDashboard() {
    let totalIncome = 0;
    let totalExpenses = 0;

    entries.forEach(entry => {
        if (entry.type === 'income') {
            totalIncome += parseFloat(entry.amount);
        } else {
            totalExpenses += parseFloat(entry.amount);
        }
    });

    totalIncomeEl.textContent = `${totalIncome.toFixed(2)}Rs`;
    totalExpensesEl.textContent = `${totalExpenses.toFixed(2)}Rs`;
    balanceEl.textContent = `${(totalIncome - totalExpenses).toFixed(2)}Rs`;

    // Update Chart.js data
    financeChart.data.datasets[0].data = [totalIncome, totalExpenses];
    financeChart.update();
}
function renderEntries() {
    // Clear existing entries
    entriesBody.innerHTML = '';

    // Sort entries by date descending
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedEntries.forEach(entry => {
        const tr = document.createElement('tr');

        // Type
        const typeTd = document.createElement('td');
        typeTd.textContent = capitalizeFirstLetter(entry.type);
        typeTd.classList.add(entry.type === 'income' ? 'income' : 'expense');
        tr.appendChild(typeTd);

        // Category
        const categoryTd = document.createElement('td');
        categoryTd.textContent = entry.category;
        tr.appendChild(categoryTd);

        // Amount
        const amountTd = document.createElement('td');
        amountTd.textContent = `${parseFloat(entry.amount).toFixed(2)}Rs`;
        amountTd.classList.add(entry.type === 'income' ? 'income' : 'expense');
        tr.appendChild(amountTd);

        // Date
        const dateTd = document.createElement('td');
        dateTd.textContent = formatDate(entry.date);
        tr.appendChild(dateTd);

        // Description
        const descTd = document.createElement('td');
        descTd.textContent = entry.description;
        tr.appendChild(descTd);

        // Actions
        const actionsTd = document.createElement('td');
        actionsTd.classList.add('actions');

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Entry';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => openEditModal(entry.id));
        actionsTd.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete Entry';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteEntry(entry.id));
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);

        entriesBody.appendChild(tr);
    });

    updateDashboard();
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}
function addEntry(e) {
    e.preventDefault();

    const type = entryForm.type.value;
    const category = entryForm.category.value.trim();
    const amount = entryForm.amount.value;
    const date = entryForm.date.value;
    const description = entryForm.description.value.trim();
    if (!category || !amount || !date) {
        alert('Please fill in all required fields.');
        return;
    }

    const newEntry = {
        id: Date.now(),
        type,
        category,
        amount,
        date,
        description
    };

    entries.push(newEntry);
    saveEntries();
    renderEntries();

    // Reset form
    entryForm.reset();
}
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
        renderEntries();
    }
}
function openEditModal(id) {
    const entry = entries.find(entry => entry.id === id);
    if (!entry) return;

    // Populate form with entry data
    document.getElementById('edit-id').value = entry.id;
    document.getElementById('edit-type').value = entry.type;
    document.getElementById('edit-category').value = entry.category;
    document.getElementById('edit-amount').value = entry.amount;
    document.getElementById('edit-date').value = entry.date;
    document.getElementById('edit-description').value = entry.description;

    // Show modal
    editModal.style.display = 'block';
}
function closeEditModal() {
    editModal.style.display = 'none';
    editForm.reset();
}
function updateEntry(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('edit-id').value);
    const type = document.getElementById('edit-type').value;
    const category = document.getElementById('edit-category').value.trim();
    const amount = document.getElementById('edit-amount').value;
    const date = document.getElementById('edit-date').value;
    const description = document.getElementById('edit-description').value.trim();
    if (!category || !amount || !date) {
        alert('Please fill in all required fields.');
        return;
    }
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    entries[entryIndex] = {
        id,
        type,
        category,
        amount,
        date,
        description
    };

    saveEntries();
    renderEntries();
    closeEditModal();
}
entryForm.addEventListener('submit', addEntry);
editForm.addEventListener('submit', updateEntry);
closeModalBtn.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

renderEntries();

