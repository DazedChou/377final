import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import materialTypeJSON from "../../DataFiles/StateWide Characterization/Top10PrevalentMaterialTypesInWaste.json";

const TopMaterialsBarChart = () => {
  const ref = useRef();

  const data = materialTypeJSON;
  console.log(data);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const container = svg.node().parentElement;
    const fullWidth = container.offsetWidth;
    const margin = { top: 20, right: 30, bottom: 40, left: 200 };
    const width = fullWidth - margin.left - margin.right;
    const height = data.length * 40;

    svg
      .attr("width", fullWidth)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.percent) * 1.1]) // slight padding
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.material))
      .range([0, height])
      .padding(0.1);

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d}%`))
      .selectAll("text")
      .style("font-size", "12px");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.material))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => x(d.percent))
      .attr("fill", "#FFB3C6");

    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.percent) - 5)
      .attr("y", (d) => y(d.material) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .style("fill", "white")
      .style("font-size", "11px")
      .text((d) => `${d.percent}%`);
  }, []);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg ref={ref} />
    </div>
  );
};

export default TopMaterialsBarChart;
