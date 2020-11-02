import { decodeFromCompressedBase64, initWebAssembly } from "hdr-histogram-js";

const loadGoogleChart = () =>
  new Promise((resolve) => {
    const body = document.getElementsByTagName("body")[0];
    const script = document.createElement("script");
    script.src = "https://www.google.com/jsapi";
    script.type = "text/javascript";
    console.log("start load google");
    script.onload = function () {
      console.log("load google");
      window.google.charts.load("current", {
        packages: ["corechart"],
      });
      window.google.charts.setOnLoadCallback(() => {
        console.log("end load google");
        resolve();
      });
    };
    body.appendChild(script);
  });

export default class HdrHistogramWidget {
  maxPercentile: number;
  rangeValue: number;
  chartData: any;

  static init() {
    return Promise.all([loadGoogleChart(), initWebAssembly()]);
  }

  static async display(
    data: any = location,
    unitText: string = "milliseconds",
    chartElement: HTMLElement = document.body
  ) {
    await HdrHistogramWidget.init();

    if (typeof data === "string") {
      data = { "": data };
    }

    unitText = unitText || "milliseconds";
    if (data.search && data.protocol) {
      const params = new URLSearchParams(data.search);
      let hasData = false;
      data = {};
      params.forEach((value, key) => {
        if (key === "unitText") {
          unitText = value;
        } else if (key.startsWith("data.")) {
          hasData = true;
          data[key.substring(5)] = value;
        }
      });
      if (!hasData) {
        throw new Error("No data found in '" + params + "'");
      }
    }
    const widget = new HdrHistogramWidget(data, unitText, chartElement);
    widget.render();
    return widget;
  }

  constructor(
    data: any,
    private unitText = "milliseconds",
    private chartElement: HTMLElement = document.body
  ) {
    let series: any[][] = [];
    Object.keys(data).forEach((name) => {
      if (data[name].startsWith("HIST")) {
        console.log("Will try base64 decoding on " + name);
        const histogram = decodeFromCompressedBase64(data[name], 32, true);
        const histoOutput = histogram.outputPercentileDistribution();
        series = appendDataSeries(histoOutput, name, series);
      } else {
        console.log("Good old histogram output parsing for " + name);
        series = appendDataSeries(data[name], name, series);
      }
    });

    this.chartData = google.visualization.arrayToDataTable(series);

    this.maxPercentile = 1000000;
    this.rangeValue = 7;

    this.render = this.render.bind(this);
    this.showValue = this.showValue.bind(this);
  }

  render() {
    var ticks = [
      { v: 1, f: "0%" },
      { v: 10, f: "90%" },
      { v: 100, f: "99%" },
      { v: 1000, f: "99.9%" },
      { v: 10000, f: "99.99%" },
      { v: 100000, f: "99.999%" },
      { v: 1000000, f: "99.9999%" },
      { v: 10000000, f: "99.99999%" },
      { v: 100000000, f: "99.999999%" },
    ];

    var options = {
      title: "Latency by Percentile Distribution",
      height: 480,
      //            hAxis: {title: 'Percentile', minValue: 0, logScale: true, ticks:ticks },
      hAxis: {
        title: "Percentile",
        minValue: 1,
        logScale: true,
        ticks: ticks,
        viewWindowMode: "explicit",
        viewWindow: {
          max: this.maxPercentile,
          min: 1,
        },
      },
      vAxis: { title: "Latency (" + this.unitText + ")", minValue: 0 },
      legend: { position: "bottom" },
    };

    const chart = new google.visualization.LineChart(this.chartElement);

    // add tooptips with correct percentile text to data:
    var columns: any[] = [0];
    const unitText = this.unitText;
    for (var i = 1; i < this.chartData.getNumberOfColumns(); i++) {
      columns.push(i);
      columns.push({
        type: "string",
        properties: {
          role: "tooltip",
        },
        calc: (function (j) {
          return function (dt: any, row: any) {
            var percentile = 100.0 - 100.0 / dt.getValue(row, 0);
            return (
              dt.getColumnLabel(j) +
              ": " +
              percentile.toPrecision(7) +
              "%'ile = " +
              dt.getValue(row, j) +
              " " +
              unitText
            );
          };
        })(i),
      });
    }
    var view = new google.visualization.DataView(this.chartData);
    view.setColumns(columns);

    chart.draw(view, options);

    this.chartElement.innerHTML += `<p style="text-align: center">Percentile range: 
      <input type="range" style="width: 500px" min="1" max="8" value="${this.rangeValue}" step="1" />
      <span>99.99999%</span>
      </p>`;

    this.rangeInput.onchange = this.showValue;
  }

  showValue() {
    this.rangeValue = Number(this.rangeInput.value);
    const x = Math.pow(10, this.rangeValue);
    const percentile = 100.0 - 100.0 / x;
    this.rangeSpan.innerHTML = percentile + "%";
    this.maxPercentile = x;
    this.render();
  }

  get rangeInput() {
    return this.chartElement.getElementsByTagName("input")[0];
  }
  get rangeSpan() {
    return this.chartElement.getElementsByTagName("span")[0];
  }
}

function appendDataSeries(
  histo: string,
  name: string,
  dataSeries: any[][]
): any[][] {
  var series;
  var seriesCount;
  if (dataSeries.length == 0) {
    series = [["X", name]];
    seriesCount = 1;
  } else {
    series = dataSeries;
    series[0].push(name);
    seriesCount = series[0].length - 1;
  }

  var lines = histo.split("\n");

  var seriesIndex = 1;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var values = line.trim().split(/[ ]+/);

    if (line[0] != "#" && values.length == 4) {
      var y = parseFloat(values[0]);
      var x = parseFloat(values[3]);

      if (!isNaN(x) && !isNaN(y)) {
        if (seriesIndex >= series.length) {
          series.push([x]);
        }

        while (series[seriesIndex].length < seriesCount) {
          series[seriesIndex].push(null);
        }

        series[seriesIndex].push(y);
        seriesIndex++;
      }
    }
  }

  while (seriesIndex < series.length) {
    series[seriesIndex].push(null);
    seriesIndex++;
  }

  return series;
}
