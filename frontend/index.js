const salaryData = {
    class: {},
    references: [],
    comparative: []
}

let chart;

const body = document.getElementById('body');
const resultContainer = document.getElementById('results');
const socialClassCard = document.getElementById('socialClassCard');

const loadSalaryData = async (salary) => {
    try {
        const response = await fetch(`http://localhost:3000/api/salarios/${salary}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return alert(data?.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.class || !data.comparative || !data.references) {
            return alert('Datos incompletos recibidos del servidor');
        }

        Object.assign(salaryData, {
            class: data.class,
            comparative: data.comparative,
            references: data.references
        });

        renderSocialClassCard(salary);
        renderComparisonTable();
        renderChart(salary);

        resultContainer.style.display = 'block';

    } catch (error) {
        console.error('Error cargando datos: ', error);
        resultContainer.style.display = 'none';
        alert('Error al cargar los datos salariales');
    }
}

const renderSocialClassCard = (userSalary) => {

    const socialClass = salaryData.class;
    const colors = ["#ffeb3b", "#ff9800", "#8bc34a"];

    body.style.backgroundColor = socialClass.color + "45";

    const content = `
        <h3 class="social-class-header" style="border-left-color: ${socialClass.color}">
            ${socialClass.nombre}
        </h3>
        <p class="mb-4">${socialClass.descripcion}</p>
        
        <div class="salary-detail">
            <div class="d-flex justify-content-between">
                <span class="fw-bold">Salario Mensual:</span>
                <span>$${Number(userSalary).toLocaleString('es-CO')}</span>
            </div>
        </div>
        
        <div class="salary-detail">
            <div class="d-flex justify-content-between">
                <span class="fw-bold">Salario Diario:</span>
                <span>$${socialClass.salarioDiario.toLocaleString('es-CO')}</span>
            </div>
        </div>
        
        <div class="salary-detail">
            <div class="d-flex justify-content-between">
                <span class="fw-bold">Rango de la clase:</span>
                <span>$${socialClass.min.toLocaleString('es-CO')} - $${socialClass.max?.toLocaleString('es-CO') || '∞'}</span>
            </div>
        </div>
    `;

    document.getElementById('socialClassContent').innerHTML = content;

    socialClassCard.style.backgroundColor = socialClass.color;
    socialClassCard.style.color = colors.includes(socialClass.color) ? "#000" : "#FFF";
}

const renderComparisonTable = () => {

    const tbody = document.getElementById('comparisonTableBody');
    tbody.innerHTML = '';

    salaryData.comparative.forEach((item, pos) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pos + 1}</td>
            <td>${item.nombre}</td>
            <td class="text-center">${item.tipo}</td>
            <td class="text-end">$${item.salario_diario.toLocaleString('es-CO')}</td>
            <td class="text-end">${item.veces_salario_minimo}</td>
            <td class="text-end">${item.veces_salario_usuario}x</td>
        `;
        tbody.appendChild(row);
    });
}

const renderChart = (userSalary) => {

    const canvas = document.getElementById('salaryChart');

    if (chart) chart.destroy();

    const SALARY_COLORS = {
        HIGHER: { bg: 'rgba(220, 53, 69, 0.7)', border: 'rgba(220, 53, 69, 1)' },
        SIMILAR: { bg: 'rgba(255, 193, 7, 0.7)', border: 'rgba(255, 193, 7, 1)' },
        LOWER: { bg: 'rgba(25, 135, 84, 0.7)', border: 'rgba(25, 135, 84, 1)' },
        USER: { bg: 'rgba(13, 110, 253, 0.5)', border: 'rgba(13, 110, 253, 1)' }
    };

    const references = salaryData.references;
    const labels = references.map(item => item.nombre);
    const monthlySalaries = references.map(item => item.salario_diario * 30);

    chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Salarios de Referencia (Mensual)',
                    data: monthlySalaries,
                    backgroundColor: references.map(item => {
                        const salary = item.salario_diario * 30;
                        if (salary > userSalary * 5) return SALARY_COLORS.HIGHER.bg;
                        if (salary > userSalary) return SALARY_COLORS.SIMILAR.bg;
                        return SALARY_COLORS.LOWER.bg;
                    }),
                    borderColor: references.map(item => {
                        const salary = item.salario_diario * 30;
                        if (salary > userSalary * 5) return SALARY_COLORS.HIGHER.border;
                        if (salary > userSalary) return SALARY_COLORS.SIMILAR.border;
                        return SALARY_COLORS.LOWER.border;
                    }),
                    borderWidth: 1
                },
                {
                    label: 'Tu Salario',
                    data: Array(references.length).fill(userSalary),
                    backgroundColor: SALARY_COLORS.USER.bg,
                    borderColor: SALARY_COLORS.USER.border,
                    borderWidth: 2,
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Salario Mensual ($)' },
                    ticks: { callback: (value) => `$${value.toLocaleString('es-CO')}` }
                },
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return value !== null ? `${label}: $${value.toLocaleString('es-CO')}` : label;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, padding: 20 }
                }
            }
        }
    });
}

const handleSubmit = (event) => {

    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.salary || data.salary <= 0) {
        event.target.reset();
        return alert('El salario debe ser un número positivo');
    }

    loadSalaryData(data.salary);
    event.target.reset();
}
