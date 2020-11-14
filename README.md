# HdrHistogram Widget

The purpose of this JavaScript widget is to easily visualize latencies recorded with HdrHistogram. The widget does not depend on any dependencies except HdrHistogramJS and hence may be used on any website.

![screenshot](screenshot.png)

This widget allows to plot histograms encoded to base64, whatever the HdrHistogram language/platform used (Java, JS, C#, Rust, Go...)

## Usage

### Passing data in a URL

If you are in a hurry, you can generate an URL containing the histogram(s) you want to plot as a base64 url encoded string(s). The URL should look like the one below:

```ts
`https://hdrhistogram.github.io/HdrHistogramWidget?unitText=${"ms"}&data.name=${"HISTFAAAA..."}&data.other_name=${"HISTFAAAA..."}`;
```

Here is a [working example](https://hdrhistogram.github.io/HdrHistogramWidget?unitText=ms&data.latency=HISTFAAAAkV42i1NTWgTQRTe93Yyna7jdEzTbaghpjWsEpaQxhLXumxLLEuRGpallJCDhxB6qXqQUsSDFFlDwRzEQikhJ%2BnFIOLFgkWk9NCz1LtIDx6lIPTixdm2b%2BbN%2B37mvZeJNoc1DTvaeSQuKlxUnDk5B6OnA9%2BO2O%2BdgY8%2FyMkR230N75zuys%2FJrXt7ma2r7cmNkXby0%2FVj89j8dSMa3sls8wN2yt8kvuvrdB8PsEv%2BwKG%2BD1%2FhA%2FZgHSJsunuw8HTKW6sstKxiaM%2BnJ7ycVS0Wl6ZWS%2Fmm4z5q%2BF3wX7gTQa60nCkGhelCvn7TCtOpmj1XKAXTE82i24FaG6puD%2FxKH2qNlzC7C%2F7DCMJKFyx%2FzY%2FAnV0LnB7Uwz4sbIAXbkNY24K5pT64fQgaPVhcPIR66y0EHfCrEQRhB%2BaDVSeCqtrf9J75Lct57tnNOXu10nLtesVdLpQb5fuW0yw5T0rTXt6rmPO5vJ2RpbGyJfPp7KzIWrmylDaX2WQqzS2ZLnCRFWbBHONcSDpGpTAEM7jB0zyZEaakWWokBZNoEJbkJEVJiglpMMYkJ4KajJnESHGRoianklBBDK4eyhnjBKUhKSWUKogaIUhUMMGQKk6QMko0olPU2JmvM6US1NVFxdWhGAfRY0FTQCMJvLBiFc%2FuuYYJBRMxH8QrKvGSKpdxHIdwWOUdZYzjJipyG2fwsTJXEAdwBB8o55b6kYi7B1XbOOI1tUBXOapWxiPjobEypJRXgHcVmcH3gF%2BkmvK3jfjvM%2BB%2FgsBx8g%3D%3D)

### Writing some code

This library is packaged as a UMD module, hence you can use it directly
from JavaScript within a browser. To do so, you can simply include the bundle file from github's release page:

```html
<script src="https://github.com/HdrHistogram/HdrHistogramWidget/releases/download/1.0.1/hdr-histogram-widget.umd.js"></script>
```

If you prefer using npm:

```sh
  npm i hdr-histogram-widget
```

Then you can use the HdrHistogramWidget class which provides a convenient static method _display()_:

```ts
import HdrHistogramWidget from "hdr-histogram-widget"; // not needed with the umd package

HdrHistogramWidget.display("HISTFAAAATR42i1M...");
```

You need to provide a base64 encoded histogram to this _display()_ method.

If you need to display several histograms, you need to provide an object as shown below:

```ts
HdrHistogramWidget.display({
  "Latencies for option1": "HISTFAAAATR42i1M...",
  "Latencies for option2": "HISTFAAAAXt42i1O...",
  "Latencies for option3": "HISTFAAAAXt42i1O...",
});
```

By default the graph is displayed within the _body_ of the page and the unit is 'milliseconds'. If the default behavior does not fit your needs, you can use two optionnal parameters:

```ts
const data = {
  'Latencies for option1': 'HISTFAAAATR42i1M...',
  ...
}
HdrHistogramWidget.display(
  data,
  'nano seconds',                   // default is milliseconds
  document.getElementById("graph")  // default is document.body
);
```
