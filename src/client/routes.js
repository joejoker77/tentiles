import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Web3 from 'web3';
import Home from './views/home';

import LoaderGif from './images/loader.gif';

class Container extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isConnecting: true,
            isConnected: false
        };
        this.checkNetwork = this.checkNetwork.bind(this);
    }
    componentWillMount() {
        window.addEventListener('load', this.initMetaMaskVersion());
    }
    componentWillUpdate(nextProps, nextState) {
        if(!this.state.isConnected && this.state.isConnecting) {
            this.initMetaMaskVersion(this.state.version);
        }
    }
    initMetaMaskVersion() {
        let $this = this;
        this.initializeWeb3();
        this.checkNetwork().then(function (networkId) {
            $this.setState({
                isConnected: networkId === 3,
                isConnecting: false
            });
        });
    }

    initializeWeb3() {
        if (typeof web3 !== 'undefined') {
            const defaultAccount = web3.eth.defaultAccount;
            window.web3 = new Web3(web3.currentProvider);
            window.web3.eth.defaultAccount = defaultAccount;
        }
    }
    checkNetwork() {
        return new Promise(function (resolve, reject) {
            web3.eth.net.getId(function (err, netId) {
                err ? reject(err) : resolve(netId);
            });
        });
    }

    render() {
        if (this.state.isConnecting) {
            return(
                <img src={LoaderGif} width={450} height={300} style={{
                    position: "absolute",
                    top: "50%",
                    left:"50%",
                    marginTop: "-150px",
                    marginLeft: "-225px"
                }}
                />
            );
        }
        if (this.state.isConnected) {
            return(
                <Router>
                    <Switch>
                        <Route exact path='/' component={Home} />
                    </Switch>
                </Router>
            );
        } else {
            return (
                <div className="app-container">No connected</div>
            );
        }
    }
}
export default Container;