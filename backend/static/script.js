document.addEventListener("DOMContentLoaded", async () => {
    const chartData = JSON.parse(document.getElementById("chartData").textContent);
    
    console.log("Chart Data:", chartData); // Debug log

    // --- Calculate Quick Stats ---
    // Highest Expense
    if (chartData.expenses && chartData.expenses.length > 0) {
        const amounts = chartData.expenses.map(e => parseFloat(e.amount));
        const highest = Math.max(...amounts);
        document.getElementById('highestExpense').textContent = `₹${highest.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Average Daily
        const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);
        const uniqueDates = new Set(chartData.expenses.map(e => e.date));
        const dayCount = uniqueDates.size || 1;
        const avgDaily = totalExpenses / dayCount;
        document.getElementById('avgDaily').textContent = `₹${avgDaily.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Total Items
        document.getElementById('totalItems').textContent = chartData.expenses.length;
    } else {
        document.getElementById('highestExpense').textContent = '₹0.00';
        document.getElementById('avgDaily').textContent = '₹0.00';
        document.getElementById('totalItems').textContent = '0';
    }

    // Top Category - using the totals_by_category data
    if (chartData.categories && chartData.categories.length > 0 && 
        chartData.totals && chartData.totals.length > 0) {
        const maxTotal = Math.max(...chartData.totals.map(t => parseFloat(t)));
        const maxIndex = chartData.totals.findIndex(t => parseFloat(t) === maxTotal);
        const topCat = chartData.categories[maxIndex];
        document.getElementById('topCategory').textContent = topCat || 'None';
        console.log("Top Category:", topCat, "Amount:", maxTotal); // Debug log
    } else {
        document.getElementById('topCategory').textContent = 'None';
    }

    // --- Initialize Charts ---
    const categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {
            type: "bar",
            data: {
                labels: chartData.categories,
                datasets: [{
                    label: "Expenses by Category",
                    data: chartData.totals,
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.8)",
                        "rgba(255, 99, 132, 0.8)",
                        "rgba(255, 206, 86, 0.8)",
                        "rgba(75, 192, 192, 0.8)",
                        "rgba(153, 102, 255, 0.8)",
                        "rgba(255, 159, 64, 0.8)",
                        "rgba(201, 203, 207, 0.8)"
                    ],
                    borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(201, 203, 207, 1)"
                    ],
                    borderWidth: 2
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Category-wise Expenses",
                        font: { size: 16, weight: 'bold' }
                    }
                }
            }
        }
    );

    const pieChart = new Chart(
        document.getElementById("pieChart"),
        {
            type: "pie",
            data: {
                labels: chartData.categories,
                datasets: [{
                    label: "Category Expenses",
                    data: chartData.totals,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.8)",
                        "rgba(54, 162, 235, 0.8)",
                        "rgba(255, 206, 86, 0.8)",
                        "rgba(75, 192, 192, 0.8)",
                        "rgba(153, 102, 255, 0.8)",
                        "rgba(255, 159, 64, 0.8)",
                        "rgba(201, 203, 207, 0.8)"
                    ],
                    borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(201, 203, 207, 1)"
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    const monthlyChart = new Chart(
        document.getElementById("monthlyChart"),
        {
            type: "line",
            data: {
                labels: chartData.months,
                datasets: [{
                    label: "Monthly Expenses",
                    data: chartData.monthly_totals,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: "rgba(75, 192, 192, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    const yearlyChart = new Chart(
        document.getElementById("yearlyChart"),
        {
            type: "line",
            data: {
                labels: chartData.years,
                datasets: [{
                    label: "Yearly Expenses",
                    data: chartData.yearly_totals,
                    borderColor: "rgba(153, 102, 255, 1)",
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: "rgba(153, 102, 255, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // --- Switch Chart ---
    const chartButtons = document.querySelectorAll(".chart-switcher button");
    chartButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const chartId = btn.getAttribute("data-chart");
            
            chartButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            document.querySelectorAll(".chart-container").forEach(div => {
                div.classList.remove("active");
            });
            
            document.getElementById(chartId).classList.add("active");
        });
    });

    // --- Scroll to Expenses Table ---
    const expensesBtn = document.getElementById("expensesBtn");
    const expensesTable = document.getElementById("expensesTable");
    
    if (expensesBtn && expensesTable) {
        expensesBtn.addEventListener("click", () => {
            expensesTable.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
            });
        });
    }

    // --- Autocomplete Suggestions ---
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");
    
    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if(query.length === 0){
            suggestionsBox.innerHTML = "";
            return;
        }
        
        try {
            const response = await fetch(`/search_suggestions?query=${query}`);
            const suggestions = await response.json();
            suggestionsBox.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
            
            document.querySelectorAll(".suggestion-item").forEach(item => {
                item.addEventListener("click", () => {
                    searchInput.value = item.textContent;
                    suggestionsBox.innerHTML = "";
                });
            });
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    });

    // --- Form Validation ---
    const addExpenseForm = document.getElementById("addExpenseForm");
    if (addExpenseForm) {
        addExpenseForm.addEventListener("submit", function(e) {
            const inputs = this.querySelectorAll("input[required]");
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add("is-invalid");
                    isValid = false;
                } else {
                    input.classList.remove("is-invalid");
                }
            });

            if (!isValid) {
                e.preventDefault();
            } else {
                showLoading();
            }
        });

        // Remove invalid class on input
        addExpenseForm.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", function() {
                this.classList.remove("is-invalid");
            });
        });
    }

    // --- Date Shortcuts ---
    const shortcuts = document.querySelectorAll(".btn-shortcut");
    const fromDateInput = document.getElementById("fromDate");
    const toDateInput = document.getElementById("toDate");

    shortcuts.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const period = btn.getAttribute("data-period");
            const today = new Date();
            const formatDate = (date) => date.toISOString().split('T')[0];

            switch(period) {
                case "today":
                    fromDateInput.value = formatDate(today);
                    toDateInput.value = formatDate(today);
                    break;
                case "week":
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    fromDateInput.value = formatDate(weekStart);
                    toDateInput.value = formatDate(today);
                    break;
                case "month":
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    fromDateInput.value = formatDate(monthStart);
                    toDateInput.value = formatDate(today);
                    break;
                case "lastmonth":
                    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    fromDateInput.value = formatDate(lastMonthStart);
                    toDateInput.value = formatDate(lastMonthEnd);
                    break;
            }
        });
    });

    // --- Export to CSV ---
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            if (!chartData.expenses || chartData.expenses.length === 0) {
                showToast("No expenses to export!", "warning");
                return;
            }

            let csv = "Date,Category,Amount,Description\n";
            chartData.expenses.forEach(expense => {
                csv += `${expense.date},${expense.category},${expense.amount},"${expense.description}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showToast("Expenses exported successfully!", "success");
        });
    }

    // --- Dark Mode Toggle ---
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = themeToggle.querySelector(".theme-icon");
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // --- Toast Notification ---
    window.showToast = function(message, type = 'success') {
        const toast = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toast.classList.remove('bg-success', 'bg-danger', 'bg-warning');
        toast.classList.add(`bg-${type}`);
        toastMessage.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    // --- Loading Overlay ---
    window.showLoading = function() {
        document.getElementById('loadingOverlay').classList.add('active');
    };

    window.hideLoading = function() {
        document.getElementById('loadingOverlay').classList.remove('active');
    };

    // --- Delete Confirmation ---
    window.confirmDelete = function(expenseId) {
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        const deleteForm = document.getElementById('deleteForm');
        deleteForm.action = `/delete/${expenseId}`;
        deleteModal.show();
    };

    // Show success message if expense was added/deleted
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'added') {
        showToast('Expense added successfully!', 'success');
    } else if (urlParams.get('success') === 'deleted') {
        showToast('Expense deleted successfully!', 'success');
    }

    // Handle form submissions with loading
    document.querySelectorAll('form').forEach(form => {
        if (form.id !== 'addExpenseForm' && form.id !== 'deleteForm') {
            form.addEventListener('submit', () => {
                showLoading();
            });
        }
    });

    // Hide loading on page load
    hideLoading();
});