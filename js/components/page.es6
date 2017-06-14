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

  renderGrid() {
    let cells = []
    for (let i = 0; i < this.state.gridSize*this.state.gridSize; i++) {
      let size = 100/this.state.gridSize

      cells.push(<div class="cell" style={{
        width: `${size}%`,
        height: `${size}%`,
        backgroundColor: "rgb(29,101,74)",
      }}></div>)
    }

    return <div class="grid">
      {cells}
    </div>
  }

  renderGridControls() {
    return <div class="grid_controls"></div>
  }
}
