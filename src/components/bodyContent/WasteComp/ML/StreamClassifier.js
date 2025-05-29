// StreamClassifier.js (with predefined testSamples support and prediction integration)
import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { data as rawData } from "../data";
import RadarChart from "./RadarChart";

const testSamples = [
  {
    name: "Test Facility A",
    stream: "Single-Family Residential",
    features: {
      Paper: 900000,
      Plastic: 600000,
      Glass: 80000,
      Metal: 120000,
      Organics: 700000,
      "Special Waste": 30000,
      HHW: 2000,
      Electronic: 10000,
      "Inerts and Other": 150000,
      Miscellaneous: 50000,
    },
  },
  {
    name: "Test Facility B",
    stream: "Franchised Commercial/Residential",
    features: {
      Paper: 500000,
      Plastic: 300000,
      Glass: 40000,
      Metal: 50000,
      Organics: 400000,
      "Special Waste": 20000,
      HHW: 500,
      Electronic: 5000,
      "Inerts and Other": 80000,
      Miscellaneous: 30000,
    },
  },
];

const StreamClassifier = () => {
  const [model, setModel] = useState(null);
  const [inputSample, setInputSample] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [labels, setLabels] = useState([]);
  const [features, setFeatures] = useState([]);
  const [confusionMatrix, setConfusionMatrix] = useState([]);
  const [predictionProbabilities, setPredictionProbabilities] = useState([]);
  const [selectedTestSample, setSelectedTestSample] = useState("");

  function preprocess(data) {
    const samples = [];
    const allSubs = new Set();

    const streamEntries = data.flatMap((yearEntry) => yearEntry.children || []);

    streamEntries.forEach((entry) => {
      if (!entry.name || !entry.children) return; // Skip entries without stream
      const stream = entry.name;
      entry.children.forEach((material) => {
        const materialName = material.name;

        const total = (material.children || []).reduce(
          (sum, sub) => sum + (sub.weightInTons || 0),
          0
        );

        samples.push({ stream, sub: materialName, tons: total });
        allSubs.add(materialName);
      });
    });

    const subList = Array.from(allSubs).sort();
    const grouped = {};

    samples.forEach(({ stream, sub, tons }) => {
      if (!grouped[stream]) grouped[stream] = [];
      const last = grouped[stream][grouped[stream].length - 1];
      if (!last || Object.keys(last).length >= subList.length) {
        grouped[stream].push({});
      }
      const entry = grouped[stream][grouped[stream].length - 1];
      entry[sub] = (entry[sub] || 0) + tons;
    });

    const allSamples = [];
    for (const stream in grouped) {
      grouped[stream].forEach((entry) => {
        const featureVec = subList.map((name) => entry[name] || 0);
        allSamples.push({ stream, features: featureVec });
      });
    }

    return { allSamples, subList };
  }

  async function trainModel() {
    const { allSamples, subList } = preprocess(rawData);
    const streamSet = [...new Set(allSamples.map((s) => s.stream))];

    const labelSet = [...new Set(allSamples.map((s) => s.stream))];
    setLabels(labelSet);
    setFeatures(subList);

    const xs = tf.tensor2d(allSamples.map((s) => s.features));
    const ys = tf.tensor2d(
      allSamples.map((s) =>
        labelSet.map((label) => (label === s.stream ? 1 : 0))
      )
    );

    if (model) {
      model.dispose();
    }
    let newModel = tf.sequential();
    newModel.add(
      tf.layers.dense({
        inputShape: [subList.length],
        units: 64,
        activation: "relu",
      })
    );
    newModel.add(tf.layers.dropout({ rate: 0.2 }));
    newModel.add(tf.layers.dense({ units: 32, activation: "relu" }));
    newModel.add(
      tf.layers.dense({ units: streamSet.length, activation: "softmax" })
    );

    newModel.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    const classCounts = allSamples.reduce((acc, s) => {
      acc[s.stream] = (acc[s.stream] || 0) + 1;
      return acc;
    }, {});

    const total = allSamples.length;
    const classWeights = {};
    streamSet.forEach((label) => {
      const count = classCounts[label] || 1;
      classWeights[streamSet.indexOf(label)] =
        total / (streamSet.length * count);
    });

    await newModel.fit(xs, ys, {
      epochs: 30,
      shuffle: true,
      classWeight: classWeights,
    });
    setModel(newModel);

    const predictions = newModel.predict(xs);
    const predLabels = await predictions.argMax(-1).array();
    const trueLabels = await ys.argMax(-1).array();
    const matrix = Array(streamSet.length)
      .fill(0)
      .map(() => Array(streamSet.length).fill(0));

    for (let i = 0; i < trueLabels.length; i++) {
      matrix[trueLabels[i]][predLabels[i]]++;
    }

    setConfusionMatrix(matrix);
  }

  function handlePredict() {
    if (!model) {
      console.warn("Model not loaded yet.");
      return;
    }

    const inputVec = features.map((f) => parseFloat(inputSample[f] || 0));
    const maxVal = Math.max(...inputVec);
    const inputVecNorm = inputVec.map((v) => v / maxVal);
    const inputTensor = tf.tensor2d([inputVecNorm]);
    const result = model.predict(inputTensor);
    result.array().then((arr) => {
      const index = arr[0].indexOf(Math.max(...arr[0]));
      setPrediction(labels[index]);
      setPredictionProbabilities(arr[0]);
    });
  }

  function handleSampleLoad() {
    const sample = features.reduce((acc, f) => {
      acc[f] = Math.floor(Math.random() * 1000000);
      return acc;
    }, {});
    setInputSample(sample);
  }

  function handleTestSampleSelect(name) {
    const test = testSamples.find((s) => s.name === name);
    if (!test) return;

    const mapped = features.reduce((acc, f) => {
      acc[f] = test.features.hasOwnProperty(f) ? test.features[f] : 0;
      return acc;
    }, {});

    console.log("Mapped Sample:", mapped);
    setInputSample(mapped);
    setSelectedTestSample(name);
  }

  useEffect(() => {
    trainModel();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Stream Classifier
      </Typography>

      <Box mb={2}>
        <FormControl fullWidth>
          <InputLabel>Load Test Sample</InputLabel>
          <Select
            value={selectedTestSample}
            label="Load Test Sample"
            onChange={(e) => handleTestSampleSelect(e.target.value)}
          >
            {testSamples.map((s) => (
              <MenuItem key={s.name} value={s.name}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {features.map((f) => (
          <Grid item xs={6} md={3} key={f}>
            <TextField
              label={f}
              type="number"
              variant="outlined"
              size="small"
              value={
                typeof inputSample[f] !== "undefined" ? inputSample[f] : ""
              }
              onChange={(e) =>
                setInputSample({ ...inputSample, [f]: e.target.value })
              }
              fullWidth
            />
          </Grid>
        ))}
      </Grid>

      <Box mt={2} display="flex" gap={2}>
        <Button variant="outlined" onClick={handleSampleLoad}>
          Random Sample
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePredict}
          disabled={!model}
        >
          Predict Stream
        </Button>
      </Box>

      {predictionProbabilities.length > 0 && (
        <Paper sx={{ mt: 4, p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            Prediction Results: {prediction}
          </Typography>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Grid container spacing={2} alignItems="flex-end">
              {labels.map((label, i) => (
                <Grid item key={label} xs={4} md={2} textAlign="center">
                  <Box
                    sx={{
                      width: "100%",
                      height: `${predictionProbabilities[i] * 120}px`,
                      backgroundColor: "#1976d2",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.3s ease",
                      marginBottom: 1,
                    }}
                  ></Box>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(predictionProbabilities[i] * 100).toFixed(1)}%
                  </Typography>
                </Grid>
              ))}
            </Grid>
            {Object.keys(inputSample).length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Material Composition (Radar)
                </Typography>
                <RadarChart sample={inputSample} />
              </div>
            )}
          </div>
        </Paper>
      )}

      <Paper sx={{ mt: 6, p: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          Confusion Matrix
        </Typography>
        <Box component="table" border={1} borderColor="grey.300" width="100%">
          <thead>
            <tr>
              <th></th>
              {labels.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {confusionMatrix.map((row, i) => (
              <tr key={i}>
                <td>
                  <strong>{labels[i]}</strong>
                </td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "6px 12px",
                      textAlign: "center",
                      backgroundColor:
                        i === j
                          ? "#c8e6c9"
                          : val > 0
                          ? "#ffcdd2"
                          : "transparent",
                    }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>
      </Paper>
    </Paper>
  );
};

export default StreamClassifier;
