const calcForm = document.getElementById('calc-form');
const resultadosArea = document.getElementById('resultados-area');
const filtroServicio = document.getElementById('filtro-servicio');
const filtroProducto = document.getElementById('filtro-producto');
const tablaBody = document.getElementById('tabla-body');

function calcularRango(gramos) {
    const inferior = Math.floor((gramos - 1) / 500) * 500 + 1;
    const superior = Math.ceil(gramos / 500) * 500;
    return `De ${inferior} a ${superior} Grs.`;
}

function actualizarTabla() {
    const peso = parseInt(document.getElementById('peso').value);
    const servicioSelected = filtroServicio.value;
    const productoSelected = filtroProducto.value;
    const rango = calcularRango(peso);

    // Lógica de precios simulada basada en imágenes
    const basePrice = (Math.ceil(peso / 500) * 22);

    // Datos base para filtrar
    const todasLasOpciones = [
        { servicio: 'SERVICIO ECONOMICO INT.', producto: productoSelected, certificado: 'CERTIFICADO', clase: 'ECONOMICO', destino: 'EEUU', importe: basePrice.toFixed(2) },
        { servicio: 'SERVICIO ECONOMICO INT.', producto: productoSelected, certificado: 'NO CERTIFICADO', clase: 'PRIORITARIO', destino: 'EEUU', importe: (basePrice + 10).toFixed(2) },
        { servicio: 'SERVICIO EXPRESO INT.', producto: productoSelected, certificado: 'CERTIFICADO', clase: 'EMS', destino: 'EEUU', importe: (basePrice + 30).toFixed(2) }
    ];

    // Filtrar solo por el servicio seleccionado
    const filtrados = todasLasOpciones.filter(item => item.servicio === servicioSelected);

    tablaBody.innerHTML = '';
    filtrados.forEach(item => {
        tablaBody.innerHTML += `
                    <tr class="hover:bg-gray-50">
                        <td class="p-4 font-medium">${item.servicio}</td>
                        <td class="p-4">${item.producto}</td>
                        <td class="p-4">${item.certificado}</td>
                        <td class="p-4">${item.clase}</td>
                        <td class="p-4">${item.destino}</td>
                        <td class="p-4 font-bold text-blue-600">${item.importe}</td>
                        <td class="p-4 text-gray-500">${rango}</td>
                    </tr>
                `;
    });

    document.getElementById('wa-link').href = `https://wa.me/TUNUMERO?text=Hola! Quiero enviar un producto de tipo ${productoSelected} (${peso}g) vía ${servicioSelected}.`;
}

calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resultadosArea.classList.remove('hidden');
    actualizarTabla();
});

filtroServicio.addEventListener('change', actualizarTabla);
filtroProducto.addEventListener('change', actualizarTabla);
