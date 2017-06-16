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

export default class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gridSize: 3,
      minValue: 0,
      minSaturation: 0,
    }
  }

  render() {
    return <div class="paintcolors_main">
      {this.renderGrid()}
      {this.renderGridControls()}
    </div>
  }

  nextColor() {
    return [
      Math.random(),
      Math.random() * (1 - this.state.minSaturation) + this.state.minSaturation,
      Math.random() * (1 - this.state.minValue) + this.state.minValue,
    ]
  }

  renderGrid() {
    let cells = []
    for (let i = 0; i < this.state.gridSize*this.state.gridSize; i++) {
      let size = 100/this.state.gridSize
      let color = hsvToRgb(...this.nextColor())

      cells.push(<div class="cell" style={{
        width: `${size}%`,
        height: `${size}%`,
        backgroundColor: `rgb(${color.join(", ")})`,
      }}></div>)
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
