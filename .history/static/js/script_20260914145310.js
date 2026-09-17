// کۆنتڕۆڵی تیمەکان (Themes)
function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

// هێنانەوەی تیمەکە ئەگەر پێشتر هەڵبژێردرابێت
window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeSelector').value = savedTheme;
};

// دروستکردنی چارتی تاقیکاری لە داشبۆرد
let electionChart;
const ctx = document.getElementById('electionChart');

if (ctx) {
    const data = {
        labels: ['پارتی', 'یەکێتی', 'نەوەی نوێ', 'یەکگرتوو', 'کۆمەڵ'],
        datasets: [{
            label: 'دەنگەکان',
            data: [800000, 400000, 200000, 100000, 90000],
            backgroundColor: ['#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#e53935'],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar', // سوتونی وەک سەرەتا
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    };

    electionChart = new Chart(ctx, config);
}

// فەنکشنی گۆڕینی جۆری چارتەکە لە کۆمبۆ بۆکسەکەوە
function updateChartType(newType) {
    if (electionChart) {
        electionChart.config.type = newType;
        electionChart.update();
    }
}