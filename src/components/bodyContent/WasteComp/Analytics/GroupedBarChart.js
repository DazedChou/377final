// GroupedBarChart.js (restyled with legend and sorted years)
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material/styles";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const GroupedBarChart = ({ data }) => {
  const theme = useTheme();
  const chartRefs = useRef({});

  useEffect(() => {
    const margin = { top: 40, right: 140, bottom: 100, left: 60 };
    const width = 700;
    const height = 420;

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("white-space", "nowrap")
      .style("pointer-events", "none")
      .style("display", "none");

    const allYears = [...new Set(data.map((d) => d.year.toString()))].sort();
    const sourceSubTotals = new Map();

    data.forEach((yearEntry) => {
      const year = yearEntry.year.toString();
      yearEntry.children.forEach((source) => {
        const sourceName = source.name;
        const mapKey = `${sourceName}`;
        if (!sourceSubTotals.has(mapKey))
          sourceSubTotals.set(mapKey, new Map());
        const yearMap = sourceSubTotals.get(mapKey);
        if (!yearMap.has(year)) yearMap.set(year, new Map());
        const subMap = yearMap.get(year);

        source.children.forEach((materialNode) => {
          (materialNode.children || []).forEach((sub) => {
            const key = sub.name;
            const total = d3.sum(
              d3.hierarchy(sub).leaves(),
              (d) => d.data.weightInTons || 0
            );
            subMap.set(key, (subMap.get(key) || 0) + total);
          });
        });
      });
    });

    const streams = [...sourceSubTotals.keys()];

    streams.forEach((stream) => {
      const containerEl = chartRefs.current[stream];
      if (!containerEl) return;
      const container = d3.select(containerEl);
      container.selectAll("*").remove();

      const yearMap = sourceSubTotals.get(stream);
      const allSubs = new Map();
      allYears.forEach((year) => {
        const subMap = yearMap.get(year) || new Map();
        for (let [k, v] of subMap.entries()) {
          allSubs.set(k, (allSubs.get(k) || 0) + v);
        }
      });

      const topSubs = Array.from(allSubs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name);

      const combinedData = [];
      allYears.forEach((year) => {
        const subMap = yearMap.get(year) || new Map();
        topSubs.forEach((sub) => {
          combinedData.push({
            sub,
            year,
            value: subMap.get(sub) || 0,
          });
        });
      });

      const x0 = d3
        .scaleBand()
        .domain(topSubs)
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const x1 = d3
        .scaleBand()
        .domain(allYears)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(combinedData, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3
        .scaleOrdinal()
        .domain(allYears)
        .range(d3.schemeTableau10);

      const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-30)")
        .attr("text-anchor", "end")
        .style("font-size", "11px")
        .style("font-family", theme.typography.fontFamily)
        .style("fill", theme.palette.text.primary);

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
        .call((g) =>
          g
            .selectAll("text")
            .style("font-family", theme.typography.fontFamily)
            .style("fill", theme.palette.text.primary)
        )
        .call((g) => g.selectAll("line").attr("stroke", theme.palette.divider))
        .call((g) => g.select(".domain").attr("stroke", theme.palette.divider));

      svg
        .append("g")
        .selectAll("g")
        .data(topSubs)
        .join("g")
        .attr("transform", (d) => `translate(${x0(d)},0)`)
        .selectAll("rect")
        .data((sub) =>
          allYears.map((year) => {
            const subMap = yearMap.get(year) || new Map();
            const value = subMap.get(sub) || 0;
            return { sub, year, value };
          })
        )
        .join("rect")
        .attr("x", (d) => x1(d.year))
        .attr("y", (d) => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => y(0) - y(d.value))
        .attr("fill", (d) => color(d.year))
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(
              `${d.sub} (${
                d.year
              }):<br><strong>${d.value.toLocaleString()} tons</strong>`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", theme.typography.fontFamily)
        .style("fill", theme.palette.text.primary)

      // Legend
      svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - margin.right + 20}, ${margin.top})`
        )
        .selectAll("g")
        .data(allYears)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .each(function (d) {
          d3.select(this)
            .append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(d));

          d3.select(this)
            .append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(d)
            .style("font-size", "12px")
            .style("font-family", theme.typography.fontFamily)
            .style("fill", theme.palette.text.primary);
        });
    });
  }, [data, theme]);

  const streams = Array.isArray(data)
    ? [...new Set(data.flatMap((d) => (d.children || []).map((s) => s.name)))]
    : [];

  return (
    <Box>
      {streams.map((stream) => (
        <Accordion key={stream} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              {stream} Comparison
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box ref={(el) => (chartRefs.current[stream] = el)} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default GroupedBarChart;
