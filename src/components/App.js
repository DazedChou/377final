import React, { useState } from "react";
import "./styling/App.css";
import TopNav from "./content/TopNav";
import Body from "./content/Body";
import { Box, CssBaseline } from "@mui/material";
import 'leaflet/dist/leaflet.css';

const App = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <TopNav tabIndex={tabIndex} setTabIndex={setTabIndex} />
        <Box>
          {/* This Box fills the rest of the screen below the AppBar */}
            <Body tabIndex={tabIndex} />
        </Box>
      </Box>
    </>
  )
}

export default App;
