// À placer en haut du fichier après les autres imports
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet-routing-machine";
import { useEffect } from "react";

// Composant RoutingMachine
const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [{ color: "#f97316", weight: 6, opacity: 0.9 }],
      },
      createMarker: () => null, // On utilise nos propres marqueurs
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, start, end]);

  return null;
};
export default RoutingMachine;
