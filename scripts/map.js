// 1. CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://jfuuqpeppxbzfuiklrxn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IheXSOF9ifIwB5vp2y1G1A_RgRhvEAh'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. CONFIGURACIÓN DE ICONOS PROFESIONALES
function crearIcono(tipo) {
    if (tipo === 'camara') {
        return L.ExtraMarkers.icon({
            icon: 'fa-video',
            markerColor: 'red',
            shape: 'circle',
            prefix: 'fa'
        });
    } else {
        return L.ExtraMarkers.icon({
            icon: 'fa-trowel-bricks',
            markerColor: 'blue',
            shape: 'square',
            prefix: 'fa'
        });
    }
}

// 3. INICIALIZACIÓN DEL MAPA
// Las coordenadas [25.539, -103.524] son el centro de Ciudad Lerdo
const map = L.map('mapa-editor').setView([25.539, -103.524], 14); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);
// 4. FUNCIÓN PARA CARGAR PUNTOS (Incluye botón de borrar)
async function cargarMarcadores() {
    const { data, error } = await _supabase.from('marcadores').select('*');

    if (error) {
        console.error('Error al cargar:', error);
    } else {
        data.forEach(punto => {
            L.marker([punto.lat, punto.lng], { icon: crearIcono(punto.tipo) })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align:center;">
                        <b>${punto.nombre}</b><br>
                        <small>Tipo: ${punto.tipo}</small><br><br>
                        <button onclick="eliminarMarcador(${punto.id})" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                            <i class="fa fa-trash"></i> Eliminar
                        </button>
                    </div>
                `);
        });
    }
}

cargarMarcadores();

// 5. EVENTO DE CLIC PARA GUARDAR
map.on('click', async function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    const nombre = prompt("Nombre del marcador:");
    const tipoInput = prompt("Tipo (escribe: camara o proyecto):");

    if (nombre && tipoInput) {
        const tipo = tipoInput.toLowerCase();
        
        const { data, error } = await _supabase
            .from('marcadores')
            .insert([{ lat: lat, lng: lng, nombre: nombre, tipo: tipo }])
            .select(); // El .select() es para obtener el ID que Supabase le acaba de dar

        if (error) {
            alert("Error al guardar: " + error.message);
        } else {
            // Si se guarda, recargamos para que el botón de borrar tenga su ID correcto
            location.reload(); 
        }
    }
});

// 6. FUNCIÓN GLOBAL PARA ELIMINAR (Debe ser window para que el HTML la vea)
window.eliminarMarcador = async function(id) {
    const confirmar = confirm("¿Estás seguro de que quieres borrar este marcador?");
    
    if (confirmar) {
        const { error } = await _supabase
            .from('marcadores')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error al borrar: " + error.message);
        } else {
            alert("Marcador eliminado.");
            location.reload();
        }
    }
};