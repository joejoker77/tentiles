import React from 'react';
import {Container} from 'reactstrap';
import _ from 'lodash';
import Blockchain from '../utils/blockchain';
import TransactionsStorage from '../utils/transactions-storage';
import ReactModal from 'react-modal';

import Header from './header';
import Tiles from './tiles';
import ModalContent from './modalContent';
import Editor from './editor';

const customStyles = {
    overlay : {
        position       : 'fixed',
        top            : 0,
        left           : 0,
        right          : 0,
        bottom         : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
    },
    content : {
        position               : 'absolute',
        top                    : '50%',
        left                   : '50%',
        right                  : 'auto',
        bottom                 : 'auto',
        marginRight            : '-50%',
        transform              : 'translate(-50%, -50%)',
        border                 : '1px solid #ccc',
        background             : '#fff',
        overflow               : 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius           : '4px',
        outline                : 'none',
        padding                : '20px'

    }
};

ReactModal.setAppElement('#root');

export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.initBlockchain();
        this.state = {
            tiles: [],
            showModal: false,
            activeTile: 0,
            ownedTile:false,
            coinbase: '',
            activeEditor: false,
            settings: {},
            tileSize: 0
        };
        _.bindAll(this, [
            'handleOpenModal',
            'handleCloseModal',
            'openEditor'
        ]);
    }

    componentWillMount() {
        this.transactionsStorage.startChecker(function (type) {
            if(typeof type !== 'undefined') {console.log(type)}
            this.updateData();
        }.bind(this));
    }
    componentWillUnmount() {
        this.transactionsStorage.stopChecker();
    }

    initBlockchain() {
        this.blockchain = new Blockchain();
        this.blockchain.getAddress()
            .then(function (address) {
                this.setState({coinbase: address});
                this.updateData();
            }.bind(this))
            .catch(function (error) {
                console.log(error);
            });

        this.transactionsStorage = new TransactionsStorage(this.blockchain);
    }

    updateData(){
        this.blockchain.getAllTiles().then(function (data) {
            this.setState({tiles: data});
        }.bind(this)).catch(function (error) {
            console.log(error);
        });
    }

    handleOpenModal (event, index, owned, size) {
        this.setState({
            showModal: true,
            activeTile: index,
            ownedTile: owned,
            tileSize: size
        });
    }

    handleCloseModal () {
        this.setState({showModal: false});
    }

    openEditor() {
        this.setState({activeEditor: true});
    }

    render() {
        if(this.state.tiles.length > 0 && !this.state.activeEditor) {
            return (
                <Container fluid={true}>
                    <Header/>
                    <Tiles modalHandler={this.handleOpenModal} tiles={this.state.tiles} />
                    <ReactModal isOpen={this.state.showModal} style={customStyles} >
                        <button className="close-modal" onClick={this.handleCloseModal}>+</button>
                        <ModalContent
                            index={this.state.activeTile}
                            owned={this.state.ownedTile}
                            coinbase={this.state.coinbase}
                            openEditor={this.openEditor}
                        />
                    </ReactModal>
                </Container>
            );
        }else if(this.state.tiles.length > 0 && this.state.activeEditor){
            return(
                <Container fluid={true}>
                    <Header/>
                    <Editor
                        canvasSize={this.state.tileSize}
                        index={this.state.activeTile}
                        settings={this.state.settings}
                    />
                </Container>
            );
        }else{
            return null;
        }
    }
};