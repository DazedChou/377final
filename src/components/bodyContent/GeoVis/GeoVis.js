import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COUNTIES } from "./counties.js";
import listData from "../DataFiles/GeoData/geodata.json";
import "./index.css";
import { processData, computeCorrelations } from "./utilities.js";
import CorrelationTable from "./Table.js";
import CorrelationHeatmap from "./HeatMap.js";
import { Box, Tabs, Tab, Paper } from "@mui/material";


function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  map.setView(coords, zoom);
  return null;
}

function CountySelectorControl({
  countyCoords,
  selectedCounty,
  setSelectedCounty,
}) {
  const map = useMap();

  useEffect(() => {
    const controlDiv = L.DomUtil.create(
      "div",
      "leaflet-control custom-county-control"
    );

    const select = L.DomUtil.create("select", "county-select", controlDiv);

    // Prevent map drag when interacting
    L.DomEvent.disableClickPropagation(controlDiv);

    // Sort counties alphabetically, but keep "All" at the top
    const sortedCountyCoords = [
      ...countyCoords.filter(([name]) => name === "All"),
      ...countyCoords
        .filter(([name]) => name !== "All")
        .sort((a, b) => a[0].localeCompare(b[0])),
    ];

    sortedCountyCoords.forEach(([name]) => {
      const option = document.createElement("option");
      option.value = name;
      option.text = name;
      select.appendChild(option);
    });

    select.value = selectedCounty.county;

    select.onchange = (e) => {
      const selected = countyCoords.find(
        ([county]) => county === e.target.value
      );
      if (selected) {
        console.log(selected);
        if (selected[0] === "All") {
          setSelectedCounty({
            county: selected[0],
            coords: [36, -119.4179],
            zoom: 7.25,
          });
          map.setView([36, -119.4179], 7.25);
        } else {
          setSelectedCounty({
            county: selected[0],
            coords: selected[1],
            zoom: 10,
          });
          map.setView(selected[1], 10);
        }
      }
    };

    const customControl = L.control({ position: "topright" });
    customControl.onAdd = () => controlDiv;
    customControl.addTo(map);

    return () => {
      map.removeControl(customControl);
    };
  }, [map, countyCoords, selectedCounty.county, setSelectedCounty]);
}

const GeoVis = () => {
  const geoRef = useRef();

  const [geoData] = useState(COUNTIES);

  const defaultView = {
    county: "All",
    coords: [36, -119.4179],
    zoom: 7.25,
  };
  console.log(listData)
  const [countyCoords, setCountyCoords] = useState(listData);
  const [selectedCounty, setSelectedCounty] = useState(defaultView);
  useEffect(() => {
    const countyCoordsMap = new Map();

    listData.forEach((entry) => {
      if (!countyCoordsMap.has(entry.county)) {
        countyCoordsMap.set(entry.county, entry.coords);
      }
    });
    setCountyCoords(Array.from(countyCoordsMap.entries()));
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const { waste } = feature.properties;
      const popupContent = waste
        .map(
          (entry) => `
  <strong>City: ${entry.city}</strong><br/>
  Facility: ${entry.facility}<br/>
  Total Days Sampled: ${entry.sampleDays}<br/>
  Sample Days: ${entry.days}<br/>
  <br/><br/>
`
        )
        .join("");

      layer.bindPopup(popupContent);

      // Optional: highlight on hover
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: "#666",
            fillOpacity: 0.7,
          });
          layer.bringToFront();
          layer.bindPopup(popupContent).openPopup();
        },
        mouseout: (e) => {
          geoRef.current?.resetStyle(e.target); // ✅ This line
          layer.closePopup();
        },
        click: (e) => {
          layer.bindPopup(popupContent).openPopup();
        },
      });
    }
  };

    const [view, setView] = useState(0);

    const handleChange = (event, newValue) => {
      setView(newValue);
    };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={3} sx={{ mb: 2 }}>
        <Tabs
          value={view}
          onChange={handleChange}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Map" />
          <Tab label="Geo Analycits" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        {view === 0 && (
          <>
            <div className="map">
              <MapContainer
                center={selectedCounty.coords}
                zoom={selectedCounty.zoom}
                style={{ height: "60vh", width: "100%" }}
              >
                <ChangeMapView
                  coords={selectedCounty.coords}
                  zoom={selectedCounty.zoom}
                />
                <CountySelectorControl
                  countyCoords={countyCoords}
                  selectedCounty={selectedCounty}
                  setSelectedCounty={setSelectedCounty}
                />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {geoData && (
                  <GeoJSON
                    data={geoData}
                    ref={geoRef}
                    onEachFeature={onEachFeature}
                    // style={style}
                  />
                )}
                {/* <FitBounds /> */}
              </MapContainer>
            </div>
          </>
        )}

        {view === 1 && (
          <>
            <h2 className="correlation-title">
              Correlation Analysis of Waste Data
            </h2>
            <div className="correlation-container">
              <CorrelationHeatmap
                rawData={listData}
                processData={processData}
                computeCorrelations={computeCorrelations}
              />
              <CorrelationTable
                rawData={listData}
                processData={processData}
                computeCorrelations={computeCorrelations}
              />
            </div>
          </>
        )}
      </Box>
    </Box>
  );
};

export default GeoVis;
