let electionChart;

// سویتچکردنی لاپەڕەکان (دابینکردنی ئەکشن بۆ کلیکەکان)
function switchTab(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('d-none');
        section.classList.remove('active');
    });
    
    const selectedPage = document.getElementById(pageId);
    if(selectedPage) {
        selectedPage.classList.remove('d-none');
        selectedPage.classList.add('active');
    }
}

// هەژمارکردنی دەنگەکان بە شێوەی ڕاستەوخۆ (Real-time)
function calculateVotes() {
    let validVotes = 0;
    const partyInputs = document.querySelectorAll('.party-vote-input');
    const chartData = [];
    
    partyInputs.forEach(input => {
        const val = parseInt(input.value) || 0;
        validVotes += val;
        chartData.push(val);
    });

    const invalidVotes = parseInt(document.getElementById('invalidVotesInput').value) || 0;
    const totalVotes = validVotes + invalidVotes;

    document.getElementById('validVotesText').innerText = validVotes;
    document.getElementById('totalVotesText').innerText = totalVotes;

    // نوێکردنەوەی چارتەکە
    if(electionChart) {
        electionChart.data.datasets[0].data = chartData;
        electionChart.update();
    }
}

// دروستکردنی سەرەتایی Chart.js
window.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('liveElectionChart');
    if (ctx) {
        const partyNames = Array.from(document.querySelectorAll('.party-name')).map(el => el.innerText);
        
        electionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: partyNames,
                datasets: [{
                    label: 'ژمارەی دەنگەکان',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: ['#facc15', '#22c55e', '#f97316', '#854d0e', '#c2410c', '#a855f7']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});

// گۆڕینی جۆری چارت (Bar, Pie, Line, Doughnut)
function changeChartType(type) {
    if(electionChart) {
        electionChart.config.type = type;
        electionChart.update();
    }
}

// گۆڕینی تێمی ڕوکار
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}