/* script.js */
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

    // FAQ Toggle
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const ans = q.nextElementSibling;
            const icon = q.querySelector('i');
            ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
            if(icon) icon.className = ans.style.display === 'block' ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        });
    });

    // Helper: Currency
    const formatMoney = (amt) => '₹' + Math.round(amt).toLocaleString('en-IN');

    // --- CALCULATOR FUNCTIONS ---

    // 1. SIP
    function calculateSIP() {
        const elM = document.getElementById('sip-monthly');
        if(!elM) return; 
        const monthly = parseFloat(elM.value) || 0;
        const rate = parseFloat(document.getElementById('sip-return').value) || 0;
        const years = parseFloat(document.getElementById('sip-period').value) || 0;
        
        const mRate = rate / 100 / 12;
        const months = years * 12;
        let fv = 0;
        
        if (mRate > 0) fv = monthly * ((Math.pow(1 + mRate, months) - 1) / mRate) * (1 + mRate);
        else fv = monthly * months;

        const invested = monthly * months;
        
        if(document.getElementById('sip-invested')) document.getElementById('sip-invested').textContent = formatMoney(invested);
        if(document.getElementById('sip-returns')) document.getElementById('sip-returns').textContent = formatMoney(fv - invested);
        if(document.getElementById('sip-total')) document.getElementById('sip-total').textContent = formatMoney(fv);
        
        // Update Chart (Simple Bar)
        const chart = document.getElementById('sip-chart');
        if(chart) {
            chart.innerHTML = '';
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = '100%'; bar.style.width = '50%'; bar.style.margin = '0 auto';
            bar.title = 'Projected Growth';
            chart.appendChild(bar);
        }
    }

    // 2. SWP
    function calculateSWP() {
        const elI = document.getElementById('swp-investment');
        if(!elI) return;
        const invest = parseFloat(elI.value) || 0;
        const withdraw = parseFloat(document.getElementById('swp-monthly').value) || 0;
        const rate = parseFloat(document.getElementById('swp-return').value) || 0;
        const years = parseFloat(document.getElementById('swp-period').value) || 0;

        const mRate = rate / 100 / 12;
        const months = years * 12;
        let corpus = invest;
        let totalWithdraw = 0;

        for(let i=0; i<months; i++) {
            corpus = corpus * (1 + mRate);
            if(corpus >= withdraw) { corpus -= withdraw; totalWithdraw += withdraw; }
            else { totalWithdraw += corpus; corpus = 0; break; }
        }

        if(document.getElementById('swp-withdrawals')) document.getElementById('swp-withdrawals').textContent = formatMoney(totalWithdraw);
        if(document.getElementById('swp-remaining')) document.getElementById('swp-remaining').textContent = formatMoney(corpus);
        if(document.getElementById('swp-total')) document.getElementById('swp-total').textContent = formatMoney(totalWithdraw + corpus);
    }

    // 3. LOANS (Home, Car, Bike, EMI)
    function calculateLoan(prefix) {
        // prefix could be 'home', 'car', 'bike', or 'emi-page'
        const priceEl = document.getElementById(prefix + '-price') || document.getElementById(prefix + '-loan-amount');
        if(!priceEl) return;

        let loanAmt = parseFloat(priceEl.value) || 0;
        
        // For Home/Car/Bike, calculate loan from Price - Downpayment
        const dpEl = document.getElementById(prefix + '-downpayment');
        if(dpEl) {
            let dp = parseFloat(dpEl.value) || 0;
            const price = parseFloat(document.getElementById(prefix + '-price').value) || 0;
            if(dp > price) { dp = price; dpEl.value = price; }
            loanAmt = price - dp;
            const displayLoan = document.getElementById(prefix + '-loan-amount');
            if(displayLoan) displayLoan.value = loanAmt;
        }

        const rate = parseFloat(document.getElementById(prefix + '-interest-rate').value) || 0;
        const years = parseFloat(document.getElementById(prefix + '-loan-tenure').value) || 0;
        
        const months = years * 12;
        const mRate = rate / 100 / 12;
        let emi = 0;

        if(mRate > 0) emi = (loanAmt * mRate * Math.pow(1+mRate, months)) / (Math.pow(1+mRate, months)-1);
        else emi = loanAmt / months;

        const totalPay = emi * months;
        const totalInt = totalPay - loanAmt;

        if(document.getElementById(prefix + '-emi')) document.getElementById(prefix + '-emi').textContent = formatMoney(emi);
        if(document.getElementById(prefix + '-total-interest')) document.getElementById(prefix + '-total-interest').textContent = formatMoney(totalInt);
        if(document.getElementById(prefix + '-total-payment')) document.getElementById(prefix + '-total-payment').textContent = formatMoney(totalPay);
    }

    // 4. RETIREMENT
    function calculateRetirement() {
        const elAge = document.getElementById('ret-age');
        if(!elAge) return;
        const curAge = parseFloat(elAge.value);
        const retAge = parseFloat(document.getElementById('ret-ret-age').value);
        const expense = parseFloat(document.getElementById('ret-expense').value);
        const inflation = parseFloat(document.getElementById('ret-inflation').value);
        
        const years = Math.max(0, retAge - curAge);
        const fvExpense = expense * Math.pow(1 + inflation/100, years);
        const corpus = (fvExpense * 12) * 25; // 4% rule

        document.getElementById('ret-corpus').textContent = formatMoney(corpus);
        document.getElementById('ret-monthly-savings').textContent = formatMoney(corpus / (years * 12));
        document.getElementById('ret-years').textContent = years;
    }

    // --- INPUT BINDING ---
    const bind = (ids, func) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            const sl = document.getElementById(id + '-slider');
            if(el) el.addEventListener('input', () => { if(sl) sl.value = el.value; func(); });
            if(sl) sl.addEventListener('input', () => { if(el) el.value = sl.value; func(); });
        });
    };

    // Bind SIP
    bind(['sip-monthly', 'sip-return', 'sip-period'], calculateSIP);
    // Bind SWP
    bind(['swp-investment', 'swp-monthly', 'swp-return', 'swp-period'], calculateSWP);
    // Bind EMI Page
    bind(['emi-page-loan-amount', 'emi-page-interest-rate', 'emi-page-loan-tenure'], () => calculateLoan('emi-page'));
    // Bind Home Loan
    bind(['home-price', 'home-downpayment', 'home-interest-rate', 'home-loan-tenure'], () => calculateLoan('home'));
    // Bind Car Loan
    bind(['car-price', 'car-downpayment', 'car-interest-rate', 'car-loan-tenure'], () => calculateLoan('car'));
    // Bind Bike Loan
    bind(['bike-price', 'bike-downpayment', 'bike-interest-rate', 'bike-loan-tenure'], () => calculateLoan('bike'));
    // Bind Retirement
    bind(['ret-age', 'ret-ret-age', 'ret-expense', 'ret-inflation'], calculateRetirement);

    // Initial Calculations
    calculateSIP();
    calculateSWP();
    calculateLoan('home');
    calculateLoan('car');
    calculateLoan('bike');
    calculateLoan('emi-page');
    calculateRetirement();
});