import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import data from "./data.json";
import moment from "moment";
import stops from "./stoppages.json";

let index = "";
let act_time = data.tolls_a.map((value, index) => moment(value.exit_time));

let scheduled_time = data.tolls_a.map((value, index) =>
  moment(value.loading_out).add(value.ideal_time.time_taken_median, "hours")
);

let sched_best = data.tolls_a.map((value, index) =>
  moment(scheduled_time[index]).subtract(
    value.ideal_time.time_taken_median * 0.15,
    "hours"
  )
);

let sched_worst = data.tolls_a.map((value, index) =>
  moment(scheduled_time[index]).add(
    value.ideal_time.time_taken_median * 0.15,
    "hours"
  )
);

let status = data.tolls_a.map(
  (value, index) =>
    act_time[index] > sched_worst[index]
      ? "Delayed"
      : act_time[index] <= sched_best[index]
        ? "Early"
        : "OnTime"
);

class EtaNew extends Component {
  state = {
    width: "",
    datesDisplayWidth: [],
    datesDisplay: [],
    hover: false,
    indexHover: "",
    widthOfStops: "",
    marginsLeftForDates: "",
    widthHorizontalBar: "",
    widthGreyBar: ""
  };

  componentDidMount() {
    this.calcHorizontalBarWidth();
  }

  updateIndex(value) {
    index = value;
  }

  calcHorizontalBarWidth() {
    let width =
      ((new Date(data.gps.ist_timestamp) - new Date(data.tolls_h[0])) /
        (new Date(data.trip.eta) - new Date(data.tolls_h[0]))) *
      1000;
    console.log(width);
    this.setState(
      {
        widthHorizontalBar: width,
        widthGreyBar: 1000 - width
      },
      () => this.calcWidthForTolls()
    );
  }

  calcWidthForTolls() {
    let datesDisplay = [
      ...new Set(
        data.tolls_h.map((value, index) =>
          moment(new Date(value), "YYYY-MM-DD").format("YYYY-MM-DD")
        )
      )
    ];

    let datesDisplayWidth = new Array(datesDisplay.length + 1)
      .join("0")
      .split("")
      .map(parseFloat);

    for (let i = 0; i < datesDisplay.length; i++) {
      for (let j = 0; j < data.tolls_h.length; j++) {
        if (
          moment(datesDisplay[i]).format("YYYY-MM-DD") ===
          moment(data.tolls_h[j]).format("YYYY-MM-DD")
        ) {
          datesDisplayWidth[i]++;
        }
      }
    }

    datesDisplayWidth = [...datesDisplayWidth.filter(n => n)];

    let width = this.state.widthHorizontalBar / data.tolls_h.length;

    this.setState(
      {
        width: width,
        datesDisplayWidth: [...datesDisplayWidth],
        datesDisplay: [...datesDisplay]
      },
      () => this.displayGreyBox()
    );
  }

  onHoverEnter(index) {
    this.setState({ hover: true, indexHover: index });
  }

  onHoverExit() {
    this.setState({ hover: false });
  }

  displayGreyBox() {
    let temp = 0; //TO take the maximum number of stoppages to be displayed

    if (this.state.widthHorizontalBar > 900) {
      temp = 100;
    } else if (this.state.widthHorizontalBar > 800) {
      temp = 90;
    } else if (this.state.widthHorizontalBar > 700) {
      temp = 80;
    } else if (this.state.widthHorizontalBar > 600) {
      temp = 70;
    } else if (this.state.widthHorizontalBar > 500) {
      temp = 60;
    } else if (this.state.widthHorizontalBar > 400) {
      temp = 50;
    } else if (this.state.widthHorizontalBar > 300) {
      temp = 40;
    } else if (this.state.widthHorizontalBar > 200) {
      temp = 30;
    } else if (this.state.widthHorizontalBar > 100) {
      temp = 20;
    } else {
      temp = 10;
    }
    let majorStops = stops[58793]
      .sort((a, b) => b.duration - a.duration) //Decending Order Sorted Stops
      .map((value, index) => {
        console.log(temp);
        if (temp-- > 0) {
          //Only temp values selected from array
          return {
            stopage: value.duration,
            timeStartHalt: value.start_timestamp
          };
        }
      })
      .filter(n => n);

    console.log(majorStops);
    let widthS = [],
      marginL = [];
    let i, j;
    for (
      i = 0;
      moment(data.gps.ist_timestamp, "YYYY-MM-DD HH:mm:ss") >= //loop should run until gps time greater than tolls_h time
      moment(data.tolls_h[i], "YYYY-MM-DD HH:mm:ss");
      i++
    ) {
      for (j = 0; j < majorStops.length; j++) {
        if (
          moment(majorStops[j].timeStartHalt, "YYYY-MM-DD HH:mm:ss") >= //checking between which toll the
            moment(data.tolls_h[i], "YYYY-MM-DD HH:mm:ss") && //  major stoppage lies and then calc
          moment(majorStops[j].timeStartHalt, "YYYY-MM-DD HH:mm:ss") <= //  its margin from left side
            moment(data.tolls_h[i + 1], "YYYY-MM-DD HH:mm:ss")
        ) {
          widthS.push((this.state.width * majorStops[j].stopage) / 216000);
          marginL.push(this.state.width * i);
        }
      }

      this.setState({ widthOfStops: widthS, marginsLeftForDates: marginL });
    }
  }

  render() {
    const {
      width,
      datesDisplayWidth,
      datesDisplay,
      hover,
      indexHover,
      widthOfStops,
      marginsLeftForDates,
      widthGreyBar
    } = this.state;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const styleEta = {
      marginLeft: this.state.width * (index + 1) - 70 + "em",
      textAlign: "center",
      border: "1em solid black",
      width: "15%",
      height: "20em",
      marginTop: "80em"
    };

    const styleEnd = {
      marginLeft: "980em",
      textAlign: "center",
      border: "1em solid black",
      width: "70em",
      height: "20em",
      position: "absolute",
      marginTop: "80em"
    };

    const styleBeg = {
      marginLeft: "-20em",
      textAlign: "center",
      border: "1em solid black",
      width: "70em",
      height: "20em",
      position: "absolute",
      marginTop: "80em"
    };

    const styling = {
      width: this.state.width - 10 + "em",
      height: "2em",
      marginTop: "15em"
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
      <div className="container" style={{ overflow: "auto" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={styleEta}>69.9% Completed</div>
          <div style={styleEnd}>
            {moment(new Date(data.trip.eta)).format("DD/MM")}
          </div>
          <div style={styleBeg} />
        </div>
        {widthOfStops &&
          widthOfStops.map((value, index) => {
            let styling = {
              width: widthOfStops[index] + "em",
              height: "10em",
              marginTop: "10em"
            };
            return (
              <div
                style={{
                  position: "absolute",
                  height: "120em",
                  marginLeft: 15 + marginsLeftForDates[index] + "em"
                }}
              >
                <svg className="chart" style={styling}>
                  <g className="bar">
                    <rect
                      className="rectangleBar"
                      style={{
                        height: "10em",
                        width: "100%",
                        fill: "grey"
                      }}
                    />
                  </g>
                </svg>
              </div>
            );
          })}
        <div className="HorizontalBars">
          <div
            style={{
              borderRight: "1em solid black",
              width: "15em"
            }}
          />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span
              style={{
                display: "flex",
                flexDirection: "row",
                whiteSpace: "nowrap",
                width: "1000em"
              }}
            >
              {data.tolls_h.map((value, index) => {
                if (
                  moment(value, "YYYY-MM-DD HH:mm:ss") >=
                    moment(data.tolls_h[20], "YYYY-MM-DD HH:mm:ss") &&
                  moment(data.gps.ist_timestamp, "YYYY-MM-DD HH:mm:ss") <
                    moment(data.trip.eta, "YYYY-MM-DD HH:mm:ss")
                ) {
                  this.updateIndex(index);
                  return (
                    <div
                      className="DandaEtaBox"
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <svg className="chart" style={styling}>
                        <g className="bar">
                          <rect
                            className="rectangleBar"
                            style={{
                              height: "10em",
                              width: "100%",
                              fill: "blue"
                            }}
                          />
                        </g>
                      </svg>
                      <div
                        onMouseEnter={() => this.onHoverEnter(index)}
                        onMouseLeave={() => this.onHoverExit()}
                        style={{
                          border: "1em solid black",
                          backgroundColor:
                            status[index] === "Delayed"
                              ? "#ff0000"
                              : status[index] === "OnTime"
                                ? "#7CFC00"
                                : "#00BFFF",
                          height: "10em",
                          width: "10em",
                          marginTop: "10em",
                          borderRadius: "100%"
                        }}
                      />
                      <svg
                        className="chart"
                        style={{
                          width: "1em",
                          height: "15em",
                          position: "absolute",
                          marginLeft: this.state.width + "em"
                        }}
                      >
                        <g className="Box_Danda">
                          <rect
                            className="rectangleBar"
                            style={{
                              height: "15em",
                              width: "100%",
                              fill: "black"
                            }}
                          />
                        </g>
                      </svg>
                    </div>
                  );
                }

                if (index >= 0 && index < data.tolls_h.length) {
                  if (
                    moment(data.gps.ist_timestamp, "YYYY-MM-DD HH:mm:ss") >
                    moment(value, "YYYY-MM-DD HH:mm:ss")
                  ) {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: this.state.width + "em"
                        }}
                      >
                        <svg className="chart" style={styling}>
                          <g className="bar">
                            <rect
                              className="rectangleBar"
                              style={{
                                height: "5em",
                                width: "100%",
                                fill: "blue"
                              }}
                            />
                          </g>
                        </svg>
                        <div
                          onMouseEnter={() => this.onHoverEnter(index)}
                          onMouseLeave={() => this.onHoverExit()}
                          style={{
                            border: "1em solid black",
                            backgroundColor:
                              status[index] === "Delayed"
                                ? "#ff0000"
                                : status[index] === "OnTime"
                                  ? "#7CFC00"
                                  : "#00BFFF",
                            height: "10em",
                            width: "10em",
                            marginTop: "10em",
                            borderRadius: "100%"
                          }}
                        />
                      </div>
                    );
                  }
                }
              })}
              <svg
                className="chart"
                style={{
                  width: this.state.widthGreyBar + "em",
                  height: "2em",
                  marginTop: "15em"
                }}
              >
                <g>
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="grey"
                    strokeWidth="32"
                    strokeDasharray="5,5"
                  />
                </g>
              </svg>
            </span>
          </div>
          <div
            style={{
              borderLeft: "1em solid black",
              width: "15em"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          {datesDisplayWidth.map((value, index) => {
            return (
              <div
                style={{
                  width: datesDisplayWidth[index] * width + "em",
                  textAlign: "left"
                  // index === 0
                  // ? "left"
                  // : index === datesDisplayWidth.length - 1
                  //   ? "right"
                  //   : "center"
                }}
              >
                {moment(new Date(datesDisplay[index])).format("DD/MM")}
              </div>
            );
          })}
        </div>
        {hover && (
          <div
            className="w3-animate-left"
            style={{
              marginLeft:
                (indexHover * width - 70 < 0 ? 0 : indexHover * width - 70) +
                "em",
              marginTop: "10em",
              textAlign: "center",
              width: "270em",
              textAlign: "right",
              whiteSpace: "nowrap",
              border: "1em solid black",
              borderRadius: "3%",
              paddingRight: "3em"
            }}
          >
            <b>Actual Time:</b>{" "}
            {act_time[indexHover].format("YYYY-MM-DD HH:mm:ss")}
            <br />
            <b>Scheduled Time:</b>{" "}
            {scheduled_time[indexHover].format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(<EtaNew />, document.getElementById("root"));
