import { h, render, Component } from "preact"
import classNames from "classnames"
import {MersenneTwister} from "mersennetwister"

// from https://gist.github.com/mjackson/5311256
function hsvToRgb(h, s, v) {
  var r, g, b

  var i = Math.floor(h * 6)
  var f = h * 6 - i
  var p = v * (1 - s)
  var q = v * (1 - f * s)
  var t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break
    case 1: r = q, g = v, b = p; break
    case 2: r = p, g = v, b = t; break
    case 3: r = p, g = q, b = v; break
    case 4: r = t, g = p, b = v; break
    case 5: r = v, g = p, b = q; break
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ]
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

// colors must be in hsv
function mixColors(a, b, r) {
  r = 1 - r

  // see if it wraps
  let h1 = a[0]
  let h2 = b[0]

  if (Math.abs(h1 - h2) > 0.5) {
    if (h1 < h2) {
      h1 += 1
    } else {
      h2 += 1
    }
  }

  let h = h1 * r + h2 * (1 - r)

  while (h > 1) {
    h -= 1
  }

  let s = a[1] * r + b[1] * (1 - r)
  let v = a[2] * r + b[2] * (1 - r)

  return [h,s,v]
}

// mix in rgb space
function mixColorsRGB(a, b, r) {
}

export default class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gridSize: 3,
      minValue: 0,
      minSaturation: 0,
      mode: "corners",
      seed: new Date().getTime()
    }
  }

  render() {
    this.generator = new MersenneTwister(this.state.seed)
    this.cache = {}
    return <div class="paintcolors_main">
      {this.renderGrid()}
      {this.renderGridControls()}
    </div>
  }

  getNColors(count) {
    let out = []
    for (let i = 0; i < count; i ++) {
      out.push([
        this.generator.real(),
        this.generator.real() * (1 - this.state.minSaturation) + this.state.minSaturation,
        this.generator.real() * (1 - this.state.minValue) + this.state.minValue,
      ])
    }

    return out
  }

  nextColor(i) {
    let x = (i % this.state.gridSize) / (this.state.gridSize - 1)
    let y = Math.floor(i / this.state.gridSize) / (this.state.gridSize - 1)

    switch (this.state.mode) {
      case "random":
        return this.getNColors(1)[0]
      case "single":
        if (!this.cache.single) {
          this.cache.single = this.getNColors(1)[0]
        }

        let [h,s,v] = this.cache.single

        return [
          h + x / 10,
          Math.max(s, 0.1) + y / 10,
          Math.max(v, 0.1) + y / 10 + x / 10,
        ]

      case "corners":
        if (!this.cache.corners) {
          this.cache.corners = this.getNColors(4)

          // buggy colors, we end up making a shorter path going the oposite
          // direction. Mix colors should have ability to specify direction
          // this.cache.corners = [
          //   [266/360, 60/100, 49/100],
          //   [130/360, 47/100, 77/100],
          //   [335/360, 70/100, 55/100],
          //   [323/360, 97/100, 23/100],
          // ]
        }

        let [tl, tr, bl, br] = this.cache.corners


        // mix y
        let leftColor = mixColors(tl, bl, y)
        let rightColor = mixColors(tr, br, y)

        return mixColors(leftColor, rightColor, x)
    }
  }

  shuffle() {
    this.setState({
      seed: new Date().getTime()
    })
  }

  renderGrid() {
    let cells = []
    for (let i = 0; i < this.state.gridSize*this.state.gridSize; i++) {
      let size = 100/this.state.gridSize
      let color = this.nextColor(i)

      let renderColor = color.map((v) => v.toFixed(3))
      renderColor[0] = Math.floor(renderColor[0] * 360)

      cells.push(<div class="cell" style={{
        width: `${size}%`,
        height: `${size}%`,
        backgroundColor: `rgb(${hsvToRgb(...color).join(", ")})`,
      }}>
        <div>
          <div>H: {renderColor[0]}</div>
          <div>S: {renderColor[1]}</div>
          <div>V: {renderColor[2]}</div>
        </div>
      </div>)
    }

    return <div class="grid">
      {cells}
    </div>
  }

  renderSlider(opts={}) {
    let update = (e) => {
      this.setState({
        [opts.field]: +e.target.value
      })
    }

    return <label>
      {opts.label}
      <input
        value={this.state[opts.field]}
        onInput={update}
        onChange={update}
        type="range" min={opts.min} max={opts.max} step={opts.step} />
    </label>
  }

  renderGridControls() {
    return <div class="grid_controls">
      <button onClick={e => this.shuffle()}>Shuffle</button>

      <select
        onChange={e => this.setState({mode: e.target.value})}
        value={this.state.mode}
      >
        <option value="random">random</option>
        <option value="corners">corners</option>
        <option value="single">single</option>
      </select>

      <div>
        {this.renderSlider({
          label: "Grid size",
          field: "gridSize",
          min: 1,
          max: 20,
        })}
      </div>

      <div>
        {this.renderSlider({
          label: "Min value",
          field: "minValue",
          min: 0,
          max: 1,
          step: "any"
        })}
      </div>

      <div>
        {this.renderSlider({
          label: "Min saturation",
          field: "minSaturation",
          min: 0,
          max: 1,
          step: "any"
        })}
      </div>
    </div>
  }
}
