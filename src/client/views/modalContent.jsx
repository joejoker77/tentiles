import React, {Component} from 'react';
import PropTypes from 'prop-types';

export class ModalContent extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className="buy-modal">
                <h2>Buy tile # {this.props.index}
                    <span><b>your eth address:</b> {this.props.coinbase}</span>
                </h2>
                <p>The current buying price for this tile is <b>1</b> ETH.</p>
                <p>If someone decides to snatch the tile away from you, you will be paid  <b>2</b> ETH.</p>
                <h3>or</h3>
                <p>You can buy this tile forever and decide</p>
                <p>when you can sell it and set individual sale price. Price: <b>10</b> ETH</p>
                <button
                    className="buy-tile"
                    onClick={this.props.openEditor}
                >Buy!</button>
                <button
                    className="buy-now-tile"
                    onClick={this.props.openEditor}
                >Buy now!</button>
                <p className="footnote">* if someone else outbid you during this time, your ETH will be refunded.</p>
            </div>
        );
    }
}
ModalContent.propTypes = {
    index     : PropTypes.number.isRequired,
    owned     : PropTypes.bool.isRequired,
    coinbase  : PropTypes.string.isRequired,
    openEditor: PropTypes.func.isRequired
};
export default ModalContent;