import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RadarChart = ({ sample }) => {
  const ref = useRef();

  useEffect(() => {
    if (!sample) return;

    const categories = Object.keys(sample);
    const values = Object.values(sample);

    const maxVal = d3.max(values);
    const normalized = values.map((v) => v / maxVal);

    const width = 300;
    const height = 300;
    const radius = 100;
    const levels = 5;

    const angleSlice = (Math.PI * 2) / categories.length;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw circular grid
    for (let i = 0; i <= levels; i++) {
      const r = (radius / levels) * i;
      g.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2");
    }

    // Axes
    categories.forEach((cat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#aaa");

      g.append("text")
        .attr("x", x * 1.1)
        .attr("y", y * 1.1)
        .attr("dy", "0.35em")
        .attr("text-anchor", x < 0 ? "end" : "start")
        .style("font-size", "10px")
        .text(cat);
    });

    // Data shape
    const line = d3
      .lineRadial()
      .radius((d) => d.value * radius)
      .angle((d, i) => i * angleSlice);

    const dataPoints = normalized.map((v, i) => ({ value: v }));

    g.append("path")
      .datum(dataPoints)
      .attr("fill", "#1976d2")
      .attr("fill-opacity", 0.4)
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 2)
      .attr("d", line);
  }, [sample]);

  return <svg ref={ref}></svg>;
};

export default RadarChart;
