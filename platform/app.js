// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let currentVenture = null;
let currentDateRange = 7;
let currentStateFilter = 'all';
let editingPartnerId = null;
let revenueChart = null;
let studioChart = null;
let ventureChart = null;

// ==================== DATA STORAGE ====================
const STORAGE_KEYS = {
    users: 'mindmush_users',
    ventures: 'mindmush_ventures',
    studioExpenses: 'mindmush_studio_expenses',
    settings: 'mindmush_settings',
    payouts: 'mindmush_payouts'
};

function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
        const defaultUsers = [
            { id: 1, username: 'admin', password: 'kramer', role: 'admin', contract: '' }
        ];
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ventures)) {
        localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.studioExpenses)) {
        localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ applovinApiKey: '' }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.payouts)) {
        localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify([]));
    }
}

function getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); }
function saveUsers(users) { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }
function getVentures() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ventures) || '[]'); }
function saveVentures(ventures) { localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify(ventures)); }
function getStudioExpenses() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.studioExpenses) || '[]'); }
function saveStudioExpenses(expenses) { localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify(expenses)); }
function getSettings() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}'); }
function saveSettings(settings) { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); }
function getPayouts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.payouts) || '[]'); }
function savePayouts(payouts) { localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify(payouts)); }

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
        </svg>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

function openModal(modalId) { document.getElementById(modalId).classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ==================== DATE RANGE ====================
function getDateRange() {
    const end = new Date();
    const start = new Date();
    if (currentDateRange === 'all') { start.setFullYear(2020, 0, 1); }
    else { start.setDate(start.getDate() - parseInt(currentDateRange)); }
    return { start, end };
}

function updateDateRangeDisplay() {
    const { start, end } = getDateRange();
    const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('filterDateRange').textContent = currentDateRange === 'all' ? 'All Time' : `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
}

function filterByDateRange(items, dateField = 'date') {
    const { start, end } = getDateRange();
    return items.filter(item => { const itemDate = new Date(item[dateField]); return itemDate >= start && itemDate <= end; });
}

// ==================== APPLE PAYOUT SCHEDULE ====================
function getNextApplePayoutDate() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    let payoutDate = new Date(lastMonth.getTime() + (45 * 24 * 60 * 60 * 1000));
    if (payoutDate < today) {
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        payoutDate = new Date(thisMonthEnd.getTime() + (45 * 24 * 60 * 60 * 1000));
    }
    return payoutDate;
}

function getDaysUntilPayout() {
    const payoutDate = getNextApplePayoutDate();
    const today = new Date();
    return Math.ceil((payoutDate - today) / (1000 * 60 * 60 * 24));
}

// ==================== AUTHENTICATION ====================
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const user = getUsers().find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

function checkSession() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) { currentUser = JSON.parse(savedUser); showDashboard(); }
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    document.getElementById('userRole').className = `user-role role-${currentUser.role}`;

    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.partner-only').forEach(el => el.style.display = 'none');
        navigateTo('overview');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.partner-only').forEach(el => el.style.display = 'block');
        renderPartnerNav();
        navigateTo('partnerView');
    }
    renderAll();
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageMap = {
        'overview': 'pageOverview', 'ventures': 'pageVentures', 'ventureDetail': 'pageVentureDetail',
        'partners': 'pagePartners', 'expenses': 'pageExpenses', 'settings': 'pageSettings',
        'partnerView': 'pagePartnerView', 'partnerPayouts': 'pagePartnerPayouts',
        'partnerContract': 'pagePartnerContract', 'partnerVentureDetail': 'pagePartnerVentureDetail'
    };

    document.getElementById(pageMap[page]).classList.add('active');
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    if (page === 'overview') renderOverview();
    if (page === 'ventures') renderVentures();
    if (page === 'partners') renderPartners();
    if (page === 'expenses') renderStudioExpenses();
    if (page === 'settings') renderSettings();
    if (page === 'partnerView') renderPartnerView();
    if (page === 'partnerPayouts') renderPartnerPayouts();
    if (page === 'partnerContract') renderPartnerContract();
}

// ==================== RENDER FUNCTIONS ====================
function renderAll() {
    updateDateRangeDisplay();
    renderOverview();
    initCharts();
}

function renderOverview() {
    const ventures = getVentures();
    const studioExpenses = filterByDateRange(getStudioExpenses());

    let totalRevenue = 0, totalExpenses = 0, studioRevenue = 0;

    ventures.forEach(venture => {
        const ventureExpenses = filterByDateRange(venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        totalRevenue += venture.revenue || 0;
        totalExpenses += ventureExpenses;
        studioRevenue += (venture.revenue || 0) * (venture.studioEquity / 100);
    });

    const studioExpenseTotal = studioExpenses.reduce((sum, e) => sum + e.amount, 0);
    totalExpenses += studioExpenseTotal;
    const studioProfit = studioRevenue - studioExpenseTotal;

    document.getElementById('overviewStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div class="stat-content"><div class="stat-label">Total Revenue</div><div class="stat-value">${formatCurrency(totalRevenue)}</div></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/></svg></div>
            <div class="stat-content"><div class="stat-label">Studio Revenue</div><div class="stat-value">${formatCurrency(studioRevenue)}</div></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg></div>
            <div class="stat-content"><div class="stat-label">Total Expenses</div><div class="stat-value">${formatCurrency(totalExpenses)}</div></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg></div>
            <div class="stat-content"><div class="stat-label">Studio Profit</div><div class="stat-value ${studioProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(studioProfit)}</div></div>
        </div>
    `;

    document.getElementById('venturesCount').textContent = `${ventures.length} ventures`;
    const tableBody = document.getElementById('overviewVenturesTable');

    if (ventures.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>No ventures yet. Add your first venture to get started.</p></td></tr>';
    } else {
        tableBody.innerHTML = ventures.map(venture => {
            const ventureExpenses = filterByDateRange(venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
            const profit = (venture.revenue || 0) - ventureExpenses;
            const studioRev = (venture.revenue || 0) * (venture.studioEquity / 100);

            return `
                <tr onclick="viewVenture('${venture.id}')" style="cursor: pointer;">
                    <td><div style="display: flex; align-items: center; gap: 12px;">
                        <div class="venture-card-icon ${venture.type}" style="width: 36px; height: 36px;">
                            ${venture.icon ? `<img src="${venture.icon}" alt="${venture.name}">` : `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'}"/></svg>`}
                        </div><span>${venture.name}</span></div></td>
                    <td><span class="badge badge-${venture.type === 'game' ? 'orange' : 'blue'}">${venture.type === 'game' ? 'Game' : 'App'}</span></td>
                    <td><span class="state-badge ${venture.state}">${venture.state.charAt(0).toUpperCase() + venture.state.slice(1)}</span></td>
                    <td>${formatCurrency(venture.revenue || 0)}</td>
                    <td>${formatCurrency(ventureExpenses)}</td>
                    <td class="${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</td>
                    <td>${venture.studioEquity}%</td>
                    <td>${formatCurrency(studioRev)}</td>
                </tr>
            `;
        }).join('');
    }
    updateCharts();
}

function renderVentures() {
    const ventures = getVentures();
    const filteredVentures = currentStateFilter === 'all' ? ventures : ventures.filter(v => v.state === currentStateFilter);
    const grid = document.getElementById('venturesGrid');
    const settings = getSettings();

    if (filteredVentures.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No ventures found. Add your first venture to get started.</p></div>';
        return;
    }

    grid.innerHTML = filteredVentures.map(venture => {
        const ventureExpenses = filterByDateRange(venture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        const profit = (venture.revenue || 0) - ventureExpenses;

        // Determine API status
        let apiStatus = 'no-api';
        let apiText = 'No API';
        if (venture.state === 'building' || venture.state === 'killed') {
            apiStatus = 'no-api';
            apiText = 'API disabled';
        } else if (venture.type === 'game') {
            if (venture.bundleId && settings.applovinApiKey) {
                apiStatus = 'connected';
                apiText = 'AppLovin';
            } else {
                apiStatus = 'disconnected';
                apiText = 'Not configured';
            }
        } else {
            if (venture.superwallKey) {
                apiStatus = 'connected';
                apiText = 'Superwall';
            } else {
                apiStatus = 'disconnected';
                apiText = 'Not configured';
            }
        }

        return `
            <div class="venture-card" onclick="viewVenture('${venture.id}')">
                <div class="venture-card-content">
                    <div class="venture-card-header">
                        <div class="venture-card-icon ${venture.type}">
                            ${venture.icon ? `<img src="${venture.icon}" alt="${venture.name}">` : `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'}"/></svg>`}
                        </div>
                        <div class="venture-card-badges">
                            <span class="badge badge-${venture.type === 'game' ? 'orange' : 'blue'}">${venture.type === 'game' ? 'Game' : 'App'}</span>
                            <span class="state-badge ${venture.state}">${venture.state.charAt(0).toUpperCase() + venture.state.slice(1)}</span>
                        </div>
                    </div>
                    <div class="venture-card-name">${venture.name}</div>
                    <div class="venture-card-type">${venture.type === 'game' ? 'Mobile Game' : 'Consumer App'}</div>
                    <div class="venture-card-api ${apiStatus}"><span class="api-dot"></span>${apiText}</div>
                </div>
                <div class="venture-card-stats">
                    <div class="venture-card-stat"><div class="venture-card-stat-label">${venture.type === 'game' ? 'Revenue' : 'Proceeds'}</div><div class="venture-card-stat-value">${formatCurrency(venture.revenue || 0)}</div></div>
                    <div class="venture-card-stat"><div class="venture-card-stat-label">Profit</div><div class="venture-card-stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</div></div>
                </div>
            </div>
        `;
    }).join('');
}

function viewVenture(ventureId) {
    const ventures = getVentures();
    currentVenture = ventures.find(v => v.id === ventureId);
    if (!currentVenture) return;

    if (currentUser.role === 'admin') { navigateTo('ventureDetail'); renderVentureDetail(); }
    else { navigateTo('partnerVentureDetail'); renderPartnerVentureDetail(); }
}

function renderVentureDetail() {
    if (!currentVenture) return;

    document.getElementById('ventureDetailName').textContent = currentVenture.name;
    document.getElementById('ventureDetailType').textContent = currentVenture.type === 'game' ? 'Mobile Game' : 'Consumer App';
    document.getElementById('ventureDetailBadge').textContent = currentVenture.type === 'game' ? 'Game' : 'App';
    document.getElementById('ventureDetailBadge').className = `badge badge-${currentVenture.type === 'game' ? 'orange' : 'blue'}`;
    document.getElementById('ventureDetailState').textContent = currentVenture.state.charAt(0).toUpperCase() + currentVenture.state.slice(1);
    document.getElementById('ventureDetailState').className = `state-badge ${currentVenture.state}`;

    const iconDisplay = document.getElementById('ventureIconDisplay');
    iconDisplay.innerHTML = currentVenture.icon ? `<img src="${currentVenture.icon}" alt="${currentVenture.name}">` : `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41"/></svg>`;

    // Render API connection banner
    const apiBanner = document.getElementById('apiConnectionBanner');
    const settings = getSettings();
    if (currentVenture.state === 'building' || currentVenture.state === 'killed') {
        apiBanner.className = 'api-connection-banner no-api';
        apiBanner.innerHTML = `<span class="banner-dot"></span>API sync disabled for ${currentVenture.state} ventures`;
    } else if (currentVenture.type === 'game') {
        if (currentVenture.bundleId && settings.applovinApiKey) {
            apiBanner.className = 'api-connection-banner connected';
            apiBanner.innerHTML = `<span class="banner-dot"></span>AppLovin API connected • Bundle: ${currentVenture.bundleId}`;
        } else if (!currentVenture.bundleId) {
            apiBanner.className = 'api-connection-banner disconnected';
            apiBanner.innerHTML = `<span class="banner-dot"></span>Bundle ID not configured`;
        } else {
            apiBanner.className = 'api-connection-banner disconnected';
            apiBanner.innerHTML = `<span class="banner-dot"></span>AppLovin API key not configured in Settings`;
        }
    } else {
        if (currentVenture.superwallKey) {
            apiBanner.className = 'api-connection-banner connected';
            apiBanner.innerHTML = `<span class="banner-dot"></span>Superwall API connected`;
        } else {
            apiBanner.className = 'api-connection-banner disconnected';
            apiBanner.innerHTML = `<span class="banner-dot"></span>Superwall API key not configured`;
        }
    }

    const ventureExpenses = filterByDateRange(currentVenture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const profit = (currentVenture.revenue || 0) - ventureExpenses;
    const studioRev = (currentVenture.revenue || 0) * (currentVenture.studioEquity / 100);

    document.getElementById('ventureDetailStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0"/></svg></div><div class="stat-content"><div class="stat-label">${currentVenture.type === 'game' ? 'Revenue' : 'Proceeds'}</div><div class="stat-value">${formatCurrency(currentVenture.revenue || 0)}</div></div></div>
        <div class="stat-card"><div class="stat-icon red"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101"/></svg></div><div class="stat-content"><div class="stat-label">Expenses</div><div class="stat-value">${formatCurrency(ventureExpenses)}</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307"/></svg></div><div class="stat-content"><div class="stat-label">Profit</div><div class="stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18"/></svg></div><div class="stat-content"><div class="stat-label">Studio Revenue</div><div class="stat-value">${formatCurrency(studioRev)}</div></div></div>
    `;

    const users = getUsers();
    const partnersTable = document.getElementById('venturePartnersTable');
    const partners = currentVenture.partners || [];

    if (partners.length === 0) {
        partnersTable.innerHTML = `<tr><td colspan="3"><div style="display:flex; justify-content:space-between; align-items:center;"><strong>Studio (MINDMUSH)</strong><span>${currentVenture.studioEquity}%</span><span>${formatCurrency(profit * (currentVenture.studioEquity / 100))}</span></div></td></tr>`;
    } else {
        let rows = `<tr><td><strong>Studio (MINDMUSH)</strong></td><td><div class="equity-display"><div class="equity-bar"><div class="equity-fill" style="width: ${currentVenture.studioEquity}%"></div></div><span class="equity-value">${currentVenture.studioEquity}%</span></div></td><td>${formatCurrency(profit * (currentVenture.studioEquity / 100))}</td></tr>`;
        partners.forEach(partner => {
            const user = users.find(u => u.id === partner.userId);
            if (user) rows += `<tr><td>${user.username}</td><td><div class="equity-display"><div class="equity-bar"><div class="equity-fill" style="width: ${partner.equity}%"></div></div><span class="equity-value">${partner.equity}%</span></div></td><td>${formatCurrency(profit * (partner.equity / 100))}</td></tr>`;
        });
        partnersTable.innerHTML = rows;
    }

    const expensesTable = document.getElementById('ventureExpensesTable');
    const expenses = currentVenture.expenses || [];
    expensesTable.innerHTML = expenses.length === 0 ? '<tr><td colspan="4" class="empty-state"><p>No expenses recorded.</p></td></tr>' : expenses.map(expense => `<tr><td>${expense.description}</td><td>${formatCurrency(expense.amount)}</td><td>${formatDate(expense.date)}</td><td><div class="table-actions"><button class="action-btn danger" onclick="deleteVentureExpense('${expense.id}')">Delete</button></div></td></tr>`).join('');

    updateVentureChart();
}

function renderPartners() {
    const users = getUsers();
    const ventures = getVentures();
    const list = document.getElementById('partnersList');

    list.innerHTML = users.map(user => {
        const userVentures = ventures.filter(v => (v.partners || []).some(p => p.userId === user.id)).map(v => {
            const partner = v.partners.find(p => p.userId === user.id);
            return { name: v.name, equity: partner ? partner.equity : 0 };
        });

        return `
            <div class="partner-item">
                <div class="partner-item-avatar ${user.role}">${user.username.charAt(0).toUpperCase()}</div>
                <div class="partner-item-info">
                    <div class="partner-item-name">${user.username} <span class="badge badge-${user.role}">${user.role}</span></div>
                    ${userVentures.length > 0 ? `<div class="partner-item-ventures">${userVentures.map(v => `<span class="partner-venture-tag">${v.name} <span class="equity">${v.equity}%</span></span>`).join('')}</div>` : '<div style="font-size: 12px; color: var(--text-tertiary);">No ventures assigned</div>'}
                </div>
                <div class="partner-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="openEditPartnerModal(${user.id})">Edit</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderStudioExpenses() {
    const expenses = getStudioExpenses();
    const filteredExpenses = filterByDateRange(expenses);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = expenses.filter(e => new Date(e.date) >= monthStart).reduce((sum, e) => sum + e.amount, 0);

    document.getElementById('totalStudioExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('monthlyStudioExpenses').textContent = formatCurrency(monthlyExpenses);

    const tableBody = document.getElementById('studioExpensesTable');
    tableBody.innerHTML = expenses.length === 0 ? '<tr><td colspan="5" class="empty-state"><p>No studio expenses recorded.</p></td></tr>' : expenses.map(expense => `<tr><td>${expense.description}</td><td><span class="badge">${expense.category}</span></td><td>${formatCurrency(expense.amount)}</td><td>${formatDate(expense.date)}</td><td><div class="table-actions"><button class="action-btn danger" onclick="deleteStudioExpense('${expense.id}')">Delete</button></div></td></tr>`).join('');
}

function renderSettings() {
    const settings = getSettings();
    document.getElementById('applovinApiKey').value = settings.applovinApiKey || '';
    const applovinStatus = document.getElementById('applovinStatus');
    applovinStatus.className = settings.applovinApiKey ? 'api-status connected' : 'api-status';
    applovinStatus.querySelector('.status-text').textContent = settings.applovinApiKey ? 'API key configured' : 'Not configured';
}

// ==================== PARTNER VIEW ====================
function renderPartnerNav() {
    const ventures = getVentures();
    const userVentures = ventures.filter(v => (v.partners || []).some(p => p.userId === currentUser.id));
    document.getElementById('partnerVenturesNav').innerHTML = userVentures.map(v => `<div class="nav-item" onclick="viewVenture('${v.id}')"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${v.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5'}"/></svg>${v.name}</div>`).join('');
}

function renderPartnerView() {
    const ventures = getVentures();
    const userVentures = ventures.filter(v => (v.partners || []).some(p => p.userId === currentUser.id));

    let totalRevenue = 0, totalShare = 0, totalProfit = 0;
    userVentures.forEach(v => {
        const partner = v.partners.find(p => p.userId === currentUser.id);
        const equity = partner ? partner.equity : 0;
        const ventureExpenses = filterByDateRange(v.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        const profit = (v.revenue || 0) - ventureExpenses;
        totalRevenue += v.revenue || 0;
        totalShare += profit * (equity / 100);
        totalProfit += profit;
    });

    document.getElementById('partnerOverviewStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8"/></svg></div><div class="stat-content"><div class="stat-label">Ventures</div><div class="stat-value">${userVentures.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659"/></svg></div><div class="stat-content"><div class="stat-label">Total Revenue</div><div class="stat-value">${formatCurrency(totalRevenue)}</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307"/></svg></div><div class="stat-content"><div class="stat-label">Total Profit</div><div class="stat-value ${totalProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(totalProfit)}</div></div></div>
        <div class="stat-card"><div class="stat-icon orange"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15"/></svg></div><div class="stat-content"><div class="stat-label">Your Share</div><div class="stat-value">${formatCurrency(totalShare)}</div></div></div>
    `;

    const tableBody = document.getElementById('partnerVenturesTable');
    tableBody.innerHTML = userVentures.length === 0 ? '<tr><td colspan="7" class="empty-state"><p>No ventures assigned to you yet.</p></td></tr>' : userVentures.map(v => {
        const partner = v.partners.find(p => p.userId === currentUser.id);
        const equity = partner ? partner.equity : 0;
        const ventureExpenses = filterByDateRange(v.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        const profit = (v.revenue || 0) - ventureExpenses;
        const share = profit * (equity / 100);
        return `<tr onclick="viewVenture('${v.id}')" style="cursor: pointer;"><td><div style="display: flex; align-items: center; gap: 12px;"><div class="venture-card-icon ${v.type}" style="width: 36px; height: 36px;">${v.icon ? `<img src="${v.icon}" alt="${v.name}">` : `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="${v.type === 'game' ? 'M14.25 6.087' : 'M10.5 1.5H8.25'}"/></svg>`}</div><span>${v.name}</span></div></td><td><span class="badge badge-${v.type === 'game' ? 'orange' : 'blue'}">${v.type === 'game' ? 'Game' : 'App'}</span></td><td><span class="state-badge ${v.state}">${v.state.charAt(0).toUpperCase() + v.state.slice(1)}</span></td><td>${equity}%</td><td>${formatCurrency(v.revenue || 0)}</td><td class="${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</td><td class="${share >= 0 ? 'positive' : 'negative'}">${formatCurrency(share)}</td></tr>`;
    }).join('');
}

function renderPartnerPayouts() {
    const ventures = getVentures();
    const userVentures = ventures.filter(v => (v.partners || []).some(p => p.userId === currentUser.id));
    let pendingAmount = 0;
    userVentures.forEach(v => {
        const partner = v.partners.find(p => p.userId === currentUser.id);
        const equity = partner ? partner.equity : 0;
        const ventureExpenses = (v.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        const profit = (v.revenue || 0) - ventureExpenses;
        pendingAmount += profit * (equity / 100);
    });

    const payouts = getPayouts().filter(p => p.userId === currentUser.id);
    const totalPaidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const nextPayoutDate = getNextApplePayoutDate();
    const daysUntilPayout = getDaysUntilPayout();

    document.getElementById('nextPayoutAmount').textContent = formatCurrency(pendingAmount);
    document.getElementById('nextPayoutDate').textContent = formatDate(nextPayoutDate);
    document.getElementById('totalPaidOut').textContent = formatCurrency(totalPaidOut);
    document.getElementById('pendingPayout').textContent = formatCurrency(pendingAmount);
    document.getElementById('nextPayoutFullDate').textContent = nextPayoutDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('payoutCountdown').textContent = `${daysUntilPayout} days`;

    const tableBody = document.getElementById('payoutHistoryTable');
    tableBody.innerHTML = payouts.length === 0 ? '<tr><td colspan="4" class="empty-state"><p>No payout history yet.</p></td></tr>' : payouts.map(p => `<tr><td>${p.period}</td><td>${formatCurrency(p.amount)}</td><td><span class="badge badge-${p.status === 'paid' ? 'green' : 'orange'}">${p.status}</span></td><td>${formatDate(p.date)}</td></tr>`).join('');
}

function renderPartnerContract() {
    const ventures = getVentures();
    const userVentures = ventures.filter(v => (v.partners || []).some(p => p.userId === currentUser.id));
    const venturesList = userVentures.map(v => { const partner = v.partners.find(p => p.userId === currentUser.id); return `<div class="contract-venture-item"><span class="contract-venture-name">${v.name}</span><span class="contract-venture-equity">${partner ? partner.equity : 0}% equity</span></div>`; }).join('') || '<p class="contract-text">No ventures assigned yet.</p>';

    document.getElementById('contractBody').innerHTML = `
        <div class="contract-section"><div class="contract-section-title">Partner Information</div><div class="contract-text"><strong>Partner:</strong> ${currentUser.username}<br><strong>Role:</strong> ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}<br><strong>Status:</strong> Active</div></div>
        <div class="contract-section"><div class="contract-section-title">Venture Assignments</div><div class="contract-text">You have been assigned equity in the following ventures:</div><div class="contract-ventures-list">${venturesList}</div></div>
        <div class="contract-section"><div class="contract-section-title">Payment Schedule</div><div class="contract-text">Profit distributions are processed in accordance with Apple's payout schedule. Payments are typically disbursed within 45 days after the end of each fiscal month.</div></div>
        ${currentUser.contract ? `<div class="contract-section"><div class="contract-section-title">Additional Terms</div><div class="contract-text">${currentUser.contract}</div></div>` : ''}
    `;
}

function renderPartnerVentureDetail() {
    if (!currentVenture) return;
    document.getElementById('partnerVentureDetailName').textContent = currentVenture.name;
    document.getElementById('partnerVentureDetailType').textContent = currentVenture.type === 'game' ? 'Mobile Game' : 'Consumer App';
    const iconDisplay = document.getElementById('partnerVentureIconDisplay');
    iconDisplay.innerHTML = currentVenture.icon ? `<img src="${currentVenture.icon}" alt="${currentVenture.name}">` : `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8"/></svg>`;

    const partner = (currentVenture.partners || []).find(p => p.userId === currentUser.id);
    const equity = partner ? partner.equity : 0;
    const ventureExpenses = filterByDateRange(currentVenture.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const profit = (currentVenture.revenue || 0) - ventureExpenses;
    const share = profit * (equity / 100);

    document.getElementById('partnerVentureDetailStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon orange"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15"/></svg></div><div class="stat-content"><div class="stat-label">Your Equity</div><div class="stat-value">${equity}%</div></div></div>
        <div class="stat-card"><div class="stat-icon purple"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659"/></svg></div><div class="stat-content"><div class="stat-label">${currentVenture.type === 'game' ? 'Revenue' : 'Proceeds'}</div><div class="stat-value">${formatCurrency(currentVenture.revenue || 0)}</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307"/></svg></div><div class="stat-content"><div class="stat-label">Profit</div><div class="stat-value ${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18"/></svg></div><div class="stat-content"><div class="stat-label">Your Share</div><div class="stat-value ${share >= 0 ? 'positive' : 'negative'}">${formatCurrency(share)}</div></div></div>
    `;

    const expensesTable = document.getElementById('partnerVentureExpensesTable');
    const expenses = currentVenture.expenses || [];
    expensesTable.innerHTML = expenses.length === 0 ? '<tr><td colspan="3" class="empty-state"><p>No expenses recorded.</p></td></tr>' : expenses.map(e => `<tr><td>${e.description}</td><td>${formatCurrency(e.amount)}</td><td>${formatDate(e.date)}</td></tr>`).join('');
}

// ==================== CHARTS ====================
function initCharts() {
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: value => '$' + value.toLocaleString() } } } };

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'line', data: { labels: [], datasets: [{ label: 'Revenue', data: [], borderColor: '#5b4fff', backgroundColor: 'rgba(91,79,255,0.1)', fill: true, tension: 0.4 }, { label: 'Profit', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }] }, options: chartOptions
        });
    }

    const studioCtx = document.getElementById('studioChart');
    if (studioCtx) {
        studioChart = new Chart(studioCtx.getContext('2d'), {
            type: 'bar', data: { labels: [], datasets: [{ label: 'Studio Revenue', data: [], backgroundColor: '#3b82f6' }, { label: 'Expenses', data: [], backgroundColor: '#ef4444' }] }, options: { ...chartOptions, plugins: { legend: { display: false } } }
        });
    }
}

function updateCharts() {
    if (!revenueChart || !studioChart) return;
    const ventures = getVentures();
    const studioExpenses = getStudioExpenses();
    const days = currentDateRange === 'all' ? 30 : parseInt(currentDateRange);
    const labels = [], revenueData = [], profitData = [], studioRevData = [], expenseData = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dayRevenue = ventures.reduce((sum, v) => sum + ((v.revenue || 0) / days), 0);
        const dayExpenses = studioExpenses.reduce((sum, e) => sum + (e.amount / days), 0);
        const dayStudioRev = ventures.reduce((sum, v) => sum + (((v.revenue || 0) * (v.studioEquity / 100)) / days), 0);
        revenueData.push(Math.round(dayRevenue));
        profitData.push(Math.round(dayRevenue - dayExpenses));
        studioRevData.push(Math.round(dayStudioRev));
        expenseData.push(Math.round(dayExpenses));
    }

    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = revenueData;
    revenueChart.data.datasets[1].data = profitData;
    revenueChart.update();

    studioChart.data.labels = labels;
    studioChart.data.datasets[0].data = studioRevData;
    studioChart.data.datasets[1].data = expenseData;
    studioChart.update();
}

function updateVentureChart() {
    if (!currentVenture) return;
    const ventureCtx = document.getElementById('ventureChart');
    if (!ventureCtx) return;
    if (ventureChart) ventureChart.destroy();

    const days = currentDateRange === 'all' ? 30 : parseInt(currentDateRange);
    const labels = [], revenueData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        revenueData.push(Math.round((currentVenture.revenue || 0) / days));
    }

    ventureChart = new Chart(ventureCtx.getContext('2d'), {
        type: 'line', data: { labels: labels, datasets: [{ label: currentVenture.type === 'game' ? 'Revenue' : 'Proceeds', data: revenueData, borderColor: '#5b4fff', backgroundColor: 'rgba(91,79,255,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: v => '$' + v.toLocaleString() } } } }
    });
}

// ==================== PARTNER CRUD ====================
function addPartner() {
    const username = document.getElementById('newPartnerUsername').value.trim();
    const password = document.getElementById('newPartnerPassword').value;
    const role = document.getElementById('newPartnerRole').value;
    const contract = document.getElementById('newPartnerContract').value.trim();
    if (!username || !password) { showToast('Please fill in all required fields', 'error'); return; }

    const users = getUsers();
    if (users.some(u => u.username === username)) { showToast('Username already exists', 'error'); return; }

    users.push({ id: Date.now(), username, password, role, contract });
    saveUsers(users);
    closeModal('addPartnerModal');
    document.getElementById('newPartnerUsername').value = '';
    document.getElementById('newPartnerPassword').value = '';
    document.getElementById('newPartnerRole').value = 'partner';
    document.getElementById('newPartnerContract').value = '';
    renderPartners();
    showToast('Partner added successfully');
}

function openEditPartnerModal(partnerId) {
    const user = getUsers().find(u => u.id === partnerId);
    if (!user) return;
    editingPartnerId = partnerId;
    document.getElementById('editPartnerUsername').value = user.username;
    document.getElementById('editPartnerPassword').value = '';
    document.getElementById('editPartnerRole').value = user.role;
    document.getElementById('editPartnerContract').value = user.contract || '';
    openModal('editPartnerModal');
}

function savePartnerChanges() {
    if (!editingPartnerId) return;
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === editingPartnerId);
    if (userIndex === -1) return;

    const newPassword = document.getElementById('editPartnerPassword').value;
    users[userIndex].role = document.getElementById('editPartnerRole').value;
    users[userIndex].contract = document.getElementById('editPartnerContract').value.trim();
    if (newPassword) users[userIndex].password = newPassword;

    saveUsers(users);
    closeModal('editPartnerModal');
    editingPartnerId = null;
    renderPartners();
    showToast('Partner updated successfully');
}

function deleteEditingPartner() {
    if (!editingPartnerId) return;
    const users = getUsers();
    const user = users.find(u => u.id === editingPartnerId);
    if (user && user.username === 'admin') { showToast('Cannot delete admin account', 'error'); return; }
    if (!confirm('Are you sure you want to delete this partner?')) return;

    saveUsers(users.filter(u => u.id !== editingPartnerId));
    const ventures = getVentures();
    ventures.forEach(v => { v.partners = (v.partners || []).filter(p => p.userId !== editingPartnerId); });
    saveVentures(ventures);

    closeModal('editPartnerModal');
    editingPartnerId = null;
    renderPartners();
    showToast('Partner deleted');
}

// ==================== VENTURE CRUD ====================
function addVenture() {
    const name = document.getElementById('newVentureName').value.trim();
    const type = document.querySelector('input[name="newVentureType"]:checked').value;
    const state = document.getElementById('newVentureState').value;
    const revenue = parseFloat(document.getElementById('newVentureRevenue').value) || 0;
    const studioEquity = Math.min(100, Math.max(0, parseFloat(document.getElementById('newVentureStudioEquity').value) || 100));
    const bundleId = document.getElementById('newVentureBundleId').value.trim();
    const superwallKey = document.getElementById('newVentureSuperwallKey').value.trim();
    const iconInput = document.getElementById('newVentureIconInput');

    if (!name) { showToast('Please enter a venture name', 'error'); return; }

    const newVenture = { id: generateId(), name, type, state, revenue, studioEquity, bundleId: type === 'game' ? bundleId : '', superwallKey: type === 'app' ? superwallKey : '', icon: null, partners: [], expenses: [], createdAt: new Date().toISOString() };

    if (iconInput.files && iconInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { newVenture.icon = e.target.result; saveVentureAndClose(newVenture); };
        reader.readAsDataURL(iconInput.files[0]);
    } else { saveVentureAndClose(newVenture); }
}

function saveVentureAndClose(venture) {
    const ventures = getVentures();
    ventures.push(venture);
    saveVentures(ventures);
    closeModal('addVentureModal');
    resetAddVentureForm();
    renderVentures();
    renderOverview();
    showToast('Venture added successfully');
}

function resetAddVentureForm() {
    document.getElementById('newVentureName').value = '';
    document.getElementById('newVentureRevenue').value = '0';
    document.getElementById('newVentureStudioEquity').value = '100';
    document.getElementById('newVentureState').value = 'building';
    document.getElementById('newVentureBundleId').value = '';
    document.getElementById('newVentureSuperwallKey').value = '';
    document.getElementById('newVentureIconInput').value = '';
    document.querySelector('input[name="newVentureType"][value="app"]').checked = true;
    document.getElementById('newVentureBundleIdGroup').style.display = 'none';
    document.getElementById('newVentureSuperwallGroup').style.display = 'block';
    const preview = document.getElementById('newVentureIconPreview');
    preview.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg><span>Click to upload</span>`;
    preview.classList.remove('has-image');
}

function openEditVentureModal() {
    if (!currentVenture) return;
    document.getElementById('editVentureName').value = currentVenture.name;
    document.getElementById('editVentureType').value = currentVenture.type;
    document.getElementById('editVentureState').value = currentVenture.state;
    document.getElementById('editVentureRevenue').value = currentVenture.revenue || 0;
    document.getElementById('editVentureStudioEquity').value = currentVenture.studioEquity || 100;
    document.getElementById('editVentureBundleId').value = currentVenture.bundleId || '';
    document.getElementById('editVentureSuperwallKey').value = currentVenture.superwallKey || '';

    const preview = document.getElementById('editVentureIconPreview');
    if (currentVenture.icon) {
        preview.innerHTML = `<img src="${currentVenture.icon}" alt="${currentVenture.name}">`;
        preview.classList.add('has-image');
    } else {
        preview.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159"/></svg><span>Click to upload</span>`;
        preview.classList.remove('has-image');
    }

    updateEditVentureApiFields();
    renderPartnersAssignment();
    openModal('editVentureModal');
}

function updateEditVentureApiFields() {
    const type = document.getElementById('editVentureType').value;
    document.getElementById('editVentureBundleIdGroup').style.display = type === 'game' ? 'block' : 'none';
    document.getElementById('editVentureSuperwallGroup').style.display = type === 'app' ? 'block' : 'none';
}

function renderPartnersAssignment() {
    const users = getUsers().filter(u => u.role === 'partner');
    const container = document.getElementById('editVenturePartnersContainer');
    if (users.length === 0) { container.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px;">No partners available.</p>'; return; }
    container.innerHTML = users.map(user => {
        const assigned = (currentVenture.partners || []).find(p => p.userId === user.id);
        return `<div class="partner-assign-item"><input type="checkbox" id="partner_${user.id}" ${assigned ? 'checked' : ''}><label for="partner_${user.id}">${user.username}</label><input type="number" id="equity_${user.id}" value="${assigned ? assigned.equity : 0}" min="0" max="100" placeholder="0"><span>%</span></div>`;
    }).join('');
}

function saveVentureChanges() {
    if (!currentVenture) return;
    const ventures = getVentures();
    const ventureIndex = ventures.findIndex(v => v.id === currentVenture.id);
    if (ventureIndex === -1) return;

    const name = document.getElementById('editVentureName').value.trim();
    if (!name) { showToast('Please enter a venture name', 'error'); return; }

    const type = document.getElementById('editVentureType').value;
    const users = getUsers().filter(u => u.role === 'partner');
    const partners = [];
    users.forEach(user => {
        const checkbox = document.getElementById(`partner_${user.id}`);
        const equityInput = document.getElementById(`equity_${user.id}`);
        if (checkbox && checkbox.checked) partners.push({ userId: user.id, equity: parseFloat(equityInput.value) || 0 });
    });

    ventures[ventureIndex].name = name;
    ventures[ventureIndex].type = type;
    ventures[ventureIndex].state = document.getElementById('editVentureState').value;
    ventures[ventureIndex].revenue = parseFloat(document.getElementById('editVentureRevenue').value) || 0;
    ventures[ventureIndex].studioEquity = Math.min(100, Math.max(0, parseFloat(document.getElementById('editVentureStudioEquity').value) || 100));
    ventures[ventureIndex].bundleId = type === 'game' ? document.getElementById('editVentureBundleId').value.trim() : '';
    ventures[ventureIndex].superwallKey = type === 'app' ? document.getElementById('editVentureSuperwallKey').value.trim() : '';
    ventures[ventureIndex].partners = partners;

    const iconInput = document.getElementById('editVentureIconInput');
    if (iconInput.files && iconInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { ventures[ventureIndex].icon = e.target.result; saveVentures(ventures); currentVenture = ventures[ventureIndex]; finishVentureSave(); };
        reader.readAsDataURL(iconInput.files[0]);
    } else { saveVentures(ventures); currentVenture = ventures[ventureIndex]; finishVentureSave(); }
}

function finishVentureSave() {
    closeModal('editVentureModal');
    renderVentureDetail();
    renderOverview();
    showToast('Venture updated successfully');
}

function deleteCurrentVenture() {
    if (!currentVenture || !confirm('Are you sure you want to delete this venture?')) return;
    saveVentures(getVentures().filter(v => v.id !== currentVenture.id));
    currentVenture = null;
    closeModal('editVentureModal');
    navigateTo('ventures');
    showToast('Venture deleted');
}

// ==================== EXPENSE CRUD ====================
function addVentureExpense() {
    if (!currentVenture) return;
    const description = document.getElementById('newExpenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('newExpenseAmount').value) || 0;
    if (!description || amount <= 0) { showToast('Please fill in all fields', 'error'); return; }

    const ventures = getVentures();
    const ventureIndex = ventures.findIndex(v => v.id === currentVenture.id);
    if (ventureIndex === -1) return;

    if (!ventures[ventureIndex].expenses) ventures[ventureIndex].expenses = [];
    ventures[ventureIndex].expenses.push({ id: generateId(), description, amount, date: new Date().toISOString() });

    saveVentures(ventures);
    currentVenture = ventures[ventureIndex];
    closeModal('addExpenseModal');
    document.getElementById('newExpenseDescription').value = '';
    document.getElementById('newExpenseAmount').value = '';
    renderVentureDetail();
    renderOverview();
    showToast('Expense added');
}

function deleteVentureExpense(expenseId) {
    if (!currentVenture) return;
    const ventures = getVentures();
    const ventureIndex = ventures.findIndex(v => v.id === currentVenture.id);
    if (ventureIndex === -1) return;

    ventures[ventureIndex].expenses = (ventures[ventureIndex].expenses || []).filter(e => e.id !== expenseId);
    saveVentures(ventures);
    currentVenture = ventures[ventureIndex];
    renderVentureDetail();
    renderOverview();
    showToast('Expense deleted');
}

function addStudioExpense() {
    const description = document.getElementById('newStudioExpenseDescription').value.trim();
    const category = document.getElementById('newStudioExpenseCategory').value;
    const amount = parseFloat(document.getElementById('newStudioExpenseAmount').value) || 0;
    if (!description || amount <= 0) { showToast('Please fill in all fields', 'error'); return; }

    const expenses = getStudioExpenses();
    expenses.push({ id: generateId(), description, category, amount, date: new Date().toISOString() });
    saveStudioExpenses(expenses);

    closeModal('addStudioExpenseModal');
    document.getElementById('newStudioExpenseDescription').value = '';
    document.getElementById('newStudioExpenseCategory').value = 'operations';
    document.getElementById('newStudioExpenseAmount').value = '';
    renderStudioExpenses();
    renderOverview();
    showToast('Studio cost added');
}

function deleteStudioExpense(expenseId) {
    saveStudioExpenses(getStudioExpenses().filter(e => e.id !== expenseId));
    renderStudioExpenses();
    renderOverview();
    showToast('Expense deleted');
}

// ==================== API & SETTINGS ====================
function saveApplovinKey() {
    const settings = getSettings();
    settings.applovinApiKey = document.getElementById('applovinApiKey').value.trim();
    saveSettings(settings);
    renderSettings();
    showToast('AppLovin API key saved');
}

async function testApplovinApi() {
    const apiKey = getSettings().applovinApiKey;
    if (!apiKey) { showToast('Please enter an API key first', 'error'); return; }

    showToast('Testing API connection...');

    try {
        // AppLovin MAX Reporting API test
        const today = new Date().toISOString().split('T')[0];
        const url = `https://r.applovin.com/maxReport?api_key=${apiKey}&start=${today}&end=${today}&format=json&columns=day,application`;

        const response = await fetch(url);

        if (response.ok) {
            document.getElementById('applovinStatus').className = 'api-status connected';
            document.getElementById('applovinStatus').querySelector('.status-text').textContent = 'Connected';
            showToast('API connection successful');
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Invalid API response');
        }
    } catch (error) {
        console.error('AppLovin API error:', error);
        document.getElementById('applovinStatus').className = 'api-status error';
        document.getElementById('applovinStatus').querySelector('.status-text').textContent = 'Connection failed';
        showToast(`API error: ${error.message || 'Connection failed'}`, 'error');
    }
}

async function fetchApplovinRevenue(bundleId, startDate, endDate) {
    const apiKey = getSettings().applovinApiKey;
    if (!apiKey || !bundleId) return null;

    try {
        const url = `https://r.applovin.com/maxReport?api_key=${apiKey}&start=${startDate}&end=${endDate}&format=json&columns=day,estimated_revenue&filter_application=${bundleId}`;
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results.reduce((sum, row) => sum + (parseFloat(row.estimated_revenue) || 0), 0);
            }
        }
        return null;
    } catch (error) {
        console.error('AppLovin fetch error:', error);
        return null;
    }
}

async function fetchSuperwallRevenue(apiKey, startDate, endDate) {
    if (!apiKey) return null;

    try {
        // Superwall Analytics API
        const url = `https://api.superwall.com/api/v1/analytics/revenue?start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.total_revenue || data.revenue || null;
        }
        return null;
    } catch (error) {
        console.error('Superwall fetch error:', error);
        return null;
    }
}

async function refreshAllData() {
    showToast('Syncing data from APIs...');

    const ventures = getVentures();
    const settings = getSettings();
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < ventures.length; i++) {
        const venture = ventures[i];

        // Skip ventures in building or killed state
        if (venture.state === 'building' || venture.state === 'killed') continue;

        try {
            let revenue = null;

            if (venture.type === 'game' && venture.bundleId && settings.applovinApiKey) {
                revenue = await fetchApplovinRevenue(venture.bundleId, startDate, endDate);
            } else if (venture.type === 'app' && venture.superwallKey) {
                revenue = await fetchSuperwallRevenue(venture.superwallKey, startDate, endDate);
            }

            if (revenue !== null) {
                ventures[i].revenue = (ventures[i].revenue || 0) + revenue;
                updatedCount++;
            }
        } catch (error) {
            console.error(`Error syncing ${venture.name}:`, error);
            errorCount++;
        }
    }

    saveVentures(ventures);
    renderOverview();

    if (errorCount > 0) {
        showToast(`Synced ${updatedCount} ventures, ${errorCount} errors`, 'error');
    } else if (updatedCount > 0) {
        showToast(`Synced ${updatedCount} ventures successfully`);
    } else {
        showToast('No API-connected ventures to sync');
    }
}

async function syncVentureData() {
    if (!currentVenture) return;

    // Skip if building or killed
    if (currentVenture.state === 'building' || currentVenture.state === 'killed') {
        showToast('Venture is not in a syncable state', 'error');
        return;
    }

    showToast('Syncing venture data...');

    const settings = getSettings();
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    try {
        let revenue = null;

        if (currentVenture.type === 'game' && currentVenture.bundleId && settings.applovinApiKey) {
            revenue = await fetchApplovinRevenue(currentVenture.bundleId, startDate, endDate);
        } else if (currentVenture.type === 'app' && currentVenture.superwallKey) {
            revenue = await fetchSuperwallRevenue(currentVenture.superwallKey, startDate, endDate);
        }

        if (revenue !== null) {
            const ventures = getVentures();
            const ventureIndex = ventures.findIndex(v => v.id === currentVenture.id);
            if (ventureIndex !== -1) {
                ventures[ventureIndex].revenue = revenue;
                saveVentures(ventures);
                currentVenture = ventures[ventureIndex];
            }
            showToast(`Revenue updated: ${formatCurrency(revenue)}`);
        } else {
            showToast('No revenue data available or API not configured', 'error');
        }
    } catch (error) {
        console.error('Sync error:', error);
        showToast('Failed to sync: ' + error.message, 'error');
    }

    renderVentureDetail();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    checkSession();

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.querySelectorAll('.nav-item[data-page]').forEach(item => { item.addEventListener('click', () => { navigateTo(item.dataset.page); }); });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDateRange = btn.dataset.range;
            updateDateRangeDisplay();
            renderOverview();
            updateCharts();
        });
    });

    document.querySelectorAll('.state-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStateFilter = btn.dataset.state;
            renderVentures();
        });
    });

    document.querySelectorAll('input[name="newVentureType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const type = radio.value;
            document.getElementById('newVentureBundleIdGroup').style.display = type === 'game' ? 'block' : 'none';
            document.getElementById('newVentureSuperwallGroup').style.display = type === 'app' ? 'block' : 'none';
        });
    });

    document.getElementById('editVentureType').addEventListener('change', updateEditVentureApiFields);

    document.getElementById('newVentureIconInput').addEventListener('change', function() { handleIconPreview(this, 'newVentureIconPreview'); });
    document.getElementById('editVentureIconInput').addEventListener('change', function() { handleIconPreview(this, 'editVentureIconPreview'); });

    document.querySelectorAll('.modal-overlay').forEach(overlay => { overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); }); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(modal => modal.classList.remove('active')); });
});

function handleIconPreview(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { preview.innerHTML = `<img src="${e.target.result}" alt="Icon preview">`; preview.classList.add('has-image'); };
        reader.readAsDataURL(input.files[0]);
    }
}

// Make functions globally accessible
window.navigateTo = navigateTo;
window.viewVenture = viewVenture;
window.openModal = openModal;
window.closeModal = closeModal;
window.togglePasswordVisibility = togglePasswordVisibility;
window.addPartner = addPartner;
window.openEditPartnerModal = openEditPartnerModal;
window.savePartnerChanges = savePartnerChanges;
window.deleteEditingPartner = deleteEditingPartner;
window.addVenture = addVenture;
window.openEditVentureModal = openEditVentureModal;
window.saveVentureChanges = saveVentureChanges;
window.deleteCurrentVenture = deleteCurrentVenture;
window.addVentureExpense = addVentureExpense;
window.deleteVentureExpense = deleteVentureExpense;
window.addStudioExpense = addStudioExpense;
window.deleteStudioExpense = deleteStudioExpense;
window.saveApplovinKey = saveApplovinKey;
window.testApplovinApi = testApplovinApi;
window.refreshAllData = refreshAllData;
window.syncVentureData = syncVentureData;
