import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row, Col, ButtonGroup, ButtonToolbar, Button} from 'reactstrap';
import {SketchField, Tools} from 'react-sketch';
import _ from 'lodash';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import JSEMOJI from 'emoji-js';

export class EditorEmoji extends Component {
    constructor(props) {
        super(props);
        this.state = {
            warnings: {
                imageNotSelect: false
            },
            imgAdded:  false,
            img: {},
            maskAdded: false,
            mask: {}
        };
        _.bindAll(this, [
            '_selectEmoji'
        ]);
    }
    componentDidMount = () => {
        this.props.editor._sketch._fc.on('object:removed', this._onObjectRemoved);
        this.jsemoji = new JSEMOJI();
    };
    _onObjectRemoved = (e) => {};

    _selectEmoji(emoji, event) {

        let sketch = this.props.editor._sketch;

        if(this.state.imgAdded){
            sketch._fc.remove(this.state.img);
            this.setState({img:{}, imgAdded:false});
        }

        if(this.state.maskAdded){
            sketch._fc.remove(this.state.mask);
            this.setState({mask:{}, maskAdded:false});
        }

        let imageName = emoji.name.toLowerCase().replace(/\s/g, '-') + '.png',
            imageUrl  = this.jsemoji.img_sets.apple.path  + imageName;

        fabric.Image.fromURL(imageUrl, function(img) {

            sketch._fc.add(img);
            sketch._fc.renderAll();
        });
    }

    render() {
        if (Object.keys(this.props.settings).length === 0) {
            return(<div>
                <Row>
                    <Col lg={12}>
                        <Picker set='apple' onClick={(emoji, event) => this._selectEmoji(emoji, event)} native={false} />
                    </Col>
                </Row>
            </div>);
        }else{
            return null;
        }
    }
}
EditorEmoji.propTypes = {
    settings: PropTypes.object.isRequired,
    editor  : PropTypes.object.isRequired
};
export default EditorEmoji;