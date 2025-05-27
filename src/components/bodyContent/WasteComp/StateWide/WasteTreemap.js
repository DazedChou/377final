import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { data } from "./data";

const WasteTreemap = () => {
  const ref = useRef();

  useEffect(() => {
    const width = 1500;
    const height = 900;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear old content

    // Prepare hierarchy
    const root = d3
      .hierarchy(data)
      .sum((d) => d.weightInTons || 0)
      .sort((a, b) => b.value - a.value);

    // Layout treemap
    d3.treemap().size([width, height]).padding(2)(root);

    const color = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([0, root.value]);

    const g = svg.attr("width", width).attr("height", height).append("g");

    const nodes = g
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.value))
      .attr("stroke", "#fff");

    nodes
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("font-size", "12px")
      .text((d) =>
        d.data.name.length > 15 ? d.data.name.slice(0, 15) + "…" : d.data.name
      );

    nodes
      .append("title")
      .text(
        (d) =>
          `${d.data.name}\n${d.value.toLocaleString()} tons\n${(
            (d.value / root.value) *
            100
          ).toFixed(2)}%`
      );
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Waste Composition Treemap</h2>
      <svg ref={ref}></svg>
    </div>
  );
};

export default WasteTreemap;
