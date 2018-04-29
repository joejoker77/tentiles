import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row} from 'reactstrap';
import Tile from './tile';

export class Tiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tileSize: 0
        }
    }

    componentDidMount(){
        let elements = document.getElementsByClassName('tile'),
            width    = elements[0].offsetWidth;

        this.setState({tileSize: width});

        for(let i=0; i<10; i++){
           elements[i].style.height = width + 'px';
        }
    }
    render() {

        let $this           = this,
            firstLineTiles  = this.props.tiles.slice(5),
            secondLineTiles = this.props.tiles.slice(-5);

        return (
            <div>
                <Row className="tiles">
                    {Array.prototype.map.call(firstLineTiles, function (value, index) {
                        return <Tile
                            size={$this.state.tileSize}
                            key={index}
                            tile={value}
                            keyTile={index+1}
                            modalHandler={$this.props.modalHandler}
                        />
                    })}
                </Row>
                <Row className="tiles">
                    {Array.prototype.map.call(secondLineTiles, function (value, index) {
                        return <Tile
                            size={$this.state.tileSize}
                            key={index}
                            tile={value}
                            keyTile={index+6}
                            modalHandler={$this.props.modalHandler}
                        />
                    })}
                </Row>
            </div>
        );
    }
}
Tiles.propTypes = {
    tiles: PropTypes.array.isRequired,
    modalHandler: PropTypes.func.isRequired
};
export default Tiles;