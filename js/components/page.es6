import { h, render, Component } from "preact"
import classNames from "classnames"

export default class Page extends Component {
  constructor(props) {
    super(props)
    this.state = { }
  }


  render() {
    return <div class="paintcolors_main">
      hello world!
    </div>
  }
}
