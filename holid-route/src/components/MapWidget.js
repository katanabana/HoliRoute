import React, { useEffect, useState } from "react";

async function getPlaces(lon, lat) {
  let url = "http://192.168.1.62:3001";
  url += `/places?lon=${lon}&lat=${lat}`;
  const respnose = await fetch(url, { mode: "cors" });
  return await respnose.json();
}

const MapWidget = ({ showRoute, routeType }) => {
  const [places, setPlaces] = useState([]);
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    if (
      "geolocation" in navigator &&
      ["complete", "interactive"].includes(document.readyState)
    ) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        getPlaces(position.coords.longitude, position.coords.latitude).then(
          (data) => {
            setPlaces(data.slice(0, 10));
          }
        );
      });
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  }, []);

  useEffect(() => {
    window.ymaps.ready(() => {
      if (["complete", "interactive"].includes(document.readyState)) {
        if (document.getElementsByClassName("ymaps-2-1-79-map").length) {
          document.getElementsByClassName("ymaps-2-1-79-map")[0].remove();
        }

        const map = new window.ymaps.Map("map", {
          center: [position.latitude, position.longitude],
          zoom: 13,
        });

        const routeCoordinates = [];

        for (const point of places) {
          routeCoordinates.push(point.coordinates);
        }

        routeCoordinates.push(map.getCenter());

        if (showRoute) {
          // Create a route
          var route = new window.ymaps.multiRouter.MultiRoute(
            {
              // Описание опорных точек мультимаршрута.
              referencePoints: routeCoordinates,
              // Параметры маршрутизации.
              params: {
                // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
                results: 1,
                routingMode: routeType,
              },
            },
            {
              boundsAutoApply: true,
              wayPointVisible: false,
              hideIconOnBaloonOpen: false,
            }
          );

          map.geoObjects.add(route);
        }

        for (const place of places) {
          const marker = new window.ymaps.Placemark(place.coordinates, {
            hintContent: place.name,
          });

          map.geoObjects.add(marker);
        }

        const current = new window.ymaps.Placemark(
          map.getCenter(),
          {
            hintContent: "Вы здесь",
          },
          {
            preset: "islands#governmentCircleIcon",
            iconColor: "#3b5998",
          }
        );

        map.geoObjects.add(current);
      }
    });
  }, [position, places, showRoute, routeType]);

  return <div id="map"></div>;
};

export default MapWidget;
