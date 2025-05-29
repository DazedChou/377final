import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, Typography, Paper, useTheme } from "@mui/material";

const CorrelationHeatmap = ({ rawData, processData, computeCorrelations }) => {
  const svgRef = useRef();
  const theme = useTheme();

  useEffect(() => {
    const processed = processData(rawData);
    const correlations = computeCorrelations(processed);

    const data = Object.entries(correlations).map(([pair, value]) => {
      const [x, y] = pair.split(" ~ ");
      return { x, y, value };
    });

    const variables = Array.from(new Set(data.flatMap((d) => [d.x, d.y])));

    const cellSize = 50;
    const size = variables.length * cellSize;
    const margin = { top: 60, right: 40, bottom: 40, left: 120 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const fullWidth = size + margin.left + margin.right;
    const fullHeight = size + margin.top + margin.bottom;

    svg.attr("width", fullWidth).attr("height", fullHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand().domain(variables).range([0, size]);
    const yScale = d3.scaleBand().domain(variables).range([0, size]);

    const color = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

    // Axes
    g.append("g")
      .selectAll("text.x-label")
      .data(variables)
      .join("text")
      .attr("x", (d) => xScale(d) + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "start")
      .attr("transform", (d) => `rotate(-45, ${xScale(d) + cellSize / 2}, -10)`)
      .style("font-size", "12px")
      .style("fill", theme.palette.text.primary)
      .style("font-family", theme.typography.fontFamily);

    g.append("g")
      .selectAll("text.y-label")
      .data(variables)
      .join("text")
      .attr("x", -10)
      .attr("y", (d) => yScale(d) + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px")
      .style("fill", theme.palette.text.primary)
      .style("font-family", theme.typography.fontFamily)
      .text((d) => d);

    // Cells
    g.selectAll("rect.cell")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", (d) => color(d.value))
      .style("stroke", "#fff");

    // Text values
    g.selectAll("text.value")
      .data(data)
      .join("text")
      .attr("x", (d) => xScale(d.x) + cellSize / 2)
      .attr("y", (d) => yScale(d.y) + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "11px")
      .style("fill", (d) =>
        Math.abs(d.value) > 0.5
          ? theme.palette.common.white
          : theme.palette.text.primary
      )
      .text((d) => d.value.toFixed(2));
  }, [rawData, processData, computeCorrelations, theme]);

  return (
    <Paper elevation={3} sx={{ p: 3, overflowX: "auto" }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Correlation Heatmap
      </Typography>
      <Box>
        <svg ref={svgRef}></svg>
      </Box>
    </Paper>
  );
};

export default CorrelationHeatmap;
