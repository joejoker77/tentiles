import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Col} from 'react-bootstrap';
import stubImg from '../images/stub.png';

export class Tile extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.tile.settings === ''){
            return (
                <Col className="col-lg-5ths tile view view-ninth">
                    <img src={stubImg} />
                    <div className="mask mask-1">&nbsp;</div>
                    <div className="mask mask-2">&nbsp;</div>
                    <div className="content">
                        <div className="flexbox">
                            <h2>Become the first owner!</h2>
                            <p><span>1 ETH</span></p>
                            <a className="info"
                                onClick={(event) => this.props.modalHandler(
                                    event,
                                    this.props.keyTile,
                                    false,
                                    this.props.size
                                )}>Buy now!</a>
                        </div>
                    </div>
                </Col>
            );
        }else{
            return null;
        }
    }
}
Tile.propTypes = {
    tile: PropTypes.object.isRequired,
    keyTile: PropTypes.number.isRequired,
    modalHandler: PropTypes.func.isRequired,
    size: PropTypes.number.isRequired
};
export default Tile;