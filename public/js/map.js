document.addEventListener("DOMContentLoaded", function () {
  const lat = coordinates[1];
  const lng = coordinates[0];

  const map = L.map("map").setView([lat, lng], 9);
  // Tile Layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  //red icon location one from fontawesome
  const redIcon = L.divIcon({
    html: '<i class="fa-solid fa-location-dot" style="color:red;font-size:32px;"></i>',
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Marker
  L.marker([lat, lng], { icon: redIcon })
    .addTo(map)
    .bindPopup(
      `<b>${locationName}</b><br>${countryName}<br><small>Exact location will be provided after booking</small>`
    );
  });


