import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { data } from "../data";

const WasteSourceBarChart = () => {
  const ref = useRef();
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [viewLevel, setViewLevel] = useState("root");
  const [currentSource, setCurrentSource] = useState(null);

  useEffect(() => {
    const width = 600;
    const height = 350;
    const margin = { top: 30, right: 20, bottom: 50, left: 70 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const g = svg.attr("width", width).attr("height", height).append("g");

    let dataset;

    if (viewLevel === "root") {
      const sources = data.children || [];
      dataset = sources.map((source) => ({
        name: source.name,
        value: d3.sum(
          d3.hierarchy(source).leaves(),
          (d) => d.data.weightInTons || 0
        ),
        raw: source,
      }));
    } else if (viewLevel === "materials" && currentSource) {
      const sourceData = currentSource.children || [];
      dataset = sourceData.map((child) => ({
        name: child.name,
        value: d3.sum(
          d3.hierarchy(child).leaves(),
          (d) => d.data.weightInTons || 0
        ),
      }));
    }

    // Scales
    const x = d3
      .scaleBand()
      .domain(dataset.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeSet2);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("font-size", "12px");

    // Y Axis
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")));

    // Bars
    g.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => color(d.name))
      .style("cursor", (d) => (viewLevel === "root" ? "pointer" : "default"))
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `${d.name}\n${d.value.toLocaleString()} tons`,
        });
      })
      .on("mousemove", (event) => {
        setTooltip((t) => ({ ...t, x: event.pageX, y: event.pageY }));
      })
      .on("mouseout", () => setTooltip({ visible: false }))
      .on("click", (_, d) => {
        if (viewLevel === "root") {
          setCurrentSource(d.raw);
          setViewLevel("materials");
        }
      })
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value));

    // Labels
    g.selectAll("text.label")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("opacity", 0)
      .transition()
      .delay(800)
      .style("opacity", 1)
      .text((d) => d.value.toLocaleString());
  }, [viewLevel, currentSource]);

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      <h2>
        {viewLevel === "root"
          ? "Waste by Source"
          : `Materials in ${currentSource.name}`}
      </h2>
      {viewLevel === "materials" && (
        <button
          onClick={() => {
            setViewLevel("root");
            setCurrentSource(null);
          }}
          style={{
            marginBottom: "10px",
            padding: "6px 12px",
            fontSize: "14px",
            borderRadius: "4px",
            background: "#eee",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          ← Back to Sources
        </button>
      )}
      <svg ref={ref} />
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y - 20,
            backgroundColor: "#333",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "13px",
            whiteSpace: "pre-line",
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default WasteSourceBarChart;
