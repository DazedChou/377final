import React from "react";
import HeatmapComparison from "./Analytics/HeatMapComparison";
import GroupedBarChart from "./Analytics/GroupedBarChart";
import LineChartTrends from "./Analytics/LineChartTrends";
import { data } from "./data";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Container,
  Divider,
} from "@mui/material";

const MultiYearAnalytics = () => {
  return (
    <Container maxWidth="lg">
      <Box py={5}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📊 Multi-Year Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          A breakdown of composition trends and comparisons across years
        </Typography>

        {/* Optional: Filters can go here */}
        {/* <Box mb={4}>
          <YourFilterComponent />
        </Box> */}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Weight Composition Heatmap
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <HeatmapComparison data={data} />
            </Paper>
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Sub-Material Diversity vs Total Weight
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ScatterPlotComparison data={data} />
            </Paper>
          </Grid> */}

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Sub-Materials by Stream (2018 vs 2021)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <GroupedBarChart data={data} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Material Trends Over Time (Summed Across Streams)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <LineChartTrends data={data} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MultiYearAnalytics;
