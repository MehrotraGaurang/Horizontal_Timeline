import React, { Component } from "react";
import ReactDOM from "react-dom";
import data from "./data.json";
import moment from "moment";

class EtaNew extends Component {
  state = {
    width: [],
    hover: false,
    index: ""
  };

  componentDidMount() {
    let widthDays = data.tolls_h
      .map((value, index) => this.calcWidth(value, index))
      .filter(n => n);
    this.setState(state => ({
      width: [...state.width, ...widthDays]
    }));
  }

  calcWidth(trip, index) {
    if (index >= 0 && index <= data.tolls_h.length) {
      const dateStart = moment(new Date(trip), "YYYY-MM-DD HH:mm:ss");
      const dateEnd = moment(
        new Date(data.tolls_h[index + 1]),
        "YYYY-MM-DD HH:mm:ss"
      );

      let widthDays = dateEnd.diff(dateStart, "hours");

      if (widthDays < 1) {
        widthDays = 1;
      } else if (widthDays > 7) {
        widthDays = 7;
      }
      return widthDays;
    }
  }

  onHandlePrevClick() {
    this.refs.HorizontalArray.scrollBy(-400, 0);
  }

  onHandleNextClick() {
    this.refs.HorizontalArray.scrollBy(400, 0);
  }

  onHandleHoverEnter(index) {
    this.setState({
      hover: true,
      index: index
    });
  }

  onHandleHoverExit() {
    this.setState({
      hover: false
    });
  }

  render() {
    const { width, hover, index } = this.state;

    let act_time = data.tolls_a.map((value, index) => moment(value.exit_time));
    console.log(act_time);
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

    let styleWidth = width.map((value, index) => ({
      width: 100 * value + "px",
      height: "20px",
      textAlign: "right",
      borderRight: "1px solid black",
      display: "inline-block"
    }));

    let styleBar = data.tolls_a.map((value, index) => ({
      width: 100 * width[index] + "px",
      height: "20px",
      fill: value.color
    }));

    return (
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-md-1"
            id="prev"
            onClick={() => this.onHandlePrevClick()}
            style={{
              display: "inline-block",
              left: 0,
              padding: "5px",
              textAlign: "center",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            <i className="material-icons" style={{ fontSize: "54px" }}>
              arrow_left
            </i>
          </div>
          <div
            className="col-md-10"
            id="menu"
            style={{
              position: "relative",
              overflowX: "hidden",
              whiteSpace: "nowrap",
              display: "block"
            }}
          >
            <div
              className="row"
              ref="HorizontalArray"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                scrollBehavior: "smooth"
              }}
            >
              {data.tolls_h.map((value, index) => (
                <span key={index} style={styleWidth[index]}>
                  {moment(value).format("YYYY-MM-DD")}
                </span>
              ))}
              <br />
              {data.tolls_h.map((value, index) => (
                <span
                  key={index}
                  onMouseEnter={() => this.onHandleHoverEnter(index)}
                  onMouseLeave={() => this.onHandleHoverExit()}
                  style={{
                    width: 100 * width[index] + "px",
                    height: "20px",
                    display: "inline-block",
                    borderRight: "1px solid white"
                  }}
                >
                  <svg
                    className="chart"
                    style={{
                      width: 100 * width[index] + "px",
                      height: "20px",
                      role: "img"
                    }}
                  >
                    <g className="bar">
                      <rect style={styleBar[index]} />
                    </g>
                  </svg>
                </span>
              ))}
            </div>
          </div>
          <div
            className="col-md-1"
            id="next"
            onClick={() => this.onHandleNextClick()}
            style={{
              display: "inline-block",
              padding: "5px",
              textAlign: "center",
              right: 0,
              position: "absolute",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            <i className="material-icons" style={{ fontSize: "54px" }}>
              arrow_right
            </i>
          </div>
        </div>
        {hover && (
          <div style={{ marginLeft: "50%" }}>
            <div>{data.tolls_a[index].type}</div>
            <div>{data.tolls_a[index].name}</div>
            <div style={{ textAlign: "justify" }}>
              Actual Time: {act_time[index].format("YYYY-MM-DD HH:mm:ss")}
            </div>
            <div style={{ textAlign: "justify" }}>
              Scheduled Time:{" "}
              {scheduled_time[index].format("YYYY-MM-DD HH:mm:ss")}
            </div>
            <div>Status is: {status[index]}</div>
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(<EtaNew />, document.getElementById("root"));
