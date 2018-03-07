import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row} from 'react-bootstrap';
import Tile from './tile';

export class Tiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tileSize: 0
        }
    }

    componentDidMount(){
        let elements = document.getElementsByClassName('col-lg-5ths'),
            width    = elements[0].offsetWidth;

        this.setState({tileSize: width});

        for(let i=0; i<10; i++){
            elements[i].style.height = width + 'px';
        }
    }
    render() {
        let $this = this;
        return (
            <Row className="tiles">
                {Array.prototype.map.call(this.props.tiles, function (value, index) {
                    return <Tile
                        size={$this.state.tileSize}
                        key={index}
                        tile={value}
                        keyTile={index+1}
                        modalHandler={$this.props.modalHandler}
                    />
                })}
            </Row>
        );
    }
}
Tiles.propTypes = {
    tiles: PropTypes.array.isRequired,
    modalHandler: PropTypes.func.isRequired
};
export default Tiles;