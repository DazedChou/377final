import * as d3 from "d3";

export function processData(dataArray) {
  return dataArray
    .filter((d) => d.area && d.sampleDays && d.samples) // remove incomplete entries
    .map((d) => {
      const totalSamples = Object.values(d.samples).reduce(
        (sum, val) => sum + val,
        0
      );
      return {
        ...d,
        totalSamples,
      };
    });
}

export function computeCorrelations(dataArray) {
  const get = (key) =>
    dataArray.map((d) => d[key]).filter((v) => typeof v === "number");

  const sampleDays = get("sampleDays");
  const totalSamples = get("totalSamples");
  const tonnage = get("totalDisposalTonnage");
  const area = get("area");

  const correlation = (x, y) => {
    const n = x.length;
    const avgX = d3.mean(x);
    const avgY = d3.mean(y);
    const cov = d3.sum(x.map((xi, i) => (xi - avgX) * (y[i] - avgY))) / n;
    const stdX = d3.deviation(x);
    const stdY = d3.deviation(y);
    return cov / (stdX * stdY);
  };

  return {
    "sampleDays ~ totalSamples": correlation(sampleDays, totalSamples),
    "sampleDays ~ tonnage": correlation(sampleDays, tonnage),
    "sampleDays ~ area": correlation(sampleDays, area),
    "totalSamples ~ tonnage": correlation(totalSamples, tonnage),
    "totalSamples ~ area": correlation(totalSamples, area),
    "tonnage ~ area": correlation(tonnage, area),
  };
}
