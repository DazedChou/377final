import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import "../styling/Body.css";
import WasteComp from "../bodyContent/WasteComp/";
import GeoVis from "../bodyContent/GeoVis/GeoVis";

const Body = ({ tabIndex }) => {
  return (
    <div className="body">
      {tabIndex == 0 && <WasteComp />}
      {tabIndex == 1 && <GeoVis />}
    </div>
  );
};

export default Body;
