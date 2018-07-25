import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import data from "./data.json";

class EtaNew extends Component {
  render() {
    return (
      <div className="container">
        <div
          style={{
            marginLeft: "47%",
            textAlign: "center",
            border: "1px solid black",
            width: "15%",
            height: "20px",
            marginTop: "80px"
          }}
        >
          % Trip Completed
        </div>
        <div className="HorizontalBars">
          <div
            style={{
              borderRight: "1px solid black",
              flexGrow: 1
            }}
          />
          <div style={{ display: "inline-block" }}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <svg className="chart" style={{ width: "60%", height: "2px" }}>
                <g className="bar">
                  <rect
                    className="rectangleBar"
                    style={{ height: "2px", width: "100%", fill: "blue" }}
                  />
                </g>
              </svg>
              <svg className="chart" style={{ width: "1px", height: "20px" }}>
                <g className="bar">
                  <rect
                    className="rectangleBar"
                    style={{ height: "20px", width: "100%", fill: "black" }}
                  />
                </g>
              </svg>
              <svg className="chart" style={{ width: "40%", height: "2px" }}>
                <g className="bar">
                  <rect
                    className="rectangleBar2"
                    style={{ height: "2px", fill: "grey", width: "100%" }}
                  />
                </g>
              </svg>
            </span>
          </div>
          <div
            style={{
              borderLeft: "1px solid black",
              flexGrow: 1
            }}
          />
        </div>
        <div
          style={{
            marginLeft: "45%",
            marginTop: "10px",
            width: "10%",
            textAlign: "center",
            height: "20px",
            border: "1px dotted black"
          }}
        >
          Hover Text
        </div>
      </div>
    );
  }
}

ReactDOM.render(<EtaNew />, document.getElementById("root"));
