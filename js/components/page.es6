import { h, render, Component } from "preact"
import classNames from "classnames"

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

// colors must be in hsv
function mixColors(a, b, r) {
  r = 1 - r

  // see if it wraps
  let h1 = a[0]
  let h2 = b[0]

  if (Math.abs(h1 - h2) > 180) {
    if (h1 < h2) {
      h1 += 360
    } else {
      h2 += 360
    }
  }

  let h = h1 * r + h2 * (1 - r)

  if (h > 360) {
    h -= 360
  }

  let s = a[1] * r + b[1] * (1 - r)
  let v = a[2] * r + b[2] * (1 - r)

  return [h,s,v]
}

export default class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gridSize: 3,
      minValue: 0,
      minSaturation: 0,
      mode: "corners",
    }
  }

  render() {
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
        Math.random(),
        Math.random() * (1 - this.state.minSaturation) + this.state.minSaturation,
        Math.random() * (1 - this.state.minValue) + this.state.minValue,
      ])
    }

    return out
  }

  nextColor(i) {
    switch (this.state.mode) {
      case "random":
        return this.getNColors(1)[0]
      case "corners":
        if (!this.cache.corners) {
          this.cache.corners = this.getNColors(4)
        }

        let [tl, tr, bl, br] = this.cache.corners

        let x = (i % this.state.gridSize) / (this.state.gridSize - 1)
        let y = Math.floor(i / this.state.gridSize) / (this.state.gridSize - 1)

        // mix x component
        let topColor = mixColors(tl, tr, x)
        let bottomColor = mixColors(bl, br, x)
        return mixColors(topColor, bottomColor, y)
    }
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
      <button onClick={e => this.forceUpdate()}>Shuffle</button>
      <div>
        {this.renderSlider({
          label: "Grid size",
          field: "gridSize",
          min: 1,
          max: 10,
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
