// ==========================================
// KAMUS BAHASA (DICTIONARY)
// ==========================================
let bahasaSaatIni = 'id'; 

const terjemahan = {
    id: {
        cariLokasi: "Cari lokasi...",
        btnLegenda: "📜 Legenda Peta",
        laporCepat: "<span class='btn-icon'>📢</span><span class='btn-text'>Lapor Cepat</span>",
        laporBatal: "<span class='btn-icon'>✖</span><span class='btn-text'>Batalkan Lapor</span>",
        alertLaporAktif: "Mode Lapor Aktif!\nSilakan klik tepat di lokasi masalah pada peta.",
        alertLaporKonfirm: "Anda akan melaporkan lokasi pada:\nLintang: {lat}\nBujur: {lng}\n\nLanjutkan mengisi formulir laporan?",
        alertTungguGPS: "Mohon tunggu sebentar, sistem sedang mencari titik lokasi GPS Anda...",
        alertTidakKetemu: "Lokasi tidak ditemukan! Pastikan nama tepat.",
        btnDetail: "Detail",
        txtKategori: "Kategori",
        txtOperasional: "Operasional",
        txtInfo: "Info",
        txtKembali: "Kembali",
        txtNavigasi: "Navigasi ke Sini",
        txtChatWA: "💬 Chat Admin",
        txtRuteHitung: "Menghitung rute...",
        txtRuteJarak: "Jarak Tempuh: ",
        labelLokasiAnda: "Lokasi Anda",
        labelJalanPantura: "Jalan Pantura",
        labelJalanDesa: "Jalan Desa",
        labelBatasAdmin: "Batas Administrasi",
        katPusatPemerintahan: "Pusat Pemerintahan",
        katFasilitasIbadah: "Fasilitas Ibadah",
        katFasilitasKesehatan: "Fasilitas Kesehatan",
        katFasilitasPendidikan: "Fasilitas Pendidikan",
        katPelakuUsaha: "Pelaku Usaha",
        katKeamananLingkungan: "Keamanan Lingkungan"
    },
    en: {
        cariLokasi: "Search location...",
        btnLegenda: "📜 Map Legend",
        laporCepat: "<span class='btn-icon'>📢</span><span class='btn-text'>Report Issue</span>",
        laporBatal: "<span class='btn-icon'>✖</span><span class='btn-text'>Cancel Report</span>",
        alertLaporAktif: "Reporting Mode Active!\nPlease click exactly on the issue location on the map.",
        alertLaporKonfirm: "You are about to report a location at:\nLatitude: {lat}\nLongitude: {lng}\n\nContinue to the reporting form?",
        alertTungguGPS: "Please wait, the system is finding your GPS location...",
        alertTidakKetemu: "Location not found! Please check the spelling.",
        btnDetail: "Details",
        txtKategori: "Category",
        txtOperasional: "Opening Hours",
        txtInfo: "Info",
        txtKembali: "Back",
        txtNavigasi: "Navigate Here",
        txtChatWA: "💬 Chat Admin",
        txtRuteHitung: "Calculating route...",
        txtRuteJarak: "Distance: ",
        labelLokasiAnda: "Your Location",
        labelJalanPantura: "Pantura Road",
        labelJalanDesa: "Village Road",
        labelBatasAdmin: "Administrative Boundary",
        katPusatPemerintahan: "Government Center",
        katFasilitasIbadah: "Place of Worship",
        katFasilitasKesehatan: "Health Facility",
        katFasilitasPendidikan: "Education Facility",
        katPelakuUsaha: "Local Business", 
        katKeamananLingkungan: "Neighborhood Security"
    }
};

// ==========================================
// 1. INISIALISASI PETA & BASEMAPS (Layer Control)
// ==========================================
const map = L.map('map', { 
    preferCanvas: true, 
    doubleClickZoom: false,
    zoomSnap: 0.1,        
    zoomDelta: 0.5,       
    wheelPxPerZoomLevel: 100 
}).setView([-6.945, 109.785], 15); 

map.attributionControl.setPrefix('Dibuat sepenuh hati oleh KKN Undip Desa Tulis 2026 ❤️| <a href="https://leafletjs.com">Leaflet</a>');

const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { 
    maxZoom: 20, attribution: 'Google Satellite', keepBuffer: 4, updateWhenZooming: false
}).addTo(map);

const osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 19, attribution: 'OpenStreetMap', keepBuffer: 4, updateWhenZooming: false
});

L.control.layers({ "Citra Satelit": googleSat, "Peta Jalan": osmStreet }, null, { position: 'topleft' }).addTo(map);

let routingControl = null;
let currentLat = null; 
let currentLng = null;
let userMarker = null; 

map.on('dblclick', function() {
    if (routingControl) { map.removeControl(routingControl); routingControl = null; }
    const infoPanel = document.getElementById('route-info');
    if (infoPanel) infoPanel.style.display = 'none'; 
});

// ==========================================
// 2. SET LOKASI SAYA
// ==========================================
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const qrLat = getUrlParameter('lat');
const qrLng = getUrlParameter('lng');
const qrDusun = getUrlParameter('dusun');

if (qrLat && qrLng) {
    currentLat = parseFloat(qrLat);
    currentLng = parseFloat(qrLng);
    let namaLabel = qrDusun ? "Posisi Anda (Tiang Dusun " + qrDusun + ")" : "Posisi Anda (Tiang)";
    
    userMarker = L.circleMarker([currentLat, currentLng], {
        radius: 8, fillColor: "#e67e22", color: "#ffffff", weight: 2, fillOpacity: 1, zIndexOffset: 1000
    }).addTo(map).bindTooltip(namaLabel, { permanent: true, direction: 'right', offset: [5, 0], className: 'label-tempat' });
    map.setView([currentLat, currentLng], 17);
} else {
    function onLocationFound(e) {
        currentLat = e.latlng.lat;
        currentLng = e.latlng.lng;
        if (!userMarker) {
            userMarker = L.circleMarker([currentLat, currentLng], {
                radius: 7, fillColor: "#3498db", color: "#ffffff", weight: 2, fillOpacity: 1, zIndexOffset: 1000
            }).addTo(map).bindTooltip(() => terjemahan[bahasaSaatIni].labelLokasiAnda, { permanent: true, direction: 'right', offset: [5, 0], className: 'label-tempat' });
        } else {
            userMarker.setLatLng(e.latlng);
        }
    }
    function onLocationError(e) { if (e.code !== 3) console.warn("GPS terhambat: " + e.message); }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({ setView: false, watch: true, enableHighAccuracy: false, maximumAge: 10000, timeout: 30000 });
}

// ==========================================
// 3. MASKING & BATAS ADMINISTRASI 
// ==========================================
map.createPane('paneMasking'); map.getPane('paneMasking').style.zIndex = 350;
map.createPane('paneJalanDesa'); map.getPane('paneJalanDesa').style.zIndex = 351;
map.createPane('paneJalanPantura'); map.getPane('paneJalanPantura').style.zIndex = 352;
map.createPane('paneBatasDesa'); map.getPane('paneBatasDesa').style.zIndex = 353;
map.createPane('paneBatasDusun'); map.getPane('paneBatasDusun').style.zIndex = 250; 
map.getPane('paneMasking').style.pointerEvents = 'none';
map.getPane('paneBatasDesa').style.pointerEvents = 'none';

const desaCoords = batasDesaData.features[0].geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
L.polygon([ [[-90, -180], [90, -180], [90, 180], [-90, 180]], desaCoords ], {
    pane: 'paneMasking', stroke: false, fillColor: '#000000', fillOpacity: 0.65     
}).addTo(map);

proj4.defs("EPSG:32749", "+proj=utm +zone=49 +south +datum=WGS84 +units=m +no_defs");
function konversiKoordinat(coords) {
    const converted = proj4("EPSG:32749", "EPSG:4326", coords);
    return L.latLng(converted[1], converted[0]);
}

L.geoJSON(batasDesaData, {
    pane: 'paneBatasDesa', smoothFactor: 2.0,
    style: function(feature) { return { color: "#3cc932", weight: 3, fillOpacity: 0, dashArray: "5, 5" }; }
}).addTo(map);

function getMarkerColor(kategori) {
    switch(kategori) {
        case "Pusat Pemerintahan": return "#585858"; case "Fasilitas Ibadah": return "#cccc34";  
        case "Fasilitas Kesehatan": return "#e74c3c"; case "Fasilitas Pendidikan": return "#2ecc71"; 
        case "Pelaku Usaha": return "#631861"; case "Keamanan Lingkungan": return "#34495e"; default: return "#3498db"; 
    }
}

function buatClusterKategori(kategori) {
    const ukuranPin = 25; 
    const ukuranJangkarX = ukuranPin / 2;     
    const ukuranJangkarY = ukuranPin;         
    const ukuranFont = ukuranPin * 0.45;      

    return L.markerClusterGroup({
        maxClusterRadius: 50, 
        disableClusteringAtZoom: 20,
        zoomToBoundsOnClick: true, 
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        
        iconCreateFunction: function(cluster) {
            const jumlahTitik = cluster.getChildCount();
            const warnaKategori = getMarkerColor(kategori);
            
            return L.divIcon({
                html: `<div style="
                            background-color: color-mix(in srgb, ${warnaKategori} 30%, rgba(255, 255, 255, 0.4)); 
                            backdrop-filter: blur(3px);
                            -webkit-backdrop-filter: blur(3px);
                            width: ${ukuranPin}px; height: ${ukuranPin}px; 
                            border-radius: 50% 50% 50% 0; 
                            transform: rotate(-45deg); 
                            display: flex; justify-content: center; align-items: center; 
                            box-shadow: -2px 2px 6px rgba(0,0,0,0.3);
                            border: 2px solid ${warnaKategori};
                        ">
                            <span style="
                                transform: rotate(45deg); 
                                color: ${warnaKategori}; 
                                font-weight: 900; 
                                font-family: 'Segoe UI', sans-serif; 
                                font-size: ${ukuranFont}px;
                                text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
                            ">
                                ${jumlahTitik}
                            </span>
                       </div>`,
                className: 'custom-cluster-pin-kaca', 
                iconSize: [ukuranPin, ukuranPin],
                iconAnchor: [ukuranJangkarX, ukuranJangkarY] 
            });
        },
        polygonOptions: { fillColor: getMarkerColor(kategori), color: getMarkerColor(kategori), weight: 1.5, opacity: 0.5, fillOpacity: 0.1 }
    });
}

// ==========================================
// 4. GROUPING & FILTERING
// ==========================================
const layerGroups = {
    "Tulis Sari": L.layerGroup().addTo(map),
    "Gondangan": L.layerGroup().addTo(map),
    "Pesawahan": L.layerGroup().addTo(map),
    "Tulis Barat": L.layerGroup().addTo(map),
    "Pusat Pemerintahan": buatClusterKategori("Pusat Pemerintahan").addTo(map),
    "Fasilitas Ibadah": buatClusterKategori("Fasilitas Ibadah").addTo(map),
    "Fasilitas Kesehatan": buatClusterKategori("Fasilitas Kesehatan").addTo(map),
    "Fasilitas Pendidikan": buatClusterKategori("Fasilitas Pendidikan").addTo(map),
    "Pelaku Usaha": buatClusterKategori("Pelaku Usaha").addTo(map),
    "Keamanan Lingkungan": buatClusterKategori("Keamanan Lingkungan").addTo(map),
    "Jalan Desa": L.layerGroup().addTo(map),
    "Jalan Pantura": L.layerGroup().addTo(map)
};

L.geoJSON(jalanDesaData, { pane: 'paneJalanDesa', coordsToLatLng: konversiKoordinat, smoothFactor: 1.5, style: { color: "#d4c6c6", weight: 3, opacity: 0.8 } }).addTo(layerGroups["Jalan Desa"]);
L.geoJSON(jalanPanturaData, { pane: 'paneJalanPantura', coordsToLatLng: konversiKoordinat, smoothFactor: 1.5, style: { color: "#2c12f3", weight: 6, opacity: 0.9 } }).bindTooltip("Jl. PANTURA", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Jalan Pantura"]);

function styleDusun(warnaHex) { return { pane: 'paneBatasDusun', color: warnaHex, weight: 2, fillColor: warnaHex, fillOpacity: 0.35 }; }
L.geoJSON(tulisSariData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#b59b38") }).bindTooltip("Dusun Tulis Sari", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Tulis Sari"]);
L.geoJSON(gondanganData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#825b4a") }).bindTooltip("Dusun Gondangan", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Gondangan"]);
L.geoJSON(pesawahanData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#72659d") }).bindTooltip("Dusun Pesawahan", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Pesawahan"]);
L.geoJSON(tulisBaratData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#32a852") }).bindTooltip("Dusun Tulis Barat", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Tulis Barat"]);

function getCustomIcon(kategori) {
    let emoji = "📍", color = getMarkerColor(kategori);
    switch(kategori) {
        case "Pusat Pemerintahan": emoji = "🏛️"; break; case "Fasilitas Ibadah": emoji = "🕌"; break; 
        case "Fasilitas Kesehatan": emoji = "🏥"; break; case "Fasilitas Pendidikan": emoji = "🎓"; break;
        case "Pelaku Usaha": emoji = "🏪"; break; case "Keamanan Lingkungan": emoji = "🛡️"; break; 
    }
    return L.divIcon({ className: 'custom-div-icon', html: `<div class="custom-marker-wrapper" style="--warna-marker: ${color};"><span class="marker-emoji">${emoji}</span></div>`, iconSize: [0, 0], iconAnchor: [14, 34], popupAnchor: [0, -34], tooltipAnchor: [-2, -10] });
}

let searchData = [];
function getPopupHTML(index) {
    const loc = locations[index];
    const t = terjemahan[bahasaSaatIni];
    const deskripsi = (bahasaSaatIni === 'en' && loc.desc_en) ? loc.desc_en : loc.desc;
    const operasional = (bahasaSaatIni === 'en' && loc.jamOperasional_en) ? loc.jamOperasional_en : loc.jamOperasional;
    const katName = t["kat" + loc.type.replace(/\s+/g, '')] || loc.type;

    let waButtonHTML = '';
    if (loc.whatsapp) {
        let nomorWA = loc.whatsapp.startsWith('0') ? '62' + loc.whatsapp.substring(1) : loc.whatsapp;
        waButtonHTML = `<button type="button" class="wa-btn" onclick="window.open('https://wa.me/${nomorWA}', '_blank'); event.stopPropagation();" style="width:100%; margin-bottom:8px; padding:6px; border-radius:4px; text-align:center;">${t.txtChatWA}</button>`;
    }
    
    let imgThumbnailHTML = '';
    if(loc.imgSatu && loc.imgSatu !== "") {
        imgThumbnailHTML = `<img src="${loc.imgSatu}" alt="Foto ${loc.name}" loading="lazy" decoding="async" style="width:100%; height:130px; object-fit:cover; border-radius:6px; margin-bottom:10px; border:1px solid #bdc3c7;" onerror="this.style.display='none'">`;
    }

    return `
        <div class="popup-content" style="position: relative; min-width: 220px; max-width: 270px; text-align: left; padding-top: 2px;">
            ${imgThumbnailHTML}
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 15px; border: none; padding: 0;">${loc.name}</h3>
            </div>
            <div style="margin-bottom: 4px; font-size: 12px;"><strong>${t.txtKategori}:</strong> ${katName}</div>
            <div style="margin-bottom: 4px; font-size: 12px;"><strong>${t.txtOperasional}:</strong> ${operasional}</div>
            <div style="max-height: 85px; overflow-y: auto; overflow-wrap: break-word; word-wrap: break-word; padding-right: 5px; margin-bottom: 10px; font-size: 12px; line-height: 1.4; background: rgba(0,0,0,0.03); padding: 5px; border-radius: 4px;">
                <strong>${t.txtInfo}:</strong> ${deskripsi}
            </div>
            ${waButtonHTML}
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bdc3c7; padding-top: 8px;">
                <button onclick="window.bukaGaleriFoto(${index}, event)" style="background: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📷 Semua Foto</button>
                <button onclick="window.buatRute(${index}, event)" title="${t.txtNavigasi}" style="background-color: #3498db; color: white; border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                </button>
            </div>
        </div>
    `;
}

locations.forEach((loc, index) => {
    const classKategori = 'label-' + loc.type.toLowerCase().replace(/\s+/g, '-');
    const marker = L.marker([loc.lat, loc.lng], { icon: getCustomIcon(loc.type) })
    .bindTooltip(loc.name, { permanent: true, direction: 'top', offset: [0, -20], className: 'label-tempat ' + classKategori })
    .bindPopup(getPopupHTML(index), { autoPan: false }); 

    if(layerGroups[loc.type]) { marker.addTo(layerGroups[loc.type]); } 
    searchData.push({ name: loc.name.toLowerCase(), marker: marker, lat: loc.lat, lng: loc.lng });
    
    marker.on('popupclose', function() { setTimeout(() => { marker.setPopupContent(getPopupHTML(index)); }, 300); });
    marker.on('click', function(e) {
        const zoomLevel = map.getZoom();
        const markerLatLng = e.target.getLatLng();
        let pointPixel = map.project(markerLatLng, zoomLevel);
        pointPixel.y -= 180; 
        const targetLatLng = map.unproject(pointPixel, zoomLevel);
        map.panTo(targetLatLng, { animate: true, duration: 0.5 });
    });
});

window.buatRute = function(index, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const t = terjemahan[bahasaSaatIni];
    if (!currentLat || !currentLng) { alert(t.alertTungguGPS); return; }

    const loc = locations[index];
    if (routingControl) map.removeControl(routingControl);
    const infoPanel = document.getElementById('route-info');
    if (infoPanel) { infoPanel.innerHTML = t.txtRuteHitung; infoPanel.style.display = 'block'; }

    routingControl = L.Routing.control({
        waypoints: [ L.latLng(currentLat, currentLng), L.latLng(loc.lat, loc.lng) ], 
        router: L.Routing.osrmv1({ language: bahasaSaatIni, profile: 'driving' }),
        addWaypoints: false, 
        routeLine: function(route, options) { return L.Routing.line(route, { addWaypoints: false, extendToWaypoints: true, styles: [{ color: '#0ec733', opacity: 0.9, weight: 8 }] }); },
        createMarker: function() { return null; }, fitSelectedRoutes: true, show: false 
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        const distanceMeters = e.routes[0].summary.totalDistance;
        let distanceString = distanceMeters > 1000 ? (distanceMeters / 1000).toFixed(2) + ' km' : Math.round(distanceMeters) + ' meter';
        if (infoPanel) infoPanel.innerHTML = "<b>" + t.txtRuteJarak + distanceString + "</b>";
    });
};

// ==========================================
// FITUR PENCARIAN & FILTER PANEL
// ==========================================
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchSuggestions = document.getElementById('search-suggestions');

function jalankanPencarian(query) {
    let found = searchData.find(item => item.name.startsWith(query));
    if(found && query !== "") {
        map.flyTo([found.lat, found.lng], 18, { animate: true, duration: 1.5 });
        setTimeout(() => found.marker.openPopup(), 1500);
        searchSuggestions.classList.add('hidden'); 
    } else { alert(terjemahan[bahasaSaatIni].alertTidakKetemu); }
}

searchBtn.addEventListener('click', function() { let query = searchInput.value.toLowerCase().trim(); jalankanPencarian(query); });

let debounceTimer;
searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer); 
    let query = this.value.toLowerCase().trim();
    debounceTimer = setTimeout(() => {
        searchSuggestions.innerHTML = ''; 
        if (query === '') { searchSuggestions.classList.add('hidden'); return; }
        let matches = searchData.filter(item => item.name.startsWith(query));
        if (matches.length > 0) {
            searchSuggestions.classList.remove('hidden');
            matches.forEach(match => {
                let li = document.createElement('li');
                li.textContent = match.name; 
                li.addEventListener('click', function() { searchInput.value = match.name.replace(/\b\w/g, l => l.toUpperCase()); jalankanPencarian(match.name); });
                searchSuggestions.appendChild(li);
            });
        } else { searchSuggestions.classList.add('hidden'); }
    }, 200); 
});

document.addEventListener('click', function(e) { if (!document.getElementById('search-container').contains(e.target)) { searchSuggestions.classList.add('hidden'); } });

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        this.classList.toggle('active');
        if (this.classList.contains('active')) { map.addLayer(layerGroups[category]); } else { map.removeLayer(layerGroups[category]); }
    });
});

const btnToggleAll = document.getElementById('btn-toggle-all');
const allFilterBtns = document.querySelectorAll('.filter-btn');
if (btnToggleAll) {
    btnToggleAll.addEventListener('click', function(e) {
        e.stopPropagation(); 
        const currentState = this.getAttribute('data-state');
        if (currentState === 'hide') {
            allFilterBtns.forEach(btn => {
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active'); 
                    const category = btn.getAttribute('data-category');
                    if (layerGroups[category]) map.removeLayer(layerGroups[category]); 
                }
            });
            this.setAttribute('data-state', 'show'); this.className = 'filter-action-btn btn-semua'; this.innerHTML = 'Tampilkan Semua';
        } else {
            allFilterBtns.forEach(btn => {
                if (!btn.classList.contains('active')) {
                    btn.classList.add('active'); 
                    const category = btn.getAttribute('data-category');
                    if (layerGroups[category]) map.addLayer(layerGroups[category]); 
                }
            });
            this.setAttribute('data-state', 'hide'); this.className = 'filter-action-btn btn-kosong'; this.innerHTML = 'Sembunyikan Semua';
        }
    });
}

const filterToggleBtn = document.getElementById('filter-toggle-btn');
const filterPanel = document.getElementById('filter-panel');
if (filterToggleBtn && filterPanel) { filterToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); filterPanel.classList.toggle('show'); }); }

// ==========================================
// 5. STATUS BAR & LEGENDA MELAYANG
// ==========================================
function toDMS(coordinate, isLat) {
    const abs = Math.abs(coordinate); const deg = Math.floor(abs);
    const minNotTruncated = (abs - deg) * 60; const min = Math.floor(minNotTruncated);
    const sec = ((minNotTruncated - min) * 60).toFixed(2);
    const dir = coordinate >= 0 ? (isLat ? "U" : "T") : (isLat ? "S" : "B");
    return `${deg < 10 ? "0"+deg : deg}°${min < 10 ? "0"+min : min}'${sec < 10 ? "0"+sec : sec}"${dir}`;
}

function updateEyeAltitude() {
    const zoom = map.getZoom(); 
    const altKm = 40000 / Math.pow(2, zoom);
    document.getElementById('eye-alt').textContent = altKm > 1 ? altKm.toFixed(2) + " km" : (altKm * 1000).toFixed(0) + " m";
    const mapEl = document.getElementById('map');
    mapEl.classList.remove('zoom-sedang', 'zoom-jauh'); 
    if (zoom === 16) { mapEl.classList.add('zoom-sedang'); } else if (zoom <= 15) { mapEl.classList.add('zoom-jauh'); }
}

function perbaruiKoordinatBar(latlng) {
    document.getElementById('coord-lat').textContent = toDMS(latlng.lat, true);
    document.getElementById('coord-lng').textContent = toDMS(latlng.lng, false);
}

let isThrottled = false;
map.on('mousemove', function(e) { 
    if (!isThrottled) { requestAnimationFrame(() => { perbaruiKoordinatBar(e.latlng); isThrottled = false; }); isThrottled = true; }
});
map.on('move', function() { perbaruiKoordinatBar(map.getCenter()); });
map.on('zoomend', updateEyeAltitude);
updateEyeAltitude();

window.bukaLegenda = function() {
    const panelAda = document.getElementById('legenda-panel');
    if (panelAda) { panelAda.remove(); return; }
    const t = terjemahan[bahasaSaatIni];
    const cats = [
        { cat: "Pusat Pemerintahan", emoji: "🏛️", color: "#585858" }, { cat: "Fasilitas Ibadah", emoji: "🕌", color: "#cccc34" },
        { cat: "Fasilitas Kesehatan", emoji: "🏥", color: "#e74c3c" }, { cat: "Fasilitas Pendidikan", emoji: "🎓", color: "#2ecc71" },
        { cat: "Pelaku Usaha", emoji: "🏪", color: "#631861" }, { cat: "Keamanan Lingkungan", emoji: "🛡️", color: "#34495e" }
    ];
    let content = `<div id="legenda-panel" class="panel-legenda-melayang" onclick="event.stopPropagation()"><button class="close-legenda-btn" onclick="window.tutupLegenda()">✖</button><h3 class="legenda-title">${t.btnLegenda.replace('📜 ', '')}</h3><div class="legenda-scroll-area">`;
    cats.forEach(item => { let katName = t["kat" + item.cat.replace(/\s+/g, '')] || item.cat; content += `<div class="legenda-item"><div class="legenda-icon" style="background-color: ${item.color};">${item.emoji}</div><span>${katName}</span></div>`; });
    content += `<div class="legenda-item"><div class="legenda-icon-lokasi"></div><span>${t.labelLokasiAnda}</span></div><hr class="legenda-divider"><div class="legenda-item"><i class="garis-pantura"></i> <span>${t.labelJalanPantura}</span></div><div class="legenda-item"><i class="garis-desa"></i> <span>${t.labelJalanDesa}</span></div><div class="legenda-item"><i class="garis-batas"></i> <span>${t.labelBatasAdmin}</span></div><hr class="legenda-divider"><div class="legenda-item"><i class="kotak-dusun" style="background:#b59b38; border-color:#b59b38;"></i> <span>Dusun Tulis Sari</span></div><div class="legenda-item"><i class="kotak-dusun" style="background:#825b4a; border-color:#825b4a;"></i> <span>Dusun Gondangan</span></div><div class="legenda-item"><i class="kotak-dusun" style="background:#72659d; border-color:#72659d;"></i> <span>Dusun Pesawahan</span></div><div class="legenda-item"><i class="kotak-dusun" style="background:#32a852; border-color:#32a852;"></i> <span>Dusun Tulis Barat</span></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', content);
};
window.tutupLegenda = function() { const panel = document.getElementById('legenda-panel'); if(panel) panel.remove(); };

// ==========================================
// 7. FITUR ALAT UKUR PRESISI (LEAFLET-GEOMAN)
// ==========================================
map.eachLayer(function(layer) { layer.options.pmIgnore = true; });
map.pm.addControls({ position: 'topleft', drawMarker: false, drawCircleMarker: false, drawPolyline: true, drawRectangle: false, drawPolygon: true, drawCircle: false, drawText: false, editMode: false, dragMode: false, cutPolygon: false, removalMode: true });
map.pm.setGlobalOptions({ measurements: { measurement: true, displayFormat: 'metric' }, tooltips: true, hintlineStyle: { color: '#e74c3c', dashArray: '5,5' }, templineStyle: { color: '#e74c3c' }, pathOptions: { color: '#3498db', fillColor: '#3498db', fillOpacity: 0.4 } });
map.on('pm:create', function(e) {
    var layer = e.layer; layer.options.pmIgnore = false; 
    var hasilUkuran = ""; if (layer.getTooltip && layer.getTooltip()) { hasilUkuran = layer.getTooltip().getContent(); }

    if (e.shape === 'Line' && (!hasilUkuran || hasilUkuran === "")) {
        var latlngs = layer.getLatLngs(), distance = 0;
        for (var i = 0; i < latlngs.length - 1; i++) { distance += latlngs[i].distanceTo(latlngs[i + 1]); }
        var distanceMeter = Math.round(distance).toLocaleString('id-ID');
        if (distance >= 1000) { hasilUkuran = (distance / 1000).toFixed(2) + " km<br><span style='font-size:12px; font-weight:normal;'>(" + distanceMeter + " meter)</span>"; } else { hasilUkuran = distanceMeter + " meter"; }
    }

    if (e.shape === 'Polygon' && (!hasilUkuran || hasilUkuran === "")) {
        var latlngs = layer.getLatLngs()[0], area = 0, d2r = Math.PI / 180, R = 6378137; 
        if (latlngs.length > 2) {
            for (var i = 0; i < latlngs.length; i++) { var p1 = latlngs[i], p2 = latlngs[(i + 1) % latlngs.length]; area += ((p2.lng - p1.lng) * d2r) * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r)); }
            area = Math.abs(area * R * R / 2.0);
        }
        var areaMeter = Math.round(area).toLocaleString('id-ID');
        if (area >= 10000) { hasilUkuran = (area / 10000).toFixed(2) + " ha<br><span style='font-size:12px; font-weight:normal;'>(" + areaMeter + " meter persegi)</span>"; } else { hasilUkuran = areaMeter + " meter persegi"; }
    }
    if (hasilUkuran) { layer.bindPopup("<div style='font-size:14px; text-align:center; padding:5px;'><span style='color:#7f8c8d; font-size:12px; display:block; margin-bottom:3px;'>Hasil Ukuran:</span><b>" + hasilUkuran + "</b></div>").openPopup(); } else { layer.bindPopup("<b>Area berhasil dipetakan.</b>").openPopup(); }
});

// ==========================================
// 8. GALERI FOTO & LAPOR WARGA (FAB)
// ==========================================
window.bukaGaleriFoto = function(index, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const loc = locations[index]; const kumpulanFoto = [loc.imgSatu, loc.imgDua, loc.imgTiga]; 
    let modalHTML = `<div id="galeri-overlay" class="galeri-overlay"><div class="galeri-modal"><button class="close-galeri" onclick="window.tutupGaleriFoto()">✖</button><h3 class="galeri-title">${loc.name}</h3><div class="slider-wrapper" style="position: relative;"><button class="nav-btn prev-btn" onclick="window.geserGaleri(-1)">&#10094;</button><div class="galeri-slider" id="galeri-slider">`;
    kumpulanFoto.forEach((foto, i) => { if (foto && foto !== "") { modalHTML += `<div class="foto-container"><div class="loading-spinner"></div><img src="${foto}" alt="Foto ${i+1}" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.src='https://via.placeholder.com/400x250?text=Foto+Tidak+Tersedia'; this.classList.add('loaded');"></div>`; } });
    modalHTML += `</div><button class="nav-btn next-btn" onclick="window.geserGaleri(1)">&#10095;</button></div><p class="galeri-hint">PICTURE BY TIM KKN UNDIP TULIS 2026</p></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};
window.geserGaleri = function(arah) { const slider = document.getElementById('galeri-slider'); if(slider) { slider.scrollBy({ left: arah * slider.clientWidth, behavior: 'smooth' }); } };
window.tutupGaleriFoto = function() { const overlay = document.getElementById('galeri-overlay'); if (overlay) { overlay.remove(); } };

let isReportingMode = false;
window.toggleLapor = function() {
    isReportingMode = !isReportingMode; 
    const btn = document.getElementById('btn-lapor-html');
    const t = terjemahan[bahasaSaatIni];

    if (isReportingMode) {
        btn.innerHTML = t.laporBatal; btn.classList.add('active'); document.getElementById('map').classList.add('reporting-mode'); alert(t.alertLaporAktif); 
    } else {
        btn.innerHTML = `<span class='btn-icon'>📢</span><span class='btn-text'>Lapor Cepat</span>`; btn.classList.remove('active'); document.getElementById('map').classList.remove('reporting-mode');
    }
};

map.on('click', function(e) {
    if (isReportingMode) {
        const lat = e.latlng.lat.toFixed(6), lng = e.latlng.lng.toFixed(6);
        let popupLaporHTML = `<div style="text-align: center; min-width: 200px; padding: 5px;"><h4 style="margin: 0 0 10px 0; color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; font-size: 14px;">Tujuan Laporan</h4><p style="font-size: 11px; color: #7f8c8d; margin-bottom: 12px; font-weight: bold;">Lokasi: ${lat}, ${lng}</p><button onclick="window.prosesKirimLaporan('keamanan', ${lat}, ${lng})" style="width: 100%; margin-bottom: 6px; padding: 8px; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🚨 Laporan Keamanan</button><button onclick="window.prosesKirimLaporan('kesehatan', ${lat}, ${lng})" style="width: 100%; margin-bottom: 6px; padding: 8px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏥 Laporan Medis</button><button onclick="window.prosesKirimLaporan('infrastruktur', ${lat}, ${lng})" style="width: 100%; margin-bottom: 6px; padding: 8px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏗️ Laporan Fasilitas Desa</button></div>`;
        L.popup({ closeOnClick: false, autoClose: false }).setLatLng(e.latlng).setContent(popupLaporHTML).openOn(map);
        isReportingMode = false;
        const btn = document.getElementById('btn-lapor-html');
        btn.innerHTML = `<span class='btn-icon'>📢</span><span class='btn-text'>Lapor Cepat</span>`; btn.classList.remove('active'); document.getElementById('map').classList.remove('reporting-mode');
    }
});

window.prosesKirimLaporan = function(kategori, lat, lng) {
    map.closePopup(); 
    let urlTujuan = '', templateGmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    if (kategori === 'keamanan') {
        urlTujuan = `https://wa.me/62895392011414?text=${encodeURIComponent(`*LAPORAN DARURAT KEAMANAN (PANIC BUTTON)*\n\nMohon bantuan segera, ada indikasi gangguan keamanan/kejahatan di titik ini:\n${templateGmaps}\n\nPengirim: Warga Desa Tulis`)}`;
        window.open(urlTujuan, '_blank');
    } else if (kategori === 'kesehatan') {
        urlTujuan = `https://wa.me/6289876543210?text=${encodeURIComponent(`*LAPORAN DARURAT MEDIS*\n\nMohon bantuan medis segera di titik lokasi ini:\n${templateGmaps}\n\nPengirim: Warga Desa Tulis`)}`;
        window.open(urlTujuan, '_blank');
    } else if (kategori === 'infrastruktur') {
        window.open(`https://docs.google.com/forms/d/e/1FAIpQLScA-jsmUPdBB_sa-eftZU5gCZWxMR3q5FDGNQOsRLA1MT_kuw/viewform?entry.1856517992=${lat}&entry.1981551024=${lng}`, '_blank');
    }
};

// ==========================================
// 9. TOGGLE BAHASA, LABEL & MODAL TENTANG
// ==========================================
window.toggleBahasa = function() {
    bahasaSaatIni = bahasaSaatIni === 'id' ? 'en' : 'id'; const t = terjemahan[bahasaSaatIni];
    const searchInput = document.getElementById('search-input'); if(searchInput) searchInput.placeholder = t.cariLokasi;
    
    const laporBtn = document.getElementById('btn-lapor-html'); 
    if(laporBtn) { 
        if(isReportingMode){ laporBtn.innerHTML = t.laporBatal; } 
        else { laporBtn.innerHTML = bahasaSaatIni === 'id' ? `<span class='btn-icon'>📢</span><span class='btn-text'>Lapor Cepat</span>` : `<span class='btn-icon'>📢</span><span class='btn-text'>Report Issue</span>`; }
    }
    
    map.closePopup();
    if (userMarker) { userMarker.setTooltipContent(t.labelLokasiAnda); }
    
    document.getElementById('btn-bahasa').innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🌐</span><span class='btn-text'>Ganti Bahasa</span>" : "<span class='btn-icon'>🌐</span><span class='btn-text'>Change Language</span>";
    document.getElementById('btn-legenda').innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>📜</span><span class='btn-text'>Legenda Peta</span>" : "<span class='btn-icon'>📜</span><span class='btn-text'>Map Legend</span>";
    
    const btnLabel = document.getElementById('btn-toggle-label');
    if (btnLabel) {
        if (isLabelTampil) { btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Sembunyi Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Hide Labels</span>"; } 
        else { btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Tampil Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Show Labels</span>"; }
    }
};

let isLabelTampil = false; 
document.getElementById('map').classList.add('hide-labels');
window.toggleLabel = function() {
    const mapEl = document.getElementById('map'); const btnLabel = document.getElementById('btn-toggle-label');
    isLabelTampil = !isLabelTampil; 
    if (isLabelTampil) { mapEl.classList.remove('hide-labels'); btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Sembunyi Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Hide Labels</span>"; btnLabel.style.background = '#e74c3c'; } 
    else { mapEl.classList.add('hide-labels'); btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Tampil Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Show Labels</span>"; btnLabel.style.background = '#8e44ad'; }
};

if (getUrlParameter('mode') === 'lapor') { setTimeout(function() { const btnLapor = document.getElementById('btn-lapor-html'); if (btnLapor && !isReportingMode) { btnLapor.click(); } }, 1000); }

window.bukaTentang = function() {
    const content = `
        <div id="tentang-overlay" class="galeri-overlay" onclick="window.tutupTentang()">
            <div style="background: rgba(30, 40, 50, 0.95); backdrop-filter: blur(5px); border: 2px solid #3498db; padding: 25px 20px; border-radius: 16px; width: calc(100% - 40px); max-width: 520px; box-sizing: border-box; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5); font-family: 'Segoe UI', Tahoma, sans-serif; cursor: default;" onclick="event.stopPropagation()">
                <button onclick="window.tutupTentang()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; color: #e74c3c; cursor: pointer; transition: transform 0.2s; padding: 5px; line-height: 1;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">✖</button>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">Tentang WebGIS</h3>
                    <div style="height: 3px; width: 40px; background: #3498db; margin: 10px auto 0; border-radius: 2px;"></div>
                </div>
                <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; text-align: justify; max-height: 60vh; overflow-y: auto; padding-right: 8px;">
                    <p style="margin-top: 0;"><strong>WebGIS Desa Tulis</strong> adalah platform sistem informasi geografis interaktif yang dikembangkan untuk memetakan potensi, tata guna lahan, fasilitas umum, dan infrastruktur di wilayah Desa Tulis, Kabupaten Batang.</p>
                    <p>Website ini diinisiasi dan dibangun sepenuhnya oleh <strong style="color: #ffffff;">Tim KKN Universitas Diponegoro Tahun 2026</strong> sebagai bentuk pengabdian masyarakat dan digitalisasi informasi desa guna membantu perangkat desa serta warga setempat.</p>
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;">
                        <strong style="color: #ffffff; font-size: 13.5px; display: block; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 6px;">✨ Fitur Utama:</strong>
                        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
                            <li style="margin-bottom: 5px;">Pemetaan Fasilitas (Pendidikan, Kesehatan, Ibadah, dll)</li>
                            <li style="margin-bottom: 5px;">Peta Interaktif Jaringan Jalan dan Batas Dusun</li>
                            <li style="margin-bottom: 5px;">Fitur Lapor Warga (Crowdsourcing)</li>
                            <li>Sistem Navigasi dan Deteksi Lokasi</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin-top: 25px; font-weight: 500; color: #94a3b8; font-size: 11px; letter-spacing: 0.5px;">
                        Dibuat dengan <span style="color: #e74c3c;">❤️</span> oleh KKN Undip 2026
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', content);
};
window.tutupTentang = function() { const ov = document.getElementById('tentang-overlay'); if(ov) ov.remove(); };

// ==========================================
// 10. LOGIKA HAMBURGER MENU KANAN
// ==========================================
window.toggleMenuKanan = function(e) {
    if(e) e.stopPropagation();
    const wadah = document.getElementById('wadah-menu-kanan');
    wadah.classList.toggle('tampil');
};

document.addEventListener('click', function(e) {
    const wadah = document.getElementById('wadah-menu-kanan');
    const btnHam = document.getElementById('btn-hamburger');
    const filterPanel = document.getElementById('filter-panel');
    if (filterPanel && filterPanel.contains(e.target)) return; 
    if (wadah && wadah.classList.contains('tampil') && !wadah.contains(e.target) && !btnHam.contains(e.target)) {
        wadah.classList.remove('tampil');
        if (filterPanel && filterPanel.classList.contains('show')) filterPanel.classList.remove('show');
    }
});