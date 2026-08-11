// ==========================================
// KAMUS BAHASA (DICTIONARY)
// ==========================================
let bahasaSaatIni = 'id'; 

const terjemahan = {
    id: {
        cariLokasi: "Cari lokasi...",
        btnLegenda: "📜 Legenda",
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
        btnLegenda: "📜 Legend",
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
// 2. SET LOKASI SAYA (BERDASARKAN QR CODE / URL PARAMETER)
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

    const grupCluster = L.markerClusterGroup({
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
        
        polygonOptions: {
            fillColor: getMarkerColor(kategori),
            color: getMarkerColor(kategori),
            weight: 1.5,
            opacity: 0.5,
            fillOpacity: 0.1
        }
    });

    return grupCluster;
}

// ==========================================
// 4. GROUPING, FILTERING & MARKER CLUSTER
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

L.geoJSON(jalanDesaData, { 
    pane: 'paneJalanDesa', coordsToLatLng: konversiKoordinat, smoothFactor: 1.5, style: { color: "#d4c6c6", weight: 3, opacity: 0.8 } 
}).addTo(layerGroups["Jalan Desa"]);

L.geoJSON(jalanPanturaData, { 
    pane: 'paneJalanPantura', coordsToLatLng: konversiKoordinat, smoothFactor: 1.5, style: { color: "#2c12f3", weight: 6, opacity: 0.9 } 
}).bindTooltip("Jl. PANTURA", { sticky: true, className: 'label-tempat' }).addTo(layerGroups["Jalan Pantura"]);

function styleDusun(warnaHex) {
    return {
        pane: 'paneBatasDusun', 
        color: warnaHex,        
        weight: 2,              
        fillColor: warnaHex,    
        fillOpacity: 0.35       
    };
}

L.geoJSON(tulisSariData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#b59b38") })
  .bindTooltip("Dusun Tulis Sari", { sticky: true, className: 'label-tempat' })
  .addTo(layerGroups["Tulis Sari"]);

L.geoJSON(gondanganData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#825b4a") })
  .bindTooltip("Dusun Gondangan", { sticky: true, className: 'label-tempat' })
  .addTo(layerGroups["Gondangan"]);

L.geoJSON(pesawahanData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#72659d") })
  .bindTooltip("Dusun Pesawahan", { sticky: true, className: 'label-tempat' })
  .addTo(layerGroups["Pesawahan"]);

L.geoJSON(tulisBaratData, { coordsToLatLng: konversiKoordinat, style: styleDusun("#32a852") })
  .bindTooltip("Dusun Tulis Barat", { sticky: true, className: 'label-tempat' })
  .addTo(layerGroups["Tulis Barat"]);

function getCustomIcon(kategori) {
    let emoji = "📍";
    let color = getMarkerColor(kategori);

    switch(kategori) {
        case "Pusat Pemerintahan": emoji = "🏛️"; break;
        case "Fasilitas Ibadah": emoji = "🕌"; break; 
        case "Fasilitas Kesehatan": emoji = "🏥"; break;
        case "Fasilitas Pendidikan": emoji = "🎓"; break;
        case "Pelaku Usaha": emoji = "🏪"; break; 
        case "Keamanan Lingkungan": emoji = "🛡️"; break; 
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-marker-wrapper" style="--warna-marker: ${color};"><span class="marker-emoji">${emoji}</span></div>`,
        iconSize: [0, 0], 
        iconAnchor: [14, 34], 
        popupAnchor: [0, -34], 
        tooltipAnchor: [-2, -10] 
    });
}

let searchData = [];

// 1. BUAT POPUP LENGKAP DENGAN LAZY LOADING
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
    
    // TAMBAHAN: loading="lazy" decoding="async"
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

// 2. EKSEKUSI PEMBUATAN TITIK DI PETA
locations.forEach((loc, index) => {
    const classKategori = 'label-' + loc.type.toLowerCase().replace(/\s+/g, '-');
    
    const marker = L.marker([loc.lat, loc.lng], {
        icon: getCustomIcon(loc.type)
    })
    .bindTooltip(loc.name, { 
        permanent: true, 
        direction: 'top',             
        offset: [0, -20],             
        className: 'label-tempat ' + classKategori 
    })
    .bindPopup(getPopupHTML(index), { autoPan: false }); 

    if(layerGroups[loc.type]) { marker.addTo(layerGroups[loc.type]); } 
    searchData.push({ name: loc.name.toLowerCase(), marker: marker, lat: loc.lat, lng: loc.lng });
    
    marker.on('popupclose', function() {
        setTimeout(() => { marker.setPopupContent(getPopupHTML(index)); }, 300);
    });

    marker.on('click', function(e) {
        const zoomLevel = map.getZoom();
        const markerLatLng = e.target.getLatLng();
        
        let pointPixel = map.project(markerLatLng, zoomLevel);
        pointPixel.y -= 180; 
        
        const targetLatLng = map.unproject(pointPixel, zoomLevel);
        
        map.panTo(targetLatLng, {
            animate: true,
            duration: 0.5
        });
    });
});

window.buatRute = function(index, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const t = terjemahan[bahasaSaatIni];

    if (!currentLat || !currentLng) {
        alert(t.alertTungguGPS);
        return; 
    }

    const loc = locations[index];
    if (routingControl) map.removeControl(routingControl);
    
    const infoPanel = document.getElementById('route-info');
    if (infoPanel) { infoPanel.innerHTML = t.txtRuteHitung; infoPanel.style.display = 'block'; }

    routingControl = L.Routing.control({
        waypoints: [ L.latLng(currentLat, currentLng), L.latLng(loc.lat, loc.lng) ], 
        router: L.Routing.osrmv1({ language: bahasaSaatIni, profile: 'driving' }),
        addWaypoints: false, 
        routeLine: function(route, options) {
            return L.Routing.line(route, { addWaypoints: false, extendToWaypoints: true, styles: [{ color: '#0ec733', opacity: 0.9, weight: 8 }] });
        },
        createMarker: function() { return null; }, fitSelectedRoutes: true, show: false 
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        const distanceMeters = e.routes[0].summary.totalDistance;
        let distanceString = distanceMeters > 1000 ? (distanceMeters / 1000).toFixed(2) + ' km' : Math.round(distanceMeters) + ' meter';
        if (infoPanel) infoPanel.innerHTML = "<b>" + t.txtRuteJarak + distanceString + "</b>";
    });
};

// ==========================================
// FITUR PENCARIAN DENGAN DEBOUNCE (ANTI LAG)
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
    } else {
        alert(terjemahan[bahasaSaatIni].alertTidakKetemu);
    }
}

searchBtn.addEventListener('click', function() {
    let query = searchInput.value.toLowerCase().trim();
    jalankanPencarian(query);
});

let debounceTimer;
searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer); 
    let query = this.value.toLowerCase().trim();
    
    debounceTimer = setTimeout(() => {
        searchSuggestions.innerHTML = ''; 
        if (query === '') {
            searchSuggestions.classList.add('hidden');
            return;
        }

        let matches = searchData.filter(item => item.name.startsWith(query));

        if (matches.length > 0) {
            searchSuggestions.classList.remove('hidden');
            matches.forEach(match => {
                let li = document.createElement('li');
                li.textContent = match.name; 
                li.addEventListener('click', function() {
                    searchInput.value = match.name.replace(/\b\w/g, l => l.toUpperCase());
                    jalankanPencarian(match.name);
                });
                searchSuggestions.appendChild(li);
            });
        } else {
            searchSuggestions.classList.add('hidden'); 
        }
    }, 200); 
});

document.addEventListener('click', function(e) {
    if (!document.getElementById('search-container').contains(e.target)) {
        searchSuggestions.classList.add('hidden');
    }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        this.classList.toggle('active');
        if (this.classList.contains('active')) { map.addLayer(layerGroups[category]); } 
        else { map.removeLayer(layerGroups[category]); }
    });
});

// ==========================================
// FITUR TOGGLE TAMPILKAN / SEMBUNYIKAN SEMUA LAYER
// ==========================================
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
            this.setAttribute('data-state', 'show');
            this.className = 'filter-action-btn btn-semua';
            this.innerHTML = 'Tampilkan Semua';
        } else {
            allFilterBtns.forEach(btn => {
                if (!btn.classList.contains('active')) {
                    btn.classList.add('active'); 
                    const category = btn.getAttribute('data-category');
                    if (layerGroups[category]) map.addLayer(layerGroups[category]); 
                }
            });
            this.setAttribute('data-state', 'hide');
            this.className = 'filter-action-btn btn-kosong';
            this.innerHTML = 'Sembunyikan Semua';
        }
    });
}

const filterToggleBtn = document.getElementById('filter-toggle-btn');
const filterPanel = document.getElementById('filter-panel');
if (filterToggleBtn && filterPanel) { filterToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); filterPanel.classList.toggle('show'); }); }

// ==========================================
// 5. STATUS BAR ALA GOOGLE EARTH (THROTTLED)
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
    if (zoom === 16) { mapEl.classList.add('zoom-sedang'); } 
    else if (zoom <= 15) { mapEl.classList.add('zoom-jauh'); }
}

function perbaruiKoordinatBar(latlng) {
    document.getElementById('coord-lat').textContent = toDMS(latlng.lat, true);
    document.getElementById('coord-lng').textContent = toDMS(latlng.lng, false);
}

let isThrottled = false;
map.on('mousemove', function(e) { 
    if (!isThrottled) {
        requestAnimationFrame(() => {
            perbaruiKoordinatBar(e.latlng);
            isThrottled = false;
        });
        isThrottled = true;
    }
});

map.on('move', function() { perbaruiKoordinatBar(map.getCenter()); });
map.on('zoomend', updateEyeAltitude);
updateEyeAltitude();

// ==========================================
// 6. LEGENDA, KOMPAS, & FUNGSI TOGGLE
// ==========================================
window.toggleLegenda = function() {
    const legendContainer = document.querySelector('.legend-container');
    if (legendContainer) { legendContainer.classList.toggle('show'); }
};

window.renderLegendaHTML = function() {
    const t = terjemahan[bahasaSaatIni];
    const categories = [
        { cat: "Pusat Pemerintahan", emoji: "🏛️" },
        { cat: "Fasilitas Ibadah", emoji: "🕌" },
        { cat: "Fasilitas Kesehatan", emoji: "🏥" },
        { cat: "Fasilitas Pendidikan", emoji: "🎓" },
        { cat: "Pelaku Usaha", emoji: "🏪" },
        { cat: "Keamanan Lingkungan", emoji: "🛡️" }
    ];
    
    let content = '<div class="legend-content">';
    content += `<h4>${t.btnLegenda.replace('📜 ', '')} <button type="button" class="close-legend-btn" onclick="window.toggleLegenda()">✖</button></h4>`;
    
    categories.forEach(item => { 
        let katName = t["kat" + item.cat.replace(/\s+/g, '')] || item.cat;
        let color = getMarkerColor(item.cat);
        
        content += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; margin-right: 8px; font-size: 9px;">
                    ${item.emoji}
                </div>
                <span style="font-size: 12px; line-height: 1.2;">${katName}</span>
            </div>`; 
    });
    
    content += `
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="background-color: #3498db; width: 14px; height: 14px; border-radius: 50%; border: 1px solid #fff; margin-right: 10px; margin-left: 2px;"></div>
            <span style="font-size: 12px;">${t.labelLokasiAnda}</span>
        </div>`;
    
    content += '<hr style="border: 0; border-top: 1px solid #7f8c8d; margin: 8px 0;">';
    content += `<i style="background:#2c12f3; height: 4px; margin-top: 7px; border-radius: 0;"></i> ${t.labelJalanPantura}<br>`;
    content += `<i style="background:#d4c6c6; height: 2px; margin-top: 8px; border-radius: 0;"></i> ${t.labelJalanDesa}<br>`;
    content += `<i style="background: transparent; border-top: 3px dashed #3cc932; height: 0; margin-top: 8px; border-radius: 0;"></i> ${t.labelBatasAdmin}<br>`;
    
    content += '<hr style="border: 0; border-top: 1px solid #7f8c8d; margin: 8px 0;">';
    content += `<i style="background: #b59b38; opacity: 0.6; border-radius: 2px; border: 1px solid #b59b38;"></i> Dusun Tulis Sari<br>`;
    content += `<i style="background: #825b4a; opacity: 0.6; border-radius: 2px; border: 1px solid #825b4a;"></i> Dusun Gondangan<br>`;
    content += `<i style="background: #72659d; opacity: 0.6; border-radius: 2px; border: 1px solid #72659d;"></i> Dusun Pesawahan<br>`;
    content += `<i style="background: #32a852; opacity: 0.6; border-radius: 2px; border: 1px solid #32a852;"></i> Dusun Tulis Barat<br>`;
    
    content += '</div>';

let btn = `<button type="button" id="legend-toggle-btn" onclick="window.toggleLegenda()" title="${t.btnLegenda.replace('📜 ', '')}">📜</button>`;
    
    const div = document.querySelector('.legend-container');
    if(div) { div.innerHTML = btn + content; }
};

const legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend-container');
    setTimeout(window.renderLegendaHTML, 100); 
    L.DomEvent.disableClickPropagation(div);
    return div;
};
legend.addTo(map);

const compassControl = L.control({ position: 'topleft' });
compassControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'compass-control');
    div.innerHTML = `
    <div style="background: rgba(30, 40, 50, 0.85); backdrop-filter: blur(4px); padding: 6px; border-radius: 50%; border: 2px solid #3498db; margin-top: 10px; margin-left: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; cursor: default; transition: transform 0.3s ease;" 
         onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="30" height="30" viewBox="0 0 100 100" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.6));">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#7f8c8d" stroke-width="2" stroke-dasharray="3 4" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#3498db" stroke-width="1" opacity="0.6"/>
            <polygon points="50,88 43,50 50,55" fill="#ecf0f1" />
            <polygon points="50,88 57,50 50,55" fill="#95a5a6" />
            <polygon points="88,50 50,43 55,50" fill="#ecf0f1" />
            <polygon points="88,50 50,57 55,50" fill="#95a5a6" />
            <polygon points="12,50 50,43 45,50" fill="#95a5a6" />
            <polygon points="12,50 50,57 45,50" fill="#ecf0f1" />
            <polygon points="50,8 38,50 50,44" fill="#e74c3c" />
            <polygon points="50,8 62,50 50,44" fill="#c0392b" />
            <circle cx="50" cy="50" r="4.5" fill="#f1c40f" />
            <text x="50" y="32" font-family="'Segoe UI', Tahoma, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">U</text>
        </svg>
    </div>`;
    return div;
};
compassControl.addTo(map);

// ==========================================
// 7. FITUR ALAT UKUR PRESISI (LEAFLET-GEOMAN)
// ==========================================
map.eachLayer(function(layer) { layer.options.pmIgnore = true; });

map.pm.addControls({
    position: 'topleft', drawMarker: false, drawCircleMarker: false, drawPolyline: true, drawRectangle: false,
    drawPolygon: true, drawCircle: false, drawText: false, editMode: false, dragMode: false, cutPolygon: false, removalMode: true       
});

map.pm.setGlobalOptions({ 
    measurements: { measurement: true, displayFormat: 'metric' },
    tooltips: true, hintlineStyle: { color: '#e74c3c', dashArray: '5,5' }, templineStyle: { color: '#e74c3c' }, pathOptions: { color: '#3498db', fillColor: '#3498db', fillOpacity: 0.4 }
});

map.on('pm:create', function(e) {
    var layer = e.layer;
    layer.options.pmIgnore = false; 
    
    var hasilUkuran = "";
    if (layer.getTooltip && layer.getTooltip()) { hasilUkuran = layer.getTooltip().getContent(); }

    if (e.shape === 'Line' && (!hasilUkuran || hasilUkuran === "")) {
        var latlngs = layer.getLatLngs();
        var distance = 0;
        for (var i = 0; i < latlngs.length - 1; i++) { distance += latlngs[i].distanceTo(latlngs[i + 1]); }
        var distanceMeter = Math.round(distance).toLocaleString('id-ID');
        if (distance >= 1000) { var distanceKm = (distance / 1000).toFixed(2); hasilUkuran = distanceKm + " km<br><span style='font-size:12px; font-weight:normal;'>(" + distanceMeter + " meter)</span>"; } 
        else { hasilUkuran = distanceMeter + " meter"; }
    }

    if (e.shape === 'Polygon' && (!hasilUkuran || hasilUkuran === "")) {
        var latlngs = layer.getLatLngs()[0]; 
        var area = 0;
        var d2r = Math.PI / 180; 
        var R = 6378137; 
        
        if (latlngs.length > 2) {
            for (var i = 0; i < latlngs.length; i++) {
                var p1 = latlngs[i]; var p2 = latlngs[(i + 1) % latlngs.length];
                area += ((p2.lng - p1.lng) * d2r) * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
            }
            area = Math.abs(area * R * R / 2.0);
        }
        var areaMeter = Math.round(area).toLocaleString('id-ID');
        if (area >= 10000) { var areaHektar = (area / 10000).toFixed(2); hasilUkuran = areaHektar + " ha<br><span style='font-size:12px; font-weight:normal;'>(" + areaMeter + " meter persegi)</span>"; } 
        else { hasilUkuran = areaMeter + " meter persegi"; }
    }

    if (hasilUkuran) {
        layer.bindPopup("<div style='font-size:14px; text-align:center; padding:5px;'><span style='color:#7f8c8d; font-size:12px; display:block; margin-bottom:3px;'>Hasil Ukuran:</span><b>" + hasilUkuran + "</b></div>").openPopup();
    } else { layer.bindPopup("<b>Area berhasil dipetakan.</b>").openPopup(); }
});

// ==========================================
// 9. GALERI FOTO (DENGAN LAZY LOADING)
// ==========================================
window.bukaGaleriFoto = function(index, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const loc = locations[index];
    const kumpulanFoto = [loc.imgSatu, loc.imgDua, loc.imgTiga]; 

    let modalHTML = `
        <div id="galeri-overlay" class="galeri-overlay">
            <div class="galeri-modal">
                <button class="close-galeri" onclick="window.tutupGaleriFoto()">✖</button>
                <h3 class="galeri-title">${loc.name}</h3>
                <div class="slider-wrapper" style="position: relative;">
                    <button class="nav-btn prev-btn" onclick="window.geserGaleri(-1)">&#10094;</button>
                    <div class="galeri-slider" id="galeri-slider">
    `;
    
    kumpulanFoto.forEach((foto, i) => {
        if (foto && foto !== "") {
            modalHTML += `<div class="foto-container"><div class="loading-spinner"></div><img src="${foto}" alt="Foto ${i+1}" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.src='https://via.placeholder.com/400x250?text=Foto+Tidak+Tersedia'; this.classList.add('loaded');"></div>`;
        }
    });
    
    modalHTML += `
                    </div>
                    <button class="nav-btn next-btn" onclick="window.geserGaleri(1)">&#10095;</button>
                </div>
                <p class="galeri-hint">PICTURE BY TIM KKN UNDIP TULIS 2026</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.geserGaleri = function(arah) {
    const slider = document.getElementById('galeri-slider');
    if(slider) { const jarakGeser = slider.clientWidth; slider.scrollBy({ left: arah * jarakGeser, behavior: 'smooth' }); }
};

window.tutupGaleriFoto = function() {
    const overlay = document.getElementById('galeri-overlay');
    if (overlay) { overlay.remove(); }
};

// ==========================================
// 8. FITUR LAPOR WARGA (TRIAGE) & TOGGLE BAHASA
// ==========================================
let isReportingMode = false;
const laporControl = L.control({ position: 'topright' });

laporControl.onAdd = function(map) {
    const btn = L.DomUtil.create('button', 'lapor-warga-control');
    btn.innerHTML = terjemahan[bahasaSaatIni].laporCepat;
    
    L.DomEvent.on(btn, 'click', function(e) {
        L.DomEvent.stopPropagation(e); 
        isReportingMode = !isReportingMode; 
        const t = terjemahan[bahasaSaatIni];
        
        if (isReportingMode) {
            btn.innerHTML = t.laporBatal;
            btn.classList.add('active');
            document.getElementById('map').classList.add('reporting-mode');
            alert(t.alertLaporAktif); 
        } else {
            btn.innerHTML = t.laporCepat;
            btn.classList.remove('active');
            document.getElementById('map').classList.remove('reporting-mode');
        }
    });
    return btn;
};
laporControl.addTo(map);

map.on('click', function(e) {
    if (isReportingMode) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        
        let popupLaporHTML = `
            <div style="text-align: center; min-width: 200px; padding: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; font-size: 14px;">
                    Tujuan Laporan
                </h4>
                <p style="font-size: 11px; color: #7f8c8d; margin-bottom: 12px; font-weight: bold;">
                    Lokasi: ${lat}, ${lng}
                </p>

                <button onclick="window.prosesKirimLaporan('keamanan', ${lat}, ${lng})" 
                        style="width: 100%; margin-bottom: 6px; padding: 8px; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🚨 Laporan Keamanan
                </button>

                <button onclick="window.prosesKirimLaporan('kesehatan', ${lat}, ${lng})" 
                        style="width: 100%; margin-bottom: 6px; padding: 8px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🏥 Laporan Medis
                </button>

                <button onclick="window.prosesKirimLaporan('infrastruktur', ${lat}, ${lng})" 
                        style="width: 100%; margin-bottom: 6px; padding: 8px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🏗️ Laporan Fasilitas Desa
                </button>
            </div>
        `;

        L.popup({ closeOnClick: false, autoClose: false })
            .setLatLng(e.latlng)
            .setContent(popupLaporHTML)
            .openOn(map);

        isReportingMode = false;
        const btn = document.querySelector('.lapor-warga-control');
        btn.innerHTML = terjemahan[bahasaSaatIni].laporCepat;
        btn.classList.remove('active');
        document.getElementById('map').classList.remove('reporting-mode');
    }
});

window.prosesKirimLaporan = function(kategori, lat, lng) {
    map.closePopup(); 
    
    let urlTujuan = '';
    let templateGmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    if (kategori === 'keamanan') {
        let noPolisi = "62895392011414"; 
        let pesan = encodeURIComponent(`*LAPORAN DARURAT KEAMANAN (PANIC BUTTON)*\n\nMohon bantuan segera, ada indikasi gangguan keamanan/kejahatan di titik ini:\n${templateGmaps}\n\nPengirim: Warga Desa Tulis`);
        urlTujuan = `https://wa.me/${noPolisi}?text=${pesan}`;
        window.open(urlTujuan, '_blank');
        
    } else if (kategori === 'kesehatan') {
        let noBidan = "6289876543210"; 
        let pesan = encodeURIComponent(`*LAPORAN DARURAT MEDIS*\n\nMohon bantuan medis segera di titik lokasi ini:\n${templateGmaps}\n\nPengirim: Warga Desa Tulis`);
        urlTujuan = `https://wa.me/${noBidan}?text=${pesan}`;
        window.open(urlTujuan, '_blank');
        
    } else if (kategori === 'infrastruktur') {
        let linkFormulirDesa = `https://docs.google.com/forms/d/e/1FAIpQLScA-jsmUPdBB_sa-eftZU5gCZWxMR3q5FDGNQOsRLA1MT_kuw/viewform?entry.1856517992=${lat}&entry.1981551024=${lng}`;
        window.open(linkFormulirDesa, '_blank');
    }
};

window.toggleBahasa = function() {
    bahasaSaatIni = bahasaSaatIni === 'id' ? 'en' : 'id';
    const t = terjemahan[bahasaSaatIni];

    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.placeholder = t.cariLokasi;
    
    const laporBtn = document.querySelector('.lapor-warga-control');
    if(laporBtn) { laporBtn.innerHTML = isReportingMode ? t.laporBatal : t.laporCepat; }
    
    window.renderLegendaHTML();
    map.closePopup();

    if (userMarker) {
       userMarker.setTooltipContent(t.labelLokasiAnda);
    }
    
    document.getElementById('btn-bahasa').innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🌐</span><span class='btn-text'>Ganti Bahasa</span>" : "<span class='btn-icon'>🌐</span><span class='btn-text'>Change Language</span>";
    
    const btnLabel = document.getElementById('btn-toggle-label');
    if (btnLabel) {
        if (isLabelTampil) {
            btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Sembunyi Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Hide Labels</span>";
        } else {
            btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Tampil Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Show Labels</span>";
        }
    }
};

// ==========================================
// FITUR TOGGLE LABEL NAMA TEMPAT
// ==========================================
let isLabelTampil = false; 

document.getElementById('map').classList.add('hide-labels');

window.toggleLabel = function() {
    const mapEl = document.getElementById('map');
    const btnLabel = document.getElementById('btn-toggle-label');
    
    isLabelTampil = !isLabelTampil; 
    
    if (isLabelTampil) {
        mapEl.classList.remove('hide-labels');
        btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Sembunyi Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Hide Labels</span>";
        btnLabel.style.background = '#e74c3c'; 
    } else {
        mapEl.classList.add('hide-labels');
        btnLabel.innerHTML = bahasaSaatIni === 'id' ? "<span class='btn-icon'>🏷️</span><span class='btn-text'>Tampil Label</span>" : "<span class='btn-icon'>🏷️</span><span class='btn-text'>Show Labels</span>";
        btnLabel.style.background = '#8e44ad'; 
    }
};

// ==========================================
// INTEGRASI WEBSITE DESA (AUTO-TRIGGER MODE LAPOR)
// ==========================================
if (getUrlParameter('mode') === 'lapor') {
    setTimeout(function() {
        const btnLapor = document.querySelector('.lapor-warga-control');
        if (btnLapor && !isReportingMode) {
            btnLapor.click();
        }
    }, 1000);
}

// ==========================================
// LOGIKA CERDAS TOMBOL MENU (SISTEM 2 KLIK)
// ==========================================
document.addEventListener('click', function(e) {
    // 1. Cek apakah klik terjadi di dalam area Panel Filter
    const isFilterPanel = e.target.closest('#filter-panel');
    if (isFilterPanel) return; // Jika klik di dalam menu filter, biarkan saja

    // 2. Kenali apakah yang diklik adalah salah satu dari 5 tombol utama kita
    const targetBtn = e.target.closest('#filter-toggle-btn, .lapor-warga-control, #btn-bahasa, #btn-toggle-label, #btn-lacak-laporan');

    // 3. JIKA KLIK DI LUAR TOMBOL (MENYENTUH PETA/AREA LAIN)
    if (!targetBtn) {
        // Tutup (kuncupkan) semua tombol menjadi logo kembali
        document.querySelectorAll('.terbuka').forEach(btn => {
            btn.classList.remove('terbuka');
        });
        
        // Tutup juga menu popup filter jika sedang terbuka
        const filterPanel = document.getElementById('filter-panel');
        if (filterPanel && filterPanel.classList.contains('show')) {
            filterPanel.classList.remove('show');
        }
        return;
    }

    // 4. JIKA TOMBOL DIKLIK, TAPI POSISINYA MASIH KUNCUP (HANYA LOGO)
    // Syarat: tombol belum terbuka, dan bukan tombol Lapor yang sedang mode berkedip/aktif
    if (!targetBtn.classList.contains('terbuka') && !targetBtn.classList.contains('active')) {
        
        // KUNCI UTAMA: Cegat dan hentikan aksi bawaan tombol! (Tidak akan pindah halaman / tidak akan ganti bahasa dulu)
        e.preventDefault(); 
        e.stopPropagation(); 
        e.stopImmediatePropagation(); 

        // Kuncupkan tombol lain yang mungkin sedang melebar
        document.querySelectorAll('.terbuka').forEach(btn => {
            if (btn !== targetBtn) btn.classList.remove('terbuka');
        });

        // Mekarkan (Lebarkan) tombol ini
        targetBtn.classList.add('terbuka');
    }
    
    // 5. Jika tombol diklik untuk KEDUA KALINYA (kondisi sudah memanjang),
    // logika akan melewati tahap di atas, dan fungsi asli tombol akan dieksekusi oleh sistem!
}, true); // Menggunakan fase 'Capture' untuk mencegat aksi klik pertama