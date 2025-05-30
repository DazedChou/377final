import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { data } from "../data";

const GroupedMaterialBarChart = () => {
  const ref = useRef();
  const [drilldown, setDrilldown] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2021");

  useEffect(() => {
    const width = 1200;
    const height = 500;
    const margin = { top: 30, right: 240, bottom: 100, left: 60 };

    const filteredData = data.find((d) => d.year.toString() === selectedYear);
    if (!filteredData) return;

    const sources = filteredData.children.map((s) => s.name);
    const color = d3.scaleOrdinal().domain(sources).range(d3.schemeSet2);

    let dataset;

    if (!drilldown) {
      const materialMap = new Map();

      filteredData.children.forEach((source) => {
        const sourceName = source.name;

        source.children?.forEach((materialNode) => {
          const matName = materialNode.name;

          const total = d3.sum(
            d3.hierarchy(materialNode).leaves(),
            (d) => d.data.weightInTons || 0
          );

          if (!materialMap.has(matName)) {
            materialMap.set(matName, { material: matName });
          }

          materialMap.get(matName)[sourceName] = total;
        });
      });

      dataset = Array.from(materialMap.values());
    } else {
      const materialName = drilldown.name;
      dataset = [];
      filteredData.children.forEach((source) => {
        const sourceName = source.name;
        const materialNode = source.children?.find(
          (m) => m.name === materialName
        );
        if (!materialNode) return;

        materialNode.children?.forEach((sub) => {
          const total = d3.sum(
            d3.hierarchy(sub).leaves(),
            (d) => d.data.weightInTons || 0
          );

          let entry = dataset.find((d) => d.subMaterial === sub.name);
          if (!entry) {
            entry = { subMaterial: sub.name };
            dataset.push(entry);
          }
          entry[sourceName] = total;
        });
      });
    }

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const tooltipDiv = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("white-space", "pre-line")
      .style("pointer-events", "none")
      .style("display", "none");

    let x0, x1, y;
    const labels = drilldown
      ? dataset.map((d) => d.subMaterial)
      : dataset.map((d) => d.material);

    x0 = d3
      .scaleBand()
      .domain(labels)
      .range([margin.left, width - margin.right])
      .paddingInner(0.2);

    x1 = d3
      .scaleBand()
      .domain(sources)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    y = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d3.max(sources, (s) => d[s] || 0))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x0).tickSizeOuter(0);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s"));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .attr("text-anchor", "end")
      .attr("font-size", "10px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - margin.left - margin.right)
          .attr("stroke-opacity", 0.1)
      );

    svg
      .append("g")
      .selectAll("g")
      .data(dataset)
      .join("g")
      .attr(
        "transform",
        (d) => `translate(${x0(drilldown ? d.subMaterial : d.material)},0)`
      )
      .selectAll("rect")
      .data((d) =>
        sources.map((s) => ({
          key: s,
          value: d[s] || 0,
          label: drilldown ? d.subMaterial : d.material,
        }))
      )
      .join("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", y(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) =>
        selectedMaterial === d.label
          ? d3.color(color(d.key)).darker(1)
          : color(d.key)
      )
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltipDiv
          .style("display", "block")
          .html(`${d.label} - ${d.key}:\n${d.value.toLocaleString()} tons`);
      })
      .on("mousemove", (event) => {
        tooltipDiv
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => tooltipDiv.style("display", "none"))
      .on("click", (event, d) => {
        tooltipDiv.style("display", "none");
        setSelectedMaterial(d.label);
        setTimeout(() => setDrilldown({ name: d.label }), 200);
      })
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value));

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20},${margin.top})`
      );

    sources.forEach((s, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(s));
      g.append("text")
        .text(s)
        .attr("x", 18)
        .attr("y", 10)
        .style("font-size", "13px")
        .attr("text-anchor", "start");
    });
  }, [drilldown, selectedMaterial, selectedYear]);

  const availableYears = [...new Set(data.map((d) => d.year.toString()))];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        {drilldown
          ? `Drilldown: ${drilldown.name} by Sub-Material`
          : `Material Composition by Source (${selectedYear})`}
      </h2>
      <select
        value={selectedYear}
        // onChange={(e) => {
        //   setSelectedYear(e.target.value);
        //   setDrilldown(null);
        //   setSelectedMaterial(null);
        // }}
        onChange={(e) => {
          setSelectedYear(e.target.value);
          // Keep drilldown and selectedMaterial as-is
        }}
        style={{ marginBottom: "1rem", padding: "6px 12px", fontSize: "14px" }}
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      {drilldown && (
        <button
          onClick={() => {
            setDrilldown(null);
            setSelectedMaterial(null);
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
          ← Back
        </button>
      )}
      <svg ref={ref}></svg>
    </div>
  );
};

export default GroupedMaterialBarChart;
