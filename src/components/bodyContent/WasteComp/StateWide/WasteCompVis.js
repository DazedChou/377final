import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import stateOverviewJSON from "../../DataFiles/StateWide Characterization/statewideDisposalatAGlance.json";
import wasteJSON from "../../DataFiles/StateWide Characterization/Top10PrevalentMaterialTypesInWaste.json";
import materialJSON from "../../DataFiles/StateWide Characterization/Top10MaterialCategories.json";
import {data} from './data'

const WasteCompVis = () => {
  const ref = useRef();
  const [tooltipContent, setTooltipContent] = useState("");


  const [currentRoot, setCurrentRoot] = useState(data);

  useEffect(() => {
    const width = 500;
    const radius = width / 2;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const partition = d3.partition().size([2 * Math.PI, radius]);

    const root = d3
      .hierarchy(currentRoot)
      .sum((d) => d.weightInTons || 0)
      .sort((a, b) => b.value - a.value);

    partition(root);

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - 1);

    const g = svg
      .attr("width", width)
      .attr("height", width)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    const color = d3.scaleOrdinal(d3.schemePastel1);
    const total = root.value;

    g.selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.depth))
      .attr("stroke", "#fff")
      .style("cursor", (d) => (d.children ? "pointer" : "default"))
      .on("click", (event, d) => {
        if (d.children) {
          setCurrentRoot(d.data);
        }
      })
      .on("mouseover", (event, d) => {
        if (!d.data.weightInTons) return;
        const percent = ((d.value / total) * 100).toFixed(1);
        setTooltipContent(
          `${d.data.name}\n${percent}% — ${d.value.toLocaleString()} tons`
        );
      })
      .on("mouseout", () => setTooltipContent(""))
      .append("title")
      .text(
        (d) =>
          `${d.data.name}
${((d.value / total) * 100).toFixed(1)}%
${d.value?.toLocaleString()} tons`
      );

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-weight", "bold")
      .style("cursor", "pointer")
      .text(currentRoot.name)
      .on("click", () => setCurrentRoot(data));
  }, [currentRoot]);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Waste Composition Sunburst</h3>
      <svg ref={ref} />
      <div style={{ height: "60px", marginTop: "1rem" }}>
        <div
          style={{
            background: tooltipContent ? "#333" : "transparent",
            color: "white",
            display: "inline-block",
            padding: tooltipContent ? "8px 12px" : "0",
            borderRadius: "4px",
            fontSize: "14px",
            whiteSpace: "pre-line",
            minHeight: "40px",
            transition: "all 0.2s ease",
          }}
        >
          {tooltipContent}
        </div>
      </div>
      <p style={{ marginTop: "1rem" }}>
        Click a sector to drill down. Click the center label to go back.
      </p>
    </div>
  );
};

export default WasteCompVis;
