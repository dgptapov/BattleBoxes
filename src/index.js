import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={'square ' + props.value} onClick={props.onClick}>
    </button>
  );
}

export class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(100).fill(null),
    };
    this.shipList = ["I", "L", ".", "."]
    this.IShipPositionOptions = [
      [0, 1, 2, 3],
      [0, 10, 20, 30]
    ]
    this.LShipPositionOptions = [
      [10, 0, 1, 2],
      [-10, 0, 1, 2],
      [0, 1, 2, 12],
      [0, 1, 2, -8],
      [0, 10, 20, 21],
      [0, 10, 20, 19],
      [-1, 0, 10, 20],
      [1, 0, 10, 20]
    ]
    this.staticCounter = 0;
  }

  handleClick(i) {
    this.salvo(i);
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
        key={i}
        />
    );
  }

  randomizeShipPosition = function (shipType) {
    if (shipType === ".") {
      return [0];
    } else if (shipType === "I") {
      return this.IShipPositionOptions[Math.floor((Math.random() * this.IShipPositionOptions.length))];
    } else {
      return this.LShipPositionOptions[Math.floor((Math.random() * this.LShipPositionOptions.length))];
    }

  }

  checkFeeSpace(shipCoords, field) {


    const lookupMatrix = [0, -1, 1, -10, 10, 9, 11, -9, -11];
    let position = Math.floor(Math.random() * 99);


    for (let f = 0; f < shipCoords.length; f++) {
      if (position + shipCoords[f] > 99 || position + shipCoords[f] < 0) {
        return this.checkFeeSpace(shipCoords, field);
      }
      if ((shipCoords[f] > 0 && (position + shipCoords[f]) % 10 === 0)
        || (shipCoords[f] < 0 && (position + shipCoords[f]) % 10 === 1)) {
        return this.checkFeeSpace(shipCoords, field);
      }

      for (let i = 0; i < lookupMatrix.length; i++) {
        if ([-9, 1, 11].includes(lookupMatrix[i]) && (position + shipCoords[f]) % 10 === 9) continue;
        if ([-11, -1, 9].includes(lookupMatrix[i]) && (position + shipCoords[f]) % 10 === 0) continue;
        if (lookupMatrix[i] < 0 && position + shipCoords[f] < 10) continue;
        if (lookupMatrix[i] > 89 && position + shipCoords[f] > 10) continue;

        if (field[position + shipCoords[f] + lookupMatrix[i]] === "filled") return this.checkFeeSpace(shipCoords, field);

      }

    }
    this.staticCounter = 0;
    return position;
  }

  placeShip(shipCoords, field) {

    let position = this.checkFeeSpace(shipCoords, field);
    for (let f = 0; f < shipCoords.length; f++) {
      field[position + shipCoords[f]] = "filled";
    }
  }

  fillShips() {
    this.state = {
      squares: Array(100).fill(null),
    };
    const squares = this.state.squares.slice();
    for (let f = 0; f < this.shipList.length; f++) {
      let shipShape = this.randomizeShipPosition(this.shipList[f]);
      this.placeShip(shipShape, squares);
    }
    this.setState({ squares: squares });
  }

  isGameLost(squares) {
    for (let f = 0; f < squares.length; f++) {
      if (squares[f] === "filled") return false;
    }
    return true;
  }

  salvo(target) {
    const squares = this.state.squares.slice();
    if (squares[target] === "hit") {
      return;
    }
    if (!squares[target]) {
      squares[target] = "hit";
    }
    if (squares[target] === "filled") {
      this.destroyShip(target, squares);
      squares[target] += " hit";
    }
    this.setState({ squares: squares });
    return this.isGameLost(squares);
  }
  destroyShip(position, field) {
    const matrix = [0, -1, 10, 1, -10];
    for (let f = 0; f < matrix.length; f++) {

      if (position % 10 === 0 && matrix[f] === -1) continue;
      if (position % 10 === 9 && matrix[f] === 1) continue;


      if (field[position + matrix[f]] === "filled") {
        field[position + matrix[f]] = "destroyed";
        this.destroyShip(position + matrix[f], field);
      }
    }
  }

  render() {
    return (

      <div>

        <div className="board">
          {
            Array.from(Array(10).keys()).map((row) => {
              return <div key={row} className="board-row">
                {
                  Array.from(Array(10).keys()).map((col) => {
                    return this.renderSquare(row * 10 + col)
                  })
                }
              </div>

            })
          }
        </div>

      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      isFireHidden: true
    };
    this.toggleFireButton.bind(this);
  }

  refreshBoard() {
    this.refs.childBoard.fillShips();
    this.toggleFireButton(false);

  }
  carnage() {

    let target = Math.floor(Math.random() * 99);

    if (this.refs.childBoard.salvo(target)) {
      this.setState({
        showPopup: !this.state.showPopup
      });
    }
  }

  toggleFireButton(state) {
    let newState = state ? !this.state.isFireHidden : state;
    this.setState({
      isFireHidden: newState
    })
  }
  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup,
      isFireHidden: true
    });
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board ref="childBoard" />
        </div>
        <div className="game-info">
          <button className="myButton" onClick={() => this.refreshBoard()}>Fill Ships</button>
          {!this.state.isFireHidden && <button className='myButton fireButton'
            onClick={() => this.carnage()}>Open Fire</button>}

        </div>
        {this.state.showPopup ?
          <Popup ref="popup"
            text='A strange game,the only winning move is not to play'
            closePopup={this.togglePopup.bind(this)}
            />
          : null
        }
      </div>
    );
  }
}

class Popup extends React.Component  {
  render() {
    return (
      <div className='popup'>
        <div className='popup_inner'>
          <h1>{this.props.text}</h1>
          <button className="myButton popUpButton" onClick={this.props.closePopup}>Close</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
