// LineChartTrends.js (sum across streams + MUI styling)
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme, Paper, Box } from "@mui/material";

const LineChartTrends = ({ data }) => {
  const ref = useRef();
  const theme = useTheme();

  useEffect(() => {
    const margin = { top: 40, right: 160, bottom: 60, left: 60 };
    const width = 800;
    const height = 450;

    const flatData = [];
    data.forEach((yearEntry) => {
      const year = yearEntry.year;
      const materialTotals = new Map();

      yearEntry.children.forEach((source) => {
        source.children.forEach((materialNode) => {
          const name = materialNode.name;
          const total = d3.sum(
            d3.hierarchy(materialNode).leaves(),
            (d) => d.data.weightInTons || 0
          );
          materialTotals.set(name, (materialTotals.get(name) || 0) + total);
        });
      });

      for (const [material, total] of materialTotals.entries()) {
        flatData.push({ year, material, total });
      }
    });

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("display", "none");

    const years = [...new Set(flatData.map((d) => d.year))].sort();
    const materialMap = d3.group(flatData, (d) => d.material);
    const materials = Array.from(materialMap.keys()).sort();

    const x = d3
      .scaleLinear()
      .domain(d3.extent(years))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(flatData, (d) => d.total)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(materials);

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.total))
      .curve(d3.curveMonotoneX);

    const materialLines = Array.from(materialMap, ([material, values]) => ({
      material,
      values: years.map((year) => {
        const match = values.find((d) => d.year === year);
        return { year, total: match ? match.total : 0 };
      }),
    }));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(years.length).tickFormat(d3.format("d")))
      .call((g) =>
        g
          .selectAll("text")
          .style("fill", theme.palette.text.primary)
          .style("font-family", theme.typography.fontFamily)
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .call((g) =>
        g
          .selectAll("text")
          .style("fill", theme.palette.text.primary)
          .style("font-family", theme.typography.fontFamily)
      )
      .call((g) => g.selectAll("line").attr("stroke", theme.palette.divider))
      .call((g) => g.select(".domain").attr("stroke", theme.palette.divider));

    svg
      .append("g")
      .selectAll("path")
      .data(materialLines)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.material))
      .attr("stroke-width", 2)
      .attr("d", (d) => line(d.values));

    svg
      .append("g")
      .selectAll("circle")
      .data(
        materialLines.flatMap((d) =>
          d.values.map((v) => ({ ...v, material: d.material }))
        )
      )
      .join("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.total))
      .attr("r", 3)
      .attr("fill", (d) => color(d.material))
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `${d.material} (${
              d.year
            }):<br><strong>${d.total.toLocaleString()} tons</strong>`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    svg
      .append("g")
      .selectAll("text.legend")
      .data(materialLines)
      .join("text")
      .attr("x", width - margin.right + 10)
      .attr("y", (d, i) => margin.top + i * 18)
      .text((d) => d.material)
      .attr("fill", (d) => color(d.material))
      .style("font-size", "12px")
      .style("font-family", theme.typography.fontFamily);
  }, [data, theme]);

  return (
    <Paper elevation={3} sx={{ p: 3, overflowX: "auto" }}>
      <Box>
        <svg ref={ref} />
      </Box>
    </Paper>
  );
};

export default LineChartTrends;
