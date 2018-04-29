import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {SketchPicker} from 'react-color';
import {Row, Col} from 'reactstrap';
import {SketchField, Tools} from 'react-sketch';
import FontFaceObserver from 'fontfaceobserver';
import ReactBootstrapSlider from 'react-bootstrap-slider';


export class EditorText extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userText: '',
            fontFamily: "Abel",
            displayColorPicker: false,
            colorFont: {
                r: '113',
                g: '113',
                b: '113',
                a: '1',
            },
            fontStrokeRender: false,
            fontColorStroke: {
                r: '113',
                g: '113',
                b: '113',
                a: '1'
            },
            fontStrokeWidth: 1
        };
    }

    _onObjectRemoved = (e) => {
        let obj = e.target;
        if (obj.type === 'i-text') {
            this.setState({userText: ''});
            obj.version = 0;
        }
    };

    componentDidMount = () => {
        this.props.editor._sketch._fc.on('object:removed', this._onObjectRemoved);
    };

    _addText(event) {
        let text = event.target.value,
            sketch = this.props.editor._sketch;

        sketch._fc.forEachObject(function (e) {
            if (e && e.type === 'i-text') {
                sketch._fc.remove(e);
            }
        });
        this.setState({userText: text});
        sketch.addText(text);
        sketch._fc.forEachObject(function (e) {
            if (e && e.type === 'i-text') {
                sketch._fc.bringToFront(e);
            } else if (e) {
                sketch._fc.discardActiveObject();
            }
        });
        sketch._fc.renderAll();
    }

    _setFontFamily(event) {
        let sketch = this.props.editor._sketch,
            font = event.target.value,
            fontObs = new FontFaceObserver(font);

        this.setState({fontFamily: font});

        fontObs.load().then(function () {
            sketch.setCustomFont(font);
        });
    }

    _setFontFamilyColor(color) {
        let sketch = this.props.editor._sketch;
        sketch.setCustomFontColor(color);
    }

    _setStrokeColor(color) {
        let sketch = this.props.editor._sketch;
        sketch.setCustomFontStrokeColor(color);
    }

    _toggleFontStrokeRender(event) {
        let value = event.target.value;
        this.setState({fontStrokeRender: !this.state.fontStrokeRender});
        this.props.editor._sketch.toggleFontStroke(value);
    }


    _changeStrokeWidth(event) {
        let value = event.target.value,
            sketch = this.props.editor._sketch;

        sketch.setFontStrokeWidth(value);
    }

    _stopStrokeWidth(event) {
        let value = event.target.value,
            sketch = this.props.editor._sketch;

        sketch.setFontStrokeWidth(value);
        this.setState({fontStrokeWidth: value});
    }

    handleClickStrokeColorPicker = () => {
        this.setState({displayStrokeColorPicker: !this.state.displayStrokeColorPicker})
    };
    handleCloseStrokeColorPicker = () => {
        this.setState({displayStrokeColorPicker: false})
    };
    handleChangeStrokeColorPicker = (color) => {
        this.setState({fontColorStroke: color.rgb});
        this._setStrokeColor(color.rgb);
    };

    handleClickColorPicker = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker})
    };
    handleCloseColorPicker = () => {
        this.setState({displayColorPicker: false})
    };
    handleChangeColorPicker = (color) => {
        this.setState({colorFont: color.rgb});
        this._setFontFamilyColor(color.rgb);
    };

    render() {
        if (Object.keys(this.props.settings).length === 0) {
            return (
                <div>
                    <Row>
                        <Col lg={3}>
                            <label>Select font</label>
                        </Col>
                        <Col lg={9}>
                            <select
                                id="font_family"
                                name="font-family"
                                onChange={(event) => this._setFontFamily(event)}
                                style={this.state.fontFamily === 'PhantomFingers' || this.state.fontFamily === 'TimesNewRoman' || this.state.fontFamily === 'RobotoRegular' ?
                                {
                                    fontFamily: this.state.fontFamily,
                                    lineHeight: 0,
                                    height: '36px',
                                    marginBottom: '15px',
                                    padding: '0'
                                } :
                                {
                                    fontFamily: this.state.fontFamily,
                                    lineHeight: 0,
                                    height: '36px',
                                    marginBottom: '15px',
                                    padding: '6px 0'
                                }
                            }>
                                <option style={{fontFamily: "'Abel', sans-serif"}} value="Abel">Abel</option>
                                <option style={{fontFamily: "'Crimes', sans-serif"}} value="Crimes">Crimes</option>
                                <option style={{fontFamily: "'Fabula', sans-serif"}} value="Fabula">Fabula</option>
                                <option style={{fontFamily: "'FreshMarker', sans-serif"}} value="FreshMarker">Fresh-Marker</option>
                                <option style={{fontFamily: "'Graduate', serif"}} value="Graduate">Graduate</option>
                                <option style={{fontFamily: "'Lemon', sans-serif"}} value="Lemon">Lemon</option>
                                <option style={{fontFamily: "'PhantomFingers', sans-serif"}} value="PhantomFingers">Phantom-Fingers</option>
                                <option style={{fontFamily: "'RobotoRegular', sans-serif"}} value="RobotoRegular">Roboto</option>
                                <option style={{fontFamily: "'TimesNewRoman', serif"}} value="TimesNewRoman">Times-New-Roman</option>
                            </select>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={3}>
                            <label>Add text</label>
                        </Col>
                        <Col lg={9}>
                            <textarea id="i-text" name="i-text" cols={15} rows={3} onChange={(event) => this._addText(event)} maxLength={85} value={this.state.userText} />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={3}>
                            <label>Set font color</label>
                        </Col>
                        <Col lg={9}>
                            <div className="color-picker">
                                <div className="wrapper-selected-color" onClick={this.handleClickColorPicker}>
                                    <div className="selected-color" style={{background: `rgba(${this.state.colorFont.r}, ${this.state.colorFont.g}, ${this.state.colorFont.b}, ${this.state.colorFont.a})`}}/>
                                </div>
                                {this.state.displayColorPicker ?
                                    <div className="color-picker-pane">
                                        <div className="color-picker-overlay" onClick={this.handleCloseColorPicker}/>
                                        <SketchPicker id="font_color" color={this.state.colorFont} onChange={this.handleChangeColorPicker} />
                                    </div>
                                    : null
                                }
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={3}>
                            <label>Font stroke</label>
                        </Col>
                        <Col lg={9}>
                            <input type="checkbox" name="font-stroke" id="font_stroke" checked={this.state.fontStrokeRender} value={this.state.fontStrokeRender ? 'on' : 'off'} onChange={(event) => this._toggleFontStrokeRender(event)} />
                        </Col>
                    </Row>
                    {this.state.fontStrokeRender ?
                        <Row>
                            <Col lg={3}>
                                <label>Set stroke color</label>
                            </Col>
                            <Col lg={9}>
                                <div className="color-picker">
                                    <div className="wrapper-selected-color" onClick={this.handleClickStrokeColorPicker} >
                                        <div className="selected-color" style={{background: `rgba(${this.state.fontColorStroke.r}, ${this.state.fontColorStroke.g}, ${this.state.fontColorStroke.b}, ${this.state.fontColorStroke.a})`}} />
                                    </div>
                                    {this.state.displayStrokeColorPicker ?
                                        <div className="color-picker-pane">
                                            <div className="color-picker-overlay" onClick={this.handleCloseStrokeColorPicker}/>
                                            <SketchPicker id="font_stroke_color" color={this.state.fontColorStroke} onChange={this.handleChangeStrokeColorPicker} />
                                        </div>
                                        : null
                                    }
                                </div>
                            </Col>
                        </Row>
                        : null
                    }
                    {this.state.fontStrokeRender ?
                        <Row className="row-stroke">
                            <Col lg={3}>
                                <label>Set stroke width</label>
                            </Col>
                            <Col lg={9}>
                                <ReactBootstrapSlider id="stroke_width" value={this.state.fontStrokeWidth} change={(event) => this._changeStrokeWidth(event)} slideStop={(event) => this._stopStrokeWidth(event)} step={1} max={10} min={1} orientation="horizontal" reversed={false}/>
                            </Col>
                        </Row>
                        : null
                    }
                    </div>
            );
        } else {
            return null;
        }
    }
}
EditorText.propTypes = {
    settings: PropTypes.object.isRequired,
    editor  : PropTypes.object.isRequired
};
export default EditorText;