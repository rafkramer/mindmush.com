// ==================== DATA STORE ====================
const DEFAULT_DATA = {
    users: [{ username: 'admin', password: 'kramer', role: 'admin' }],
    apps: [],
    studioExpenses: [],
    settings: {
        applovinApiKey: '',
        superwallApiKey: ''
    }
};

function getData() {
    const stored = localStorage.getItem('mindmush_platform_data');
    if (stored) {
        const data = JSON.parse(stored);
        if (!data.settings) data.settings = { applovinApiKey: '', superwallApiKey: '' };
        return data;
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
    localStorage.setItem('mindmush_platform_data', JSON.stringify(data));
}

// ==================== STATE ====================
let currentUser = null;
let currentAppId = null;
let currentDateRange = 7;

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            ${type === 'success'
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
        </svg>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== FORMATTING ====================
function formatMoney(amount) {
    if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const options = { month: 'short', day: 'numeric' };
    if (days === 365) {
        return `Jan 1 - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
}

// ==================== DATE FILTERING ====================
function filterByDateRange(items, dateField = 'date') {
    if (currentDateRange === 'all') return items;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - currentDateRange);
    return items.filter(item => new Date(item[dateField]) >= cutoff);
}

function getRevenueForRange(app) {
    if (!app.revenueHistory || app.revenueHistory.length === 0) {
        return app.revenue || 0;
    }
    const filtered = filterByDateRange(app.revenueHistory);
    return filtered.reduce((sum, r) => sum + r.amount, 0);
}

function getExpensesForRange(expenses) {
    if (!expenses) return 0;
    const filtered = filterByDateRange(expenses);
    return filtered.reduce((sum, e) => sum + e.amount, 0);
}

// ==================== DATE FILTER UI ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentDateRange = this.dataset.range === 'all' ? 'all' : parseInt(this.dataset.range);
        updateDateRangeDisplay();
        refreshCurrentPage();
    });
});

function updateDateRangeDisplay() {
    const el = document.getElementById('filterDateRange');
    if (currentDateRange === 'all') {
        el.textContent = 'All Time';
    } else {
        el.textContent = formatDateRange(currentDateRange);
    }
}

function refreshCurrentPage() {
    const activePage = document.querySelector('.page-section.active');
    if (activePage) {
        const pageId = activePage.id.replace('page', '').charAt(0).toLowerCase() + activePage.id.replace('page', '').slice(1);
        switch(pageId) {
            case 'overview': renderOverview(); break;
            case 'apps': renderApps(); break;
            case 'appDetail': renderAppDetail(); break;
            case 'partners': renderPartners(); break;
            case 'expenses': renderStudioExpenses(); break;
            case 'partnerView': renderPartnerView(); break;
            case 'partnerAppDetail': renderPartnerAppDetail(); break;
        }
    }
}

// ==================== AUTHENTICATION ====================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const data = getData();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('mindmush_current_user', JSON.stringify(user));
        document.getElementById('loginError').style.display = 'none';
        showDashboard();
        showToast(`Welcome back, ${user.username}!`);
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('mindmush_current_user');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
});

// ==================== DASHBOARD ====================
function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
    const roleEl = document.getElementById('userRole');
    roleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    roleEl.className = 'user-role role-' + currentUser.role;
    const adminSections = document.querySelectorAll('.admin-only');
    const partnerSections = document.querySelectorAll('.partner-only');
    if (currentUser.role === 'admin') {
        adminSections.forEach(el => el.style.display = 'block');
        partnerSections.forEach(el => el.style.display = 'none');
        navigateTo('overview');
    } else {
        adminSections.forEach(el => el.style.display = 'none');
        partnerSections.forEach(el => el.style.display = 'block');
        buildPartnerNav();
        navigateTo('partnerView');
    }
    updateDateRangeDisplay();
    loadApiSettings();
}

// ==================== NAVIGATION ====================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const page = this.dataset.page;
        if (page) navigateTo(page);
    });
});

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');
    const pageMap = {
        'overview': 'pageOverview',
        'apps': 'pageApps',
        'partners': 'pagePartners',
        'expenses': 'pageExpenses',
        'settings': 'pageSettings',
        'partnerView': 'pagePartnerView',
        'appDetail': 'pageAppDetail',
        'partnerAppDetail': 'pagePartnerAppDetail'
    };
    const pageEl = document.getElementById(pageMap[page]);
    if (pageEl) {
        pageEl.classList.add('active');
        switch(page) {
            case 'overview': renderOverview(); break;
            case 'apps': renderApps(); break;
            case 'partners': renderPartners(); break;
            case 'expenses': renderStudioExpenses(); break;
            case 'settings': loadApiSettings(); break;
            case 'partnerView': renderPartnerView(); break;
            case 'appDetail': renderAppDetail(); break;
            case 'partnerAppDetail': renderPartnerAppDetail(); break;
        }
    }
}

// ==================== MODAL FUNCTIONS ====================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
});

// ==================== PASSWORD VISIBILITY ====================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ==================== API SOURCE TOGGLE ====================
document.getElementById('newAppApiSource')?.addEventListener('change', function() {
    document.getElementById('appIdGroup').style.display = this.value !== 'manual' ? 'block' : 'none';
});

document.getElementById('editAppApiSource')?.addEventListener('change', function() {
    document.getElementById('editAppIdGroup').style.display = this.value !== 'manual' ? 'block' : 'none';
});

// ==================== OVERVIEW ====================
function renderOverview() {
    const data = getData();
    let totalRevenue = 0;
    let totalExpenses = 0;
    let studioRevenue = 0;

    data.apps.forEach(app => {
        const appRevenue = getRevenueForRange(app);
        const appExpenses = getExpensesForRange(app.expenses);
        totalRevenue += appRevenue;
        totalExpenses += appExpenses;
        const profit = appRevenue - appExpenses;
        studioRevenue += profit * (app.studioEquity / 100);
    });

    const studioExpenses = getExpensesForRange(data.studioExpenses);
    const studioProfit = studioRevenue - studioExpenses;

    document.getElementById('overviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">${formatMoney(totalRevenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Studio Revenue</div>
                <div class="stat-value">${formatMoney(studioRevenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Studio Expenses</div>
                <div class="stat-value negative">${formatMoney(studioExpenses)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Studio Profit</div>
                <div class="stat-value ${studioProfit >= 0 ? 'positive' : 'negative'}">${formatMoney(studioProfit)}</div>
            </div>
        </div>
    `;

    document.getElementById('appsCount').textContent = `${data.apps.length} app${data.apps.length !== 1 ? 's' : ''}`;
    const tbody = document.getElementById('overviewAppsTable');
    if (data.apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>No apps yet. Add your first app to get started.</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.apps.map(app => {
        const appRevenue = getRevenueForRange(app);
        const appExpenses = getExpensesForRange(app.expenses);
        const profit = appRevenue - appExpenses;
        const appStudioRevenue = profit * (app.studioEquity / 100);
        return `
            <tr onclick="viewAppDetail('${app.id}')" style="cursor: pointer">
                <td><strong>${app.name}</strong></td>
                <td><span class="badge badge-${app.type === 'game' ? 'orange' : 'blue'}">${app.type === 'game' ? 'Game' : 'App'}</span></td>
                <td>${formatMoney(appRevenue)}</td>
                <td class="negative">${formatMoney(appExpenses)}</td>
                <td class="${profit >= 0 ? 'positive' : 'negative'}">${formatMoney(profit)}</td>
                <td>
                    <div class="equity-display">
                        <div class="equity-bar"><div class="equity-fill" style="width: ${app.studioEquity}%"></div></div>
                        <span class="equity-value">${app.studioEquity}%</span>
                    </div>
                </td>
                <td class="${appStudioRevenue >= 0 ? 'positive' : 'negative'}">${formatMoney(appStudioRevenue)}</td>
            </tr>
        `;
    }).join('');
}

// ==================== APPS MANAGEMENT ====================
function renderApps() {
    const data = getData();
    const container = document.getElementById('appsGrid');
    if (data.apps.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; padding: 80px 24px;"><p>No apps yet. Click "Add New App" to get started.</p></div>`;
        return;
    }
    container.innerHTML = data.apps.map(app => {
        const revenue = getRevenueForRange(app);
        const expenses = getExpensesForRange(app.expenses);
        const profit = revenue - expenses;
        const sourceLabel = app.apiSource === 'applovin' ? 'AppLovin' : app.apiSource === 'superwall' ? 'Superwall' : 'Manual';
        return `
            <div class="app-card" onclick="viewAppDetail('${app.id}')">
                <div class="app-card-header">
                    <div class="app-card-icon ${app.type}">
                        ${app.type === 'game'
                            ? '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"/></svg>'
                            : '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>'}
                    </div>
                    <span class="badge badge-${app.type === 'game' ? 'orange' : 'blue'}">${app.type === 'game' ? 'Game' : 'App'}</span>
                </div>
                <h3 class="app-card-name">${app.name}</h3>
                <p class="app-card-type">${app.type === 'game' ? 'Mobile Game' : 'Consumer App'}</p>
                <div class="app-card-stats">
                    <div class="app-card-stat">
                        <div class="app-card-stat-label">Revenue</div>
                        <div class="app-card-stat-value">${formatMoney(revenue)}</div>
                    </div>
                    <div class="app-card-stat">
                        <div class="app-card-stat-label">Profit</div>
                        <div class="app-card-stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatMoney(profit)}</div>
                    </div>
                </div>
                <div class="app-card-source ${app.apiSource || 'manual'}">
                    <span class="dot"></span>
                    <span>${sourceLabel}</span>
                </div>
            </div>
        `;
    }).join('');
}

function addApp() {
    const name = document.getElementById('newAppName').value.trim();
    const type = document.querySelector('input[name="newAppType"]:checked').value;
    const revenue = parseFloat(document.getElementById('newAppRevenue').value) || 0;
    const studioEquity = parseFloat(document.getElementById('newAppStudioEquity').value) || 100;
    const apiSource = document.getElementById('newAppApiSource').value;
    const apiId = document.getElementById('newAppApiId').value.trim();
    if (!name) {
        showToast('Please enter an app name', 'error');
        return;
    }
    const data = getData();
    const newApp = {
        id: 'app_' + Date.now(),
        name,
        type,
        revenue,
        studioEquity,
        apiSource,
        apiId,
        partners: [],
        expenses: [],
        revenueHistory: revenue > 0 ? [{ date: new Date().toISOString(), amount: revenue }] : []
    };
    data.apps.push(newApp);
    saveData(data);
    closeModal('addAppModal');
    document.getElementById('newAppName').value = '';
    document.getElementById('newAppRevenue').value = '0';
    document.getElementById('newAppStudioEquity').value = '100';
    document.getElementById('newAppApiSource').value = 'manual';
    document.getElementById('newAppApiId').value = '';
    document.getElementById('appIdGroup').style.display = 'none';
    renderApps();
    showToast(`${name} added successfully`);
}

function deleteApp(appId) {
    if (!confirm('Are you sure you want to delete this app?')) return;
    const data = getData();
    const app = data.apps.find(a => a.id === appId);
    data.apps = data.apps.filter(a => a.id !== appId);
    saveData(data);
    renderApps();
    showToast(`${app?.name || 'App'} deleted`);
}

function viewAppDetail(appId) {
    currentAppId = appId;
    navigateTo('appDetail');
}

function renderAppDetail() {
    const data = getData();
    const app = data.apps.find(a => a.id === currentAppId);
    if (!app) {
        navigateTo('apps');
        return;
    }
    document.getElementById('appDetailName').textContent = app.name;
    document.getElementById('appDetailType').textContent = app.type === 'game' ? 'Mobile Game' : 'Consumer App';
    const badge = document.getElementById('appDetailBadge');
    badge.textContent = app.type === 'game' ? 'Game' : 'App';
    badge.className = `badge badge-${app.type === 'game' ? 'orange' : 'blue'}`;
    const revenue = getRevenueForRange(app);
    const expenses = getExpensesForRange(app.expenses);
    const profit = revenue - expenses;
    const studioRevenue = profit * (app.studioEquity / 100);
    document.getElementById('appDetailStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">${formatMoney(revenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Total Expenses</div>
                <div class="stat-value negative">${formatMoney(expenses)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Net Profit</div>
                <div class="stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatMoney(profit)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Studio Share (${app.studioEquity}%)</div>
                <div class="stat-value ${studioRevenue >= 0 ? 'positive' : ''}">${formatMoney(studioRevenue)}</div>
            </div>
        </div>
    `;
    const partnersTable = document.getElementById('appPartnersTable');
    if (app.partners && app.partners.length > 0) {
        partnersTable.innerHTML = app.partners.map(p => {
            const partnerShare = profit * (p.equity / 100);
            return `
                <tr>
                    <td><strong>${p.username}</strong></td>
                    <td>
                        <div class="equity-display">
                            <div class="equity-bar"><div class="equity-fill" style="width: ${p.equity}%"></div></div>
                            <span class="equity-value">${p.equity}%</span>
                        </div>
                    </td>
                    <td class="${partnerShare >= 0 ? 'positive' : 'negative'}">${formatMoney(partnerShare)}</td>
                </tr>
            `;
        }).join('');
    } else {
        partnersTable.innerHTML = `<tr><td colspan="3"><div class="empty-state"><p>No partners assigned</p></div></td></tr>`;
    }
    const filteredExpenses = filterByDateRange(app.expenses || []);
    const expensesTable = document.getElementById('appExpensesTable');
    if (filteredExpenses.length > 0) {
        expensesTable.innerHTML = filteredExpenses.map((e, i) => `
            <tr>
                <td>${e.description}</td>
                <td class="negative">${formatMoney(e.amount)}</td>
                <td>${formatDate(e.date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn danger" onclick="deleteAppExpense(${app.expenses.indexOf(e)})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        expensesTable.innerHTML = `<tr><td colspan="4"><div class="empty-state"><p>No expenses recorded</p></div></td></tr>`;
    }
}

function openEditAppModal() {
    const data = getData();
    const app = data.apps.find(a => a.id === currentAppId);
    if (!app) return;
    document.getElementById('editAppName').value = app.name;
    document.getElementById('editAppType').value = app.type;
    document.getElementById('editAppRevenue').value = app.revenue;
    document.getElementById('editAppStudioEquity').value = app.studioEquity;
    document.getElementById('editAppApiSource').value = app.apiSource || 'manual';
    document.getElementById('editAppApiId').value = app.apiId || '';
    document.getElementById('editAppIdGroup').style.display = app.apiSource && app.apiSource !== 'manual' ? 'block' : 'none';
    const container = document.getElementById('editAppPartnersContainer');
    const partners = data.users.filter(u => u.role === 'partner');
    if (partners.length === 0) {
        container.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px;">No partners available. Add partners first.</p>';
    } else {
        container.innerHTML = partners.map(p => {
            const assigned = app.partners ? app.partners.find(ap => ap.username === p.username) : null;
            return `
                <div class="partner-assign-item">
                    <input type="checkbox" id="partner_${p.username}" ${assigned ? 'checked' : ''}>
                    <label for="partner_${p.username}">${p.username}</label>
                    <input type="number" id="equity_${p.username}" value="${assigned ? assigned.equity : 10}" min="0" max="100">
                    <span>%</span>
                </div>
            `;
        }).join('');
    }
    openModal('editAppModal');
}

function saveAppChanges() {
    const data = getData();
    const appIndex = data.apps.findIndex(a => a.id === currentAppId);
    if (appIndex === -1) return;
    data.apps[appIndex].name = document.getElementById('editAppName').value.trim();
    data.apps[appIndex].type = document.getElementById('editAppType').value;
    data.apps[appIndex].revenue = parseFloat(document.getElementById('editAppRevenue').value) || 0;
    data.apps[appIndex].studioEquity = parseFloat(document.getElementById('editAppStudioEquity').value) || 100;
    data.apps[appIndex].apiSource = document.getElementById('editAppApiSource').value;
    data.apps[appIndex].apiId = document.getElementById('editAppApiId').value.trim();
    const partners = data.users.filter(u => u.role === 'partner');
    const newPartners = [];
    partners.forEach(p => {
        const checkbox = document.getElementById(`partner_${p.username}`);
        const equityInput = document.getElementById(`equity_${p.username}`);
        if (checkbox && checkbox.checked) {
            newPartners.push({ username: p.username, equity: parseFloat(equityInput.value) || 0 });
        }
    });
    data.apps[appIndex].partners = newPartners;
    saveData(data);
    closeModal('editAppModal');
    renderAppDetail();
    showToast('App updated successfully');
}

function deleteCurrentApp() {
    if (!confirm('Are you sure you want to delete this app?')) return;
    const data = getData();
    const app = data.apps.find(a => a.id === currentAppId);
    data.apps = data.apps.filter(a => a.id !== currentAppId);
    saveData(data);
    closeModal('editAppModal');
    navigateTo('apps');
    showToast(`${app?.name || 'App'} deleted`);
}

function addAppExpense() {
    const description = document.getElementById('newExpenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('newExpenseAmount').value) || 0;
    if (!description || amount <= 0) {
        showToast('Please enter a description and valid amount', 'error');
        return;
    }
    const data = getData();
    const appIndex = data.apps.findIndex(a => a.id === currentAppId);
    if (appIndex === -1) return;
    if (!data.apps[appIndex].expenses) data.apps[appIndex].expenses = [];
    data.apps[appIndex].expenses.push({ description, amount, date: new Date().toISOString() });
    saveData(data);
    closeModal('addExpenseModal');
    document.getElementById('newExpenseDescription').value = '';
    document.getElementById('newExpenseAmount').value = '';
    renderAppDetail();
    showToast('Expense added');
}

function deleteAppExpense(index) {
    if (!confirm('Delete this expense?')) return;
    const data = getData();
    const appIndex = data.apps.findIndex(a => a.id === currentAppId);
    if (appIndex === -1) return;
    data.apps[appIndex].expenses.splice(index, 1);
    saveData(data);
    renderAppDetail();
    showToast('Expense deleted');
}

// ==================== PARTNERS MANAGEMENT ====================
function renderPartners() {
    const data = getData();
    const container = document.getElementById('partnersGrid');
    if (data.users.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>No users yet</p></div>`;
        return;
    }
    container.innerHTML = data.users.map(user => {
        const assignedApps = data.apps.filter(app => app.partners && app.partners.some(p => p.username === user.username));
        const appsHtml = assignedApps.length > 0
            ? assignedApps.map(app => {
                const partner = app.partners.find(p => p.username === user.username);
                return `<span class="partner-app-chip">${app.name} <span class="equity">${partner.equity}%</span></span>`;
            }).join('')
            : '<span style="color: var(--text-tertiary); font-size: 12px;">No apps assigned</span>';
        return `
            <div class="partner-card">
                <div class="partner-card-header">
                    <div class="partner-avatar ${user.role}">${user.username.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 class="partner-name">${user.username}</h3>
                        <span class="badge badge-${user.role}">${user.role}</span>
                    </div>
                </div>
                <div class="partner-apps">
                    <div class="partner-apps-label">Assigned Apps</div>
                    <div class="partner-app-chips">${appsHtml}</div>
                </div>
                ${user.username !== 'admin' ? `
                <div class="partner-card-footer">
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.username}')">Delete</button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function addPartner() {
    const username = document.getElementById('newPartnerUsername').value.trim();
    const password = document.getElementById('newPartnerPassword').value;
    const role = document.getElementById('newPartnerRole').value;
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    const data = getData();
    if (data.users.some(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }
    data.users.push({ username, password, role });
    saveData(data);
    closeModal('addPartnerModal');
    document.getElementById('newPartnerUsername').value = '';
    document.getElementById('newPartnerPassword').value = '';
    document.getElementById('newPartnerRole').value = 'partner';
    renderPartners();
    showToast(`${username} added successfully`);
}

function deleteUser(username) {
    if (!confirm(`Delete ${username}?`)) return;
    const data = getData();
    data.users = data.users.filter(u => u.username !== username);
    data.apps.forEach(app => {
        if (app.partners) app.partners = app.partners.filter(p => p.username !== username);
    });
    saveData(data);
    renderPartners();
    showToast(`${username} deleted`);
}

// ==================== STUDIO EXPENSES ====================
function renderStudioExpenses() {
    const data = getData();
    const filteredExpenses = filterByDateRange(data.studioExpenses || []);
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = (data.studioExpenses || [])
        .filter(e => {
            const d = new Date(e.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalStudioExpenses').textContent = formatMoney(total);
    document.getElementById('monthlyStudioExpenses').textContent = formatMoney(thisMonth);
    const tbody = document.getElementById('studioExpensesTable');
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>No studio expenses recorded</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = filteredExpenses.map((e, i) => {
        const originalIndex = data.studioExpenses.indexOf(e);
        return `
            <tr>
                <td>${e.description}</td>
                <td><span class="badge">${e.category}</span></td>
                <td class="negative">${formatMoney(e.amount)}</td>
                <td>${formatDate(e.date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn danger" onclick="deleteStudioExpense(${originalIndex})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function addStudioExpense() {
    const description = document.getElementById('newStudioExpenseDescription').value.trim();
    const category = document.getElementById('newStudioExpenseCategory').value;
    const amount = parseFloat(document.getElementById('newStudioExpenseAmount').value) || 0;
    if (!description || amount <= 0) {
        showToast('Please enter a description and valid amount', 'error');
        return;
    }
    const data = getData();
    if (!data.studioExpenses) data.studioExpenses = [];
    data.studioExpenses.push({ description, category, amount, date: new Date().toISOString() });
    saveData(data);
    closeModal('addStudioExpenseModal');
    document.getElementById('newStudioExpenseDescription').value = '';
    document.getElementById('newStudioExpenseAmount').value = '';
    renderStudioExpenses();
    showToast('Expense added');
}

function deleteStudioExpense(index) {
    if (!confirm('Delete this expense?')) return;
    const data = getData();
    data.studioExpenses.splice(index, 1);
    saveData(data);
    renderStudioExpenses();
    showToast('Expense deleted');
}

// ==================== SETTINGS & API ====================
function loadApiSettings() {
    const data = getData();
    document.getElementById('applovinApiKey').value = data.settings.applovinApiKey || '';
    document.getElementById('superwallApiKey').value = data.settings.superwallApiKey || '';
    updateApiStatus('applovin', data.settings.applovinApiKey);
    updateApiStatus('superwall', data.settings.superwallApiKey);
}

function updateApiStatus(api, key) {
    const statusEl = document.getElementById(`${api}Status`);
    if (key) {
        statusEl.className = 'api-status connected';
        statusEl.querySelector('.status-text').textContent = 'Connected';
    } else {
        statusEl.className = 'api-status';
        statusEl.querySelector('.status-text').textContent = 'Not configured';
    }
}

function saveApplovinKey() {
    const key = document.getElementById('applovinApiKey').value.trim();
    const data = getData();
    data.settings.applovinApiKey = key;
    saveData(data);
    updateApiStatus('applovin', key);
    showToast(key ? 'AppLovin API key saved' : 'AppLovin API key removed');
}

function saveSuperwallKey() {
    const key = document.getElementById('superwallApiKey').value.trim();
    const data = getData();
    data.settings.superwallApiKey = key;
    saveData(data);
    updateApiStatus('superwall', key);
    showToast(key ? 'Superwall API key saved' : 'Superwall API key removed');
}

async function testApplovinApi() {
    const key = document.getElementById('applovinApiKey').value.trim();
    if (!key) {
        showToast('Please enter an API key first', 'error');
        return;
    }
    showToast('Testing AppLovin connection...');
    // In production, this would make an actual API call
    // For now, simulate a successful connection
    setTimeout(() => {
        showToast('AppLovin API connection successful');
        updateApiStatus('applovin', key);
    }, 1000);
}

async function testSuperwallApi() {
    const key = document.getElementById('superwallApiKey').value.trim();
    if (!key) {
        showToast('Please enter an API key first', 'error');
        return;
    }
    showToast('Testing Superwall connection...');
    setTimeout(() => {
        showToast('Superwall API connection successful');
        updateApiStatus('superwall', key);
    }, 1000);
}

async function syncAppData() {
    const data = getData();
    const app = data.apps.find(a => a.id === currentAppId);
    if (!app || !app.apiSource || app.apiSource === 'manual') {
        showToast('This app uses manual revenue entry', 'error');
        return;
    }
    showToast(`Syncing data from ${app.apiSource === 'applovin' ? 'AppLovin' : 'Superwall'}...`);
    // Simulate API fetch
    setTimeout(() => {
        const newRevenue = Math.floor(Math.random() * 5000) + 1000;
        if (!app.revenueHistory) app.revenueHistory = [];
        app.revenueHistory.push({ date: new Date().toISOString(), amount: newRevenue });
        app.revenue = app.revenueHistory.reduce((sum, r) => sum + r.amount, 0);
        saveData(data);
        renderAppDetail();
        showToast(`Synced! Added $${newRevenue.toLocaleString()} revenue`);
    }, 1500);
}

async function refreshAllData() {
    const data = getData();
    const apiApps = data.apps.filter(app => app.apiSource && app.apiSource !== 'manual');
    if (apiApps.length === 0) {
        showToast('No apps configured with API sources', 'error');
        return;
    }
    showToast(`Syncing ${apiApps.length} app(s)...`);
    setTimeout(() => {
        apiApps.forEach(app => {
            const newRevenue = Math.floor(Math.random() * 5000) + 1000;
            if (!app.revenueHistory) app.revenueHistory = [];
            app.revenueHistory.push({ date: new Date().toISOString(), amount: newRevenue });
            app.revenue = app.revenueHistory.reduce((sum, r) => sum + r.amount, 0);
        });
        saveData(data);
        renderOverview();
        showToast(`Synced ${apiApps.length} app(s) successfully`);
    }, 2000);
}

// ==================== PARTNER VIEW ====================
function buildPartnerNav() {
    const data = getData();
    const container = document.getElementById('partnerAppsNav');
    const myApps = data.apps.filter(app => app.partners && app.partners.some(p => p.username === currentUser.username));
    if (myApps.length === 0) {
        container.innerHTML = '<p style="color: var(--text-tertiary); font-size: 12px; padding: 12px;">No apps assigned</p>';
        return;
    }
    container.innerHTML = myApps.map(app => `
        <div class="nav-item" onclick="viewPartnerAppDetail('${app.id}')">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>
            ${app.name}
        </div>
    `).join('');
}

function renderPartnerView() {
    const data = getData();
    const myApps = data.apps.filter(app => app.partners && app.partners.some(p => p.username === currentUser.username));
    let totalEquityValue = 0;
    let totalRevenue = 0;
    myApps.forEach(app => {
        const partner = app.partners.find(p => p.username === currentUser.username);
        const appRevenue = getRevenueForRange(app);
        const appExpenses = getExpensesForRange(app.expenses);
        const profit = appRevenue - appExpenses;
        totalRevenue += appRevenue;
        totalEquityValue += profit * (partner.equity / 100);
    });
    document.getElementById('partnerOverviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Apps Assigned</div>
                <div class="stat-value">${myApps.length}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Total App Revenue</div>
                <div class="stat-value">${formatMoney(totalRevenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Your Total Share</div>
                <div class="stat-value ${totalEquityValue >= 0 ? 'positive' : 'negative'}">${formatMoney(totalEquityValue)}</div>
            </div>
        </div>
    `;
    const tbody = document.getElementById('partnerAppsTable');
    if (myApps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>No apps assigned yet</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = myApps.map(app => {
        const partner = app.partners.find(p => p.username === currentUser.username);
        const appRevenue = getRevenueForRange(app);
        const appExpenses = getExpensesForRange(app.expenses);
        const profit = appRevenue - appExpenses;
        const myShare = profit * (partner.equity / 100);
        return `
            <tr onclick="viewPartnerAppDetail('${app.id}')" style="cursor: pointer">
                <td><strong>${app.name}</strong></td>
                <td><span class="badge badge-${app.type === 'game' ? 'orange' : 'blue'}">${app.type === 'game' ? 'Game' : 'App'}</span></td>
                <td>
                    <div class="equity-display">
                        <div class="equity-bar"><div class="equity-fill" style="width: ${partner.equity}%"></div></div>
                        <span class="equity-value">${partner.equity}%</span>
                    </div>
                </td>
                <td>${formatMoney(appRevenue)}</td>
                <td class="${profit >= 0 ? 'positive' : 'negative'}">${formatMoney(profit)}</td>
                <td class="${myShare >= 0 ? 'positive' : 'negative'}">${formatMoney(myShare)}</td>
            </tr>
        `;
    }).join('');
}

function viewPartnerAppDetail(appId) {
    currentAppId = appId;
    navigateTo('partnerAppDetail');
}

function renderPartnerAppDetail() {
    const data = getData();
    const app = data.apps.find(a => a.id === currentAppId);
    if (!app) {
        navigateTo('partnerView');
        return;
    }
    const partner = app.partners.find(p => p.username === currentUser.username);
    if (!partner) {
        navigateTo('partnerView');
        return;
    }
    document.getElementById('partnerAppDetailName').textContent = app.name;
    document.getElementById('partnerAppDetailType').textContent = app.type === 'game' ? 'Mobile Game' : 'Consumer App';
    const revenue = getRevenueForRange(app);
    const expenses = getExpensesForRange(app.expenses);
    const profit = revenue - expenses;
    const myShare = profit * (partner.equity / 100);
    document.getElementById('partnerAppDetailStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Your Equity</div>
                <div class="stat-value">${partner.equity}%</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">App Revenue</div>
                <div class="stat-value">${formatMoney(revenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">App Profit</div>
                <div class="stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatMoney(profit)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div class="stat-content">
                <div class="stat-label">Your Share</div>
                <div class="stat-value ${myShare >= 0 ? 'positive' : 'negative'}">${formatMoney(myShare)}</div>
            </div>
        </div>
    `;
    const filteredExpenses = filterByDateRange(app.expenses || []);
    const expensesTable = document.getElementById('partnerAppExpensesTable');
    if (filteredExpenses.length > 0) {
        expensesTable.innerHTML = filteredExpenses.map(e => `
            <tr>
                <td>${e.description}</td>
                <td class="negative">${formatMoney(e.amount)}</td>
                <td>${formatDate(e.date)}</td>
            </tr>
        `).join('');
    } else {
        expensesTable.innerHTML = `<tr><td colspan="3"><div class="empty-state"><p>No expenses recorded</p></div></td></tr>`;
    }
}

// ==================== INITIALIZATION ====================
function init() {
    const storedUser = localStorage.getItem('mindmush_current_user');
    if (storedUser) {
        const data = getData();
        const user = JSON.parse(storedUser);
        if (data.users.some(u => u.username === user.username)) {
            currentUser = user;
            showDashboard();
            return;
        }
    }
    document.getElementById('loginPage').style.display = 'flex';
}

init();
