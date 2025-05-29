import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material/styles";

const HeatmapComparison = ({ data }) => {
  const ref = useRef();
  const theme = useTheme();

  useEffect(() => {
    const margin = { top: 50, right: 30, bottom: 80, left: 100 };
    const width = 700;
    const height = 420;

    const flatData = [];
    data.forEach((yearEntry) => {
      const year = yearEntry.year;
      yearEntry.children.forEach((source) => {
        source.children.forEach((materialNode) => {
          const total = d3.sum(
            d3.hierarchy(materialNode).leaves(),
            (d) => d.data.weightInTons || 0
          );
          flatData.push({
            year,
            source: source.name,
            material: materialNode.name,
            total,
          });
        });
      });
    });

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const materials = [...new Set(flatData.map((d) => d.material))].sort();
    const years = [...new Set(flatData.map((d) => d.year))].sort();

    const x = d3
      .scaleBand()
      .domain(years)
      .range([margin.left, width - margin.right])
      .padding(0.05);
    const y = d3
      .scaleBand()
      .domain(materials)
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateOranges)
      .domain([0, d3.max(flatData, (d) => d.total)]);

    svg
      .append("g")
      .selectAll("rect")
      .data(flatData)
      .join("rect")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.material))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.total))
      .append("title")
      .text(
        (d) => `${d.material} (${d.year}): ${d.total.toLocaleString()} tons`
      );

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", theme.palette.text.primary);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", theme.palette.text.primary);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", theme.palette.text.primary)
      .text("Material Weight by Year");
  }, [data, theme]);

  return <svg ref={ref} />;
};

export default HeatmapComparison;
