// WasteComp.js
import React, {useState} from "react";
import GroupedMaterialBarChart from "./StateWide/GroupedBarChart";
import MultiYearAnalytics from "./MultiYearAnalytics"; // Adjust the path as needed
import { Box, Tabs, Tab, Paper, Typography } from "@mui/material";
import StreamClassifier from "./ML/StreamClassifier";

const WasteComp = () => {
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
          <Tab label="Statewide Grouped" />
          <Tab label="Analytics Dashboard" />
          <Tab label="Generative Analysis" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        {view === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Statewide Grouped Material Chart
            </Typography>
            <GroupedMaterialBarChart />
          </>
        )}

        {view === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Interactive Analytics Dashboard
            </Typography>
            <MultiYearAnalytics />
          </>
        )}

        {view === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Modeling
            </Typography>
            <StreamClassifier />
          </>
        )}
      </Box>
    </Box>
  );
};

export default WasteComp;