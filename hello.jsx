import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 'World!'
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    })
  }

  render() {  
    return (
      <div>
        <input type="text" value={this.state.value} onChange={this.handleChange}  />
        <h1>Hello, {this.state.value}</h1>
      </div>
    )
  }
}

ReactDOM.render(<Hello />, document.getElementById('hello'));
