import React from "react";
import WasteCompVis from "./StateWide/WasteCompVis";
import wasteJSON from "../DataFiles/StateWide Characterization/Top10PrevalentMaterialTypesInWaste.json";
import TopMaterialsBarChart from "./StateWide/TopMaterialTypes";
import WasteTreemap from "./StateWide/WasteTreemap";
import WasteSourceBarChart from "./StateWide/WasteSourceBarChart";
import GroupedMaterialBarChart from "./StateWide/GroupedBarChart";

const index = () => {
  return (
    <div>
      <GroupedMaterialBarChart />
      {/* <WasteSourceBarChart /> */}
      {/* <WasteTreemap /> */}
      {/* <WasteCompVis /> */}
      {/* <TopMaterialsBarChart/> */}
    </div>
  );
};

export default index;
