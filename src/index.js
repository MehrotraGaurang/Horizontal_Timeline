import React, { Component } from "react";
import ReactDOM from "react-dom";
import data from "./dataFile.json";
import moment from "moment";
// import stops from "./stoppages.json";
import { O_EXCL } from "constants";

let index = "";

function median(values) {
  values.sort((a, b) => a.duration - b.duration);

  if (values.length === 0) return 0;

  let half = Math.floor(values.length / 2);
  console.log(half);
  if (values.length % 2 === 0) return values[half].duration;
  else return (values[half - 1].duration + values[half].duration) / 2.0;
}

class EtaNew extends Component {
  state = {
    width: "",
    marginTolls: [],
    stopsMWidth: [],
    datesDisplay: [],
    hover: false,
    indexHover: "",
    widthHorizontalBar: "",
    widthGreyBar: "",
    widthTimeline: "",
    marginL_Hover: "",
    stopHover: false,
    stopObject: ""
  };

  componentDidMount() {
    setTimeout(this.measureWidth(), 3000); //Supposed to change the width acc to screen width but not doing that!!
  }

  measureWidth() {
    this.setState(
      {
        widthTimeline: this.refs.Timeline.offsetWidth
      },
      () => this.calcHorizontalBarWidth()
    );
  }

  calcHorizontalBarWidth() {
    let width =
      ((new Date(data.gps.ist_timestamp) - new Date(data.tolls_h[0])) /
        (new Date(data.trip.eta) - new Date(data.tolls_h[0]))) *
      this.state.widthTimeline;
    console.log(width);
    this.setState(
      {
        widthHorizontalBar: width,
        widthGreyBar: this.state.widthTimeline - width
      },
      () => this.calcWidthForTolls()
    );
  }

  calcWidthForTolls() {
    let dateVar = new Date(data.tolls_h[0]);

    let datesDisplay = [];

    let dateEnd = moment(new Date(data.gps.ist_timestamp), "YYYY-MM-DD").add(
      1,
      "d"
    );
    while (moment(dateVar, "YYYY-MM-DD") <= dateEnd) {
      console.log("HEllo", moment(dateVar, "YYYY-MM-DD").format("YYYY-MM-DD"));
      datesDisplay.push(moment(dateVar, "YYYY-MM-DD").format("YYYY-MM-DD"));
      dateVar = moment(dateVar, "YYYY-MM-DD").add(1, "d");
    }
    console.log(datesDisplay);
    let width = this.state.widthHorizontalBar / datesDisplay.length;

    let marginTolls = data.tolls_h.map((value, index) => {
      return (
        ((new Date(value) - new Date(datesDisplay[0])) / 86400000) * width - 10
      );
    });

    this.setState(
      {
        width: width,
        marginTolls: [...marginTolls],
        datesDisplay: datesDisplay
      },
      () => this.displayGreyBox()
    );
  }

  onHoverEnter(index, value) {
    this.setState({ hover: true, indexHover: index, marginL_Hover: value });
  }

  onHoverExit() {
    this.setState({ hover: false });
  }

  updateIndex(value) {
    index = value;
  }

  displayGreyBox() {
    let temp = Math.floor(this.state.widthHorizontalBar / 100) * 10;

    let majorStops = data.stops[data.trip.id];

    let Median = median(majorStops);

    console.log(Median);
    majorStops = majorStops
      .sort((a, b) => b.duration - a.duration)
      .map((value, index) => {
        if (temp-- > 0 && value.duration > Median) {
          return {
            stopage: value.duration,
            timeStartHalt: value.start_timestamp,
            startTime: value.start_timestamp,
            endTime: value.end_timestamp,
            startLandmark: value.start_landmark,
            distanceTravelled: value.distance_travelled
          };
        }
      })
      .filter(n => n);
    console.log(majorStops);
    let stops_Margin_Width = majorStops.map((value, index) => {
      return {
        widthStop: (this.state.width * value.stopage) / 86400,
        marginStop:
          ((new Date(value.timeStartHalt) -
            new Date(this.state.datesDisplay[0])) /
            86400000) *
          this.state.width,
        startTime: value.startTime,
        endTime: value.endTime,
        startLandmark: value.startLandmark,
        distanceTravelled: value.distanceTravelled
      };
    });

    this.setState({
      stopsMWidth: [...stops_Margin_Width]
    });
  }

  onHandleEnterStop(value) {
    this.setState({
      stopHover: true,
      stopObject: value
    });
  }

  onHandleExitStop() {
    this.setState({
      stopHover: false
    });
  }

  render() {
    const {
      width,
      marginTolls,
      stopsMWidth,
      datesDisplay,
      hover,
      indexHover,
      widthHorizontalBar,
      widthGreyBar,
      widthTimeline,
      marginL_Hover,
      stopObject,
      stopHover
    } = this.state;

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

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const styleEta = {
      marginLeft: widthHorizontalBar - 70 + "px",
      textAlign: "center",
      border: "1px solid black",
      width: "15%",
      height: "20px"
    };

    const styleEnd = {
      marginLeft: this.state.widthTimeline - 30 + "px",
      textAlign: "center",
      border: "1px solid black",
      width: "70px",
      height: "20px",
      position: "absolute"
    };

    const styleBeg = {
      marginLeft: "-2%",
      textAlign: "center",
      border: "1px solid black",
      width: "70px",
      height: "20px",
      position: "absolute"
    };

    const styling = {
      width: widthTimeline + "px",
      height: "2px",
      marginTop: "15px"
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
      <div className="container" style={{ height: "5em" }} ref="Timeline">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={styleEta}>69.9% Completed</div>
          <div style={styleEnd}>
            {moment(new Date(data.trip.eta)).format("DD/MM")}
          </div>
          <div style={styleBeg} />
        </div>
        {stopsMWidth &&
          stopsMWidth.map((value, index) => {
            let styling = {
              width: value.widthStop + "px",
              height: "10px",
              marginTop: "10px"
            };
            return (
              <div
                onMouseEnter={() => this.onHandleEnterStop(value)}
                onMouseLeave={() => this.onHandleExitStop()}
                style={{
                  position: "absolute",
                  marginLeft: 15 + value.marginStop + "px"
                }}
              >
                <svg className="chart" style={styling}>
                  <g className="bar">
                    <rect
                      className="rectangleBar"
                      style={{
                        height: "10px",
                        width: "100%",
                        fill: "grey"
                      }}
                    />
                  </g>
                </svg>
              </div>
            );
          })}

        <div
          className="HorizontalBars"
          style={{ display: "flex", flexDirection: "row", width: "100%" }}
        >
          <div
            style={{
              borderRight: "1px solid black",
              width: "15px",
              height: "20px"
            }}
          />
          {marginTolls &&
            marginTolls.map((value, index) => {
              return (
                <div
                  style={{
                    position: "absolute",
                    marginLeft: value + 15 + "px"
                  }}
                >
                  <div
                    onMouseEnter={() => this.onHoverEnter(index, value)}
                    onMouseLeave={() => this.onHoverExit()}
                    style={{
                      border: "1px solid black",
                      backgroundColor:
                        status[index] === "Delayed"
                          ? "#ff0000"
                          : status[index] === "OnTime"
                            ? "#7CFC00"
                            : "#00BFFF",
                      height: "10px",
                      width: "10px",
                      marginTop: "10px",
                      borderRadius: "100%"
                    }}
                  />
                </div>
              );
            })}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span
              style={{
                display: "flex",
                flexDirection: "row",
                whiteSpace: "nowrap"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: widthHorizontalBar + "px"
                }}
              >
                <svg className="chart" style={styling}>
                  <g className="bar">
                    <rect
                      className="rectangleBar"
                      style={{
                        height: "5px",
                        width: "100%",
                        fill: "blue"
                      }}
                    />
                  </g>
                </svg>
              </div>
              <div
                className="DandaEtaBox"
                style={{ display: "flex", flexDirection: "row" }}
              >
                <svg
                  className="chart"
                  style={{
                    width: "1px",
                    height: "15px",
                    position: "absolute"
                  }}
                >
                  <g className="Box_Danda">
                    <rect
                      className="rectangleBar"
                      style={{
                        height: "15px",
                        width: "100%",
                        fill: "black"
                      }}
                    />
                  </g>
                </svg>
              </div>

              <svg
                className="chart"
                style={{
                  width: widthGreyBar - 1 + "px",
                  height: "2px",
                  marginTop: "15px"
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
              borderLeft: "1px solid black",
              width: "15px",
              height: "20px"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          {datesDisplay.map((value, index) => {
            return (
              <div
                style={{
                  width: width + "px",
                  textAlign: "left"
                  // index === 0
                  // ? "left"
                  // : index === datesDisplayWidth.length - 1
                  //   ? "right"
                  //   : "center"
                }}
              >
                {moment(new Date(value)).format("DD/MM")}
              </div>
            );
          })}
        </div>

        {hover && (
          <div
            className="w3-animate-left"
            style={{
              marginLeft:
                (marginL_Hover - 200 < 0 ? 0 : marginL_Hover - 200) + "px",
              marginTop: "10px",
              textAlign: "center",
              width: "50%",
              textAlign: "right",
              whiteSpace: "nowrap",
              border: "1px solid black",
              borderRadius: "3%",
              paddingRight: "3px"
            }}
          >
            <b>Actual Time:</b>{" "}
            {act_time[indexHover].format("YYYY-MM-DD HH:mm:ss")}
            <b> Scheduled Time:</b>{" "}
            {scheduled_time[indexHover].format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )}

        {stopHover && (
          <div
            className="w3-animate-left"
            style={{
              marginLeft:
                (stopObject.marginStop - 200 < 0
                  ? 0
                  : stopObject.marginStop - 200) + "px",
              marginTop: "10px",
              textAlign: "center",
              whiteSpace: "wrap",
              border: "1px solid black",
              width: "30%",
              paddingRight: "3px"
            }}
          >
            <b>Start Time:</b>
            {stopObject.startTime}
            <br />
            <b> End Time:</b>
            {stopObject.endTime}
            <br />
            <b>Landmark:</b>
            {stopObject.startLandmark}
            <br />
            <b>Distance Travelled:</b>
            {stopObject.distanceTravelled}
            <br />
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(<EtaNew />, document.getElementById("root"));
