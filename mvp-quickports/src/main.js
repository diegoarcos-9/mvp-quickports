// Importamos el cliente de supabase que ya configuraste
import { supabase } from './supabaseClient';

const calcForm = document.getElementById('calc-form');
const resultadosArea = document.getElementById('resultados-area');
const filtroServicio = document.getElementById('filtro-servicio');
const filtroProducto = document.getElementById('filtro-producto');
const tablaBody = document.getElementById('tabla-body');

// Mantenemos tu lógica de rango visual para el texto de la tabla
function calcularRango(gramos) {
    const inferior = Math.floor((gramos - 1) / 500) * 500 + 1;
    const superior = Math.ceil(gramos / 500) * 500;
    return `De ${inferior} a ${superior} Grs.`;
}

// Convertimos la función a ASYNC para poder usar await con Supabase
async function actualizarTabla() {
    const peso = parseInt(document.getElementById('peso').value);
    const servicioSelected = filtroServicio.value;
    const productoSelected = filtroProducto.value;
    const destinoSelected = document.getElementById('destino').value; // Asumiendo que el id es 'destino'

    if (!peso) return; // Evita errores si el campo está vacío

    // --- NUEVO: GUARDAR EN HISTORIAL ---
    console.log("💾 Guardando consulta en historial...");
    const { error: historyError } = await supabase
        .from('historial_consultas')
        .insert([
            {
                created_at: new Date().toISOString(),
                servicio: servicioSelected,
                producto: productoSelected,
                destino: destinoSelected,
                peso: peso
            }
        ]);

    if (historyError) {
        console.error("❌ Error guardando historial:", historyError);
    } else {
        console.log("✅ Historial guardado correctamente");
    }
    // -----------------------------------

    // 0. DEBUG: Ver qué estamos enviando
    console.log("--- Consultando Supabase ---");
    console.log("Servicio:", servicioSelected);
    console.log("Producto:", productoSelected);
    console.log("Destino:", destinoSelected);
    console.log("Peso:", peso);
    console.log("Tabla: tarifas");

    // 1. CONSULTA A SUPABASE
    // Buscamos en la tabla donde el peso esté dentro del rango min y max
    const { data, error } = await supabase
        .from('TABLA_TARIFAS') // Actualizado según el error de Supabase
        .select('*')
        .eq('tipo_servicio', servicioSelected)
        .eq('producto', productoSelected)
        .eq('destino', destinoSelected)
        .lte('peso_min', peso)
        .gte('peso_max', peso);

    if (error) {
        console.error("❌ Error de Supabase:", error);
        tablaBody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-red-500">Error: ${error.message}</td></tr>`;
        return;
    }

    console.log("✅ Datos recibidos:", data);

    // 2. RENDERIZAR LA TABLA CON DATOS REALES
    tablaBody.innerHTML = '';

    if (data && data.length > 0) {
        data.forEach(item => {
            // Usamos los nombres de columna que configuramos en Supabase
            tablaBody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="p-4 font-medium">${item.tipo_servicio}</td>
                    <td class="p-4">${item.producto}</td>
                    <td class="p-4">${item.tipo_certificado}</td>
                    <td class="p-4">${item.clase || '-'}</td>
                    <td class="p-4">${item.destino}</td>
                    <td class="p-4 font-bold text-blue-600">S/ ${parseFloat(item.importe).toFixed(2)}</td>
                    <td class="p-4 text-gray-500">De ${item.peso_min} a ${item.peso_max} Grs.</td>
                </tr>
            `;
        });

        // 3. ACTUALIZAR WHATSAPP (Tomamos el importe del primer resultado)
        const precioEncontrado = data[0].importe;
        document.getElementById('wa-link').href = `https://wa.me/TUNUMERO?text=Hola! Quiero enviar un producto de tipo ${productoSelected} (${peso}g) vía ${servicioSelected}. El precio cotizado es S/ ${precioEncontrado}.`;

    } else {
        tablaBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-orange-500 font-bold">No se encontraron tarifas para este peso o producto en la base de datos.</td></tr>';
    }
}

// EVENTOS
calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resultadosArea.classList.remove('hidden');
    actualizarTabla();
});

// Los filtros ahora también disparan la consulta a la BD
filtroServicio.addEventListener('change', actualizarTabla);
filtroProducto.addEventListener('change', actualizarTabla);





// DEBUG: Ejecutar al inicio para ver qué columnas y datos tiene realmente la tabla
async function debugTipos() {
    console.log("🔍 DEBUG: Trayendo 1 fila de ejemplo de TABLA_TARIFAS...");
    const { data, error } = await supabase
        .from('TABLA_TARIFAS')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ DEBUG Error:", error);
    } else {
        console.log("✅ DEBUG: Fila de ejemplo (Revisa las COLUMNAS y DATOS):", data);
    }
}
debugTipos();
