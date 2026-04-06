// Crear el mapa y establecer la vista inicial
var mapa = L.map('contenedor_del_mapa').setView([-34.58, -58.83], 11);

// Añadir un mapa base

// var capaBaseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {minZoom: 0,	maxZoom: 20, attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', ext: 'png'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {minZoom: 1, maxZoom: 16, attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', ext: 'jpg'}).addTo(mapa);
// var capaBaseOSM = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ', maxZoom: 16 }).addTo(mapa);
var capaBaseOSM = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 20}).addTo(mapa);


// Inicializar control de capas
var capasBase = {
    "OpenStreetMap": capaBaseOSM
};

var controlCapas = L.control.layers({}, {}).addTo(mapa).setPosition("bottomleft");

// Crear un encabezado para la lista de capas
var layersContainer = controlCapas.getContainer();
var customHeading = L.DomUtil.create('h3', 'custom-heading', layersContainer);
customHeading.innerHTML = 'Capas ICA<br>Estacionales'; // Título del encabezado

// Objeto para almacenar las capas de puntos
let geoJsonLayers = {};

// Función para determinar el color según el campo "Calidad" del archivo GeoJSON
function getColor(escala) {
    switch (escala) {
        case "Muy Mala": return "red";
        case "Mala": return "orange";
        case "Media": return "yellow";
        case "Buena": return "green";
        case "Excelente": return "blue";
        case "Sin Datos": return "gray";
        default: return "white";
    }
}

// Función para convertir valores con comas a números flotantes
function parseValue(value) {
    if (typeof value === 'string' && value.includes(',')) {
        return parseFloat(value.replace(',', '.'));
    }
    return value;
}

// Función para cargar y configurar GeoJSON
// definirCapaGeoJSON("./data/ICA_Anual2024.geojson", "ICA Anual");
definirCapaGeoJSON("./data/ICA_Verano2025.geojson", "ICA Verano");
definirCapaGeoJSON("./data/ICA_Otonio2025.geojson", "ICA Otoño");
// definirCapaGeoJSON("./data/ICA_Invierno2024.geojson", "ICA Invierno");
// definirCapaGeoJSON("./data/ICA_Primavera2024.geojson", "ICA Primavera");

function definirCapaGeoJSON(ruta, nombreCapa) {
    fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo GeoJSON ${nombreCapa}`);
            }
            return response.json();
        })
        .then(data => {
            const geoJsonLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    const color = getColor(feature.properties.Calidad);
                    return L.circleMarker(latlng, {
                        radius: 8,
                        color: "black",
                        weight: 1.5,
                        fillColor: color,
                        fillOpacity: 0.8
                    }).bindTooltip(feature.properties.Nombre || "Sin nombre", {
                        permanent: false, // La etiqueta no es permanente
                        direction: "top",
                        offset: [10, -10],
                        className: "custom-tooltip"
                    });
                },
                onEachFeature: function (feature, layer) {
                    // Guardar la capa en el diccionario usando una propiedad única
                    if (feature.properties.Nombre) {
                        geoJsonLayers[feature.properties.Nombre] = layer;
                    }

                    // Manejar eventos de clic en cada punto
                    layer.on("click", function () {
                        const props = feature.properties;

                        // Mostrar la barra lateral
                        let contenido = `<h2>${nombreCapa}<br>Muestreo</h2>`;
                        for (let key in props) {
                            const value = props[key] === "Sin Datos" ? "No disponible" : parseValue(props[key]);
                            contenido += `<p><strong>${key}:</strong> ${value}</p>`;
                        }
                        sidebar.setContent(contenido);
                        sidebar.show();

                        // Mostrar un popup
                        const popupContent = `
                            <h2 style="color: white;">${props.Nombre || "Sin nombre"}</h2><hr/>
                            <h3>ICA: ${props.ICA || "Sin Datos"}<br>
                            Calidad: ${props.Calidad || "Sin Datos"}</h3>
                        `;
                        layer.bindPopup(popupContent).openPopup();
                    });
                }
            });

            // Añadir la capa al mapa para que aparezca por defecto
            if (nombreCapa === "ICA Verano") {
                geoJsonLayer.addTo(mapa);
            }

            // Añadir la capa al control de capas
            capasBase[nombreCapa] = geoJsonLayer;
            controlCapas.addBaseLayer(geoJsonLayer, nombreCapa);
        })
        .catch(error => console.error(`Error al cargar el archivo GeoJSON ${nombreCapa}:`, error));
}

// Actualizar el evento del selector
document.getElementById('select-location').addEventListener('change', function (e) {
    const nombreSeleccionado = e.target.value; // Obtener el valor que coincide con "Nombre" en el GeoJSON

    // Buscar el punto correspondiente en las capas del GeoJSON
    let puntoEncontrado = null;
    mapa.eachLayer(layer => {
        if (layer.feature && layer.feature.properties.Nombre === nombreSeleccionado) {
            puntoEncontrado = layer; // Guardar la capa correspondiente
        }
    });

    if (puntoEncontrado) {
        const coords = puntoEncontrado.getLatLng(); // Obtener las coordenadas del punto
        mapa.flyTo(coords, 13); // Volar al punto
        puntoEncontrado.openTooltip(); // Mostrar la etiqueta
        puntoEncontrado.fire("click"); // Simular clic para mostrar información en la barra lateral
    } else {
        console.warn(`No se encontró un punto con el nombre: ${nombreSeleccionado}`);
    }
});

// Agregar el complemento leaflet.sidebar
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
}).addTo(mapa);

// Agregar un botón personalizado para cerrar la barra lateral
var botonCerrarSidebar = L.control({ position: 'topleft' });

botonCerrarSidebar.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    div.innerHTML = '❌'; // Ícono de cerrar (se puede personalizar con un SVG o texto)
    div.style.backgroundColor = 'white';
    div.style.width = '30px';
    div.style.height = '30px';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.cursor = 'pointer';
    div.title = 'Cerrar barra lateral';

    // Evento de clic para cerrar la barra lateral
    div.onclick = function () {
        sidebar.hide();
    };

    return div;
};

// Añadir el control personalizado al mapa
botonCerrarSidebar.addTo(mapa);

// Agregar minimapa
var minimap = new L.Control.MiniMap(
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 19
    }),
    {
        toggleDisplay: true
    }
).addTo(mapa).setPosition("topright");

// Agregar escala
new L.control.scale({ imperial: false }).addTo(mapa);

// Seleccionar el cuadro de texto del HTML
var layerInfoText = document.getElementById('current-layer');

// Inicializar con el nombre de la capa inicial
layerInfoText.textContent = "ICA Verano";

// Detectar cambios en las capas base seleccionadas
mapa.on('baselayerchange', function (e) {
    // Actualizar el texto del cuadro según el nombre de la capa seleccionada
    layerInfoText.textContent = e.name;
});

// Agregar cuadro de referencias
var leyenda = L.control({ position: 'bottomright' });
leyenda.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
        <h4>Calidad</h4>
        <i style="background: red"></i> Muy Mala<br>
        <i style="background: orange"></i> Mala<br>
        <i style="background: yellow"></i> Media<br>
        <i style="background: green"></i> Buena<br>
        <i style="background: blue"></i> Excelente<br>
        <i style="background: gray"></i> Sin Datos<br>
    `;
    return div;
};
leyenda.addTo(mapa);
