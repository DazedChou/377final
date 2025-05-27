import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./index.css";

export default function CorrelationHeatmap({
  rawData,
  processData,
  computeCorrelations,
}) {
  const svgRef = useRef();

  useEffect(() => {
    const processed = processData(rawData);
    const correlations = computeCorrelations(processed);

    const data = Object.entries(correlations).map(([pair, value]) => {
      const [x, y] = pair.split(" ~ ");
      return { x, y, value };
    });

    const variables = Array.from(new Set(data.flatMap((d) => [d.x, d.y])));

    const size = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const cellSize = size / variables.length;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous renders

    svg
      .attr("width", size + margin.left + margin.right)
      .attr("height", size + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const g = svg.select("g");

    const color = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]); // note reverse for RdBu

    // Axes
    const xScale = d3.scaleBand().domain(variables).range([0, size]);
    const yScale = d3.scaleBand().domain(variables).range([0, size]);

    g.append("g")
      .selectAll("text")
      .data(variables)
      .enter()
      .append("text")
      .attr("x", (_, i) => i * cellSize + cellSize / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .text((d) => d)
      .attr("font-size", 12);

    g.append("g")
      .selectAll("text")
      .data(variables)
      .enter()
      .append("text")
      .attr("y", (_, i) => i * cellSize + cellSize / 2)
      .attr("x", -5)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .text((d) => d)
      .attr("font-size", 12);

    // Cells
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", (d) => color(d.value))
      .style("stroke", "#ccc");

    // Text values
    g.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.x) + cellSize / 2)
      .attr("y", (d) => yScale(d.y) + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", 11)
      .attr("fill", (d) => (Math.abs(d.value) > 0.5 ? "white" : "black"))
      .text((d) => d.value.toFixed(2));
  }, [rawData, processData, computeCorrelations]);

  return (
    <div className="correlation-heatmap">
      <svg ref={svgRef}></svg>
    </div>
  );
}
