import React, {Component} from 'react';
import Logo from '../images/logo.jpg';

export class Header extends Component {
    render() {
        return (
            <header>
                <a href="/" className="logo" title="Collect One-of-a-kind Celebrity Smart Contracts!" >
                    <img src={Logo} alt="Collect One-of-a-kind Celebrity Smart Contracts!" />
                    <span>Collect One-of-a-kind Celebrity Smart Contracts!</span>
                </a>
                <nav className="navbar navbar-default navbar-static-top pull-right" >
                    <div className="navbar-collapse collapse">
                        {this.props.children}
                    </div>
                </nav>
            </header>
        );
    }
}
export default Header;