import { h, render, Component } from "preact"
import classNames from "classnames"

function hsvToRgb(h,s,v) {
  return [0,0,0]
}

export default class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gridSize: 3
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
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ]
  }

  renderGrid() {
    let cells = []
    for (let i = 0; i < this.state.gridSize*this.state.gridSize; i++) {
      let size = 100/this.state.gridSize
      let color = this.nextColor()

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

  renderGridControls() {
    return <div class="grid_controls">
      <label>
        Grid size
        <input
          value={this.state.gridSize}
          onChange={(e) => {
            this.setState({
              gridSize: +e.target.value
            })
          }}
          type="range" min="1" max="10" />
      </label>

    </div>
  }
}
