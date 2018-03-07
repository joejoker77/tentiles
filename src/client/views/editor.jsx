import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {SketchPicker} from 'react-color';
import {Row, Col, TabContainer, TabContent, TabPane, Nav, NavItem} from 'react-bootstrap';
import {SketchField, Tools} from 'react-sketch';
import DropZone from 'react-dropzone';
import FontFaceObserver from 'fontfaceobserver';
import ReactBootstrapSlider from 'react-bootstrap-slider';

import TextSprite from '../images/sprite-text.button.jpg';
import ImageSprite from '../images/sprite-image.button.jpg';
import LinkSprite from '../images/sprite-link.button.jpg';
import ColorSprite from '../images/sprite-background.button.jpg';

import ControlIconRemove from '../images/control-icon-remove.png';
import ControlIconMove from '../images/control-icon-move.png';
import ControlIconTransform from '../images/control-icon-transform.png';
import ControlIconRotate from '../images/control-icon-rotate.png';
import ControlIconHor from '../images/control-icon-hor.png';
import ControlIconVer from '../images/control-icon-ver.png';

import CloudIcon from '../images/cloud.png';

import 'fabric-customise-controls';

function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        let evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

export class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            warnings: {
                imageNotSelect: false
            },
            lineColor: 'black',
            lineWidth: 10,
            fillColor: '#68CCCA',
            backgroundColor: 'transparent',
            shadowWidth: 0,
            shadowOffset: 0,
            tool: Tools.Select,
            fillWithColor: false,
            fillWithBackgroundColor: false,
            drawings: [],
            canUndo: false,
            canRedo: false,
            controlledSize: false,
            sketchWidth: 600,
            sketchHeight: 600,
            stretched: true,
            stretchedX: false,
            stretchedY: false,
            originX: 'left',
            originY: 'top',
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
            fontStrokeWidth: 1,
            imageAdded: false,
            borderImage: 0,
            borderImageColor: {
                r: '0',
                g: '0',
                b: '0',
                a: '1'
            },
            modeCrop: false,
            lastActive: {},
            el: {}
        };
        _.bindAll([
            'handleClickColorPicker',
            'handleCloseColorPicker',
            'handleChangeColorPicker'
        ]);
    }

    _selectTool = (event, index, value) => {
        this.setState({
            tool: value
        });
    };
    _save = () => {
        let drawings = this.state.drawings;
        drawings.push(this._sketch.toDataURL());
        this.setState({drawings: drawings});
    };
    _download = () => {
        /*eslint-disable no-console*/

        console.save(this._sketch.toDataURL(), 'toDataURL.txt');
        console.save(JSON.stringify(this._sketch.toJSON()), 'toDataJSON.txt');

        /*eslint-enable no-console*/

        let {imgDown} = this.refs;
        let event = new Event('click', {});

        imgDown.href = this._sketch.toDataURL();
        imgDown.download = 'toPNG.png';
        imgDown.dispatchEvent(event);
    };

    _renderTile = (drawing, index) => {
        return (
            <GridTile
                key={index}
                title='Canvas Image'
                actionPosition="left"
                titlePosition="top"
                titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                cols={1} rows={1} style={styles.gridTile}
                actionIcon={<IconButton onTouchTap={(c) => this._removeMe(index)}><RemoveIcon
                    color="white"/></IconButton>}>
                <img src={drawing}/>
            </GridTile>
        );
    };
    _removeMe = (index) => {
        let drawings = this.state.drawings;
        drawings.splice(index, 1);
        this.setState({drawings: drawings});
    };
    _undo = () => {
        this._sketch.undo();
        this.setState({
            canUndo: this._sketch.canUndo(),
            canRedo: this._sketch.canRedo()
        })
    };
    _redo = () => {
        this._sketch.redo();
        this.setState({
            canUndo: this._sketch.canUndo(),
            canRedo: this._sketch.canRedo()
        })
    };
    _clear = () => {
        this._sketch.clear();
        this._sketch.setBackgroundFromDataUrl('');
        this.setState({
            controlledValue: null,
            backgroundColor: 'transparent',
            fillWithBackgroundColor: false,
            canUndo: this._sketch.canUndo(),
            canRedo: this._sketch.canRedo()
        })
    };

    _onSketchChange = () => {

        let prev = this.state.canUndo,
            now = this._sketch.canUndo(),
            activeObj = this._sketch._fc.getActiveObject();

        activeObj && this._sketch._fc.bringToFront(activeObj).renderAll();

        if (activeObj && activeObj.type === 'image' && !this.state.imageAdded) {
            this.setState({imageAdded: true});
        }

        if (prev !== now) {
            this.setState({canUndo: now});
        }
    };

    _onObjectRemoved = (e) => {
        let obj = e.target;

        if (obj.type === 'i-text') {
            this.setState({userText: ''});
        }
        if (obj.type === 'image') {
            this.setState({
                imageAdded: false,
                modeCrop: false
            });
        }
        if(obj.type === 'rect') {
            let obj = this.state.lastActive;
            obj.set({
                selection: true,
                lockMovementX: false,
                lockMovementY: false,
                lockScalingX: false,
                lockScalingY: false,
                lockUniScaling: false,
                lockRotation: false
            });
            this.setState({
                modeCrop: false
            });
        }
        obj.version = 0;
    };

    _onBackgroundImageDrop = (accepted/*, rejected*/) => {
        if (accepted && accepted.length > 0) {
            let sketch = this._sketch;
            let reader = new FileReader();
            let {stretched, stretchedX, stretchedY, originX, originY} = this.state;
            reader.addEventListener('load', () => sketch.setBackgroundFromDataUrl(reader.result, {
                stretched: stretched,
                stretchedX: stretchedX,
                stretchedY: stretchedY,
                originX: originX,
                originY: originY
            }), false);
            reader.readAsDataURL(accepted[0]);
        }
    };

    _onObjectImageDrop = (accepted/*, rejected*/) => {

        if (accepted && accepted.length > 0) {

            let sketch = this._sketch,
                reader = new FileReader(),
                $this = this;

            reader.onload = () => {

                const data = new FormData();

                data.append('file', accepted[0]);
                data.append('filename', accepted[0].name);
                data.append('index_tile', $this.props.index.toString());

                fetch('http://localhost:7700/upload', {
                    method: 'POST',
                    body: data,
                }).then((response) => {
                    if (response.status === 200 && response.statusText === 'OK') {
                        $this.setState({imageAdded: true});
                        sketch.addImg(reader.result);
                    }
                });
            };
            reader.readAsDataURL(accepted[0]);
        }
    };

    _addText(event) {
        let text = event.target.value,
            sketch = this._sketch;

        sketch._fc.forEachObject(function (e) {
            if (e && e.type === 'i-text') {
                e.remove();
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
        let sketch = this._sketch,
            font = event.target.value,
            fontObs = new FontFaceObserver(font);

        this.setState({fontFamily: font});

        fontObs.load().then(function () {
            sketch.setCustomFont(font);
        });
    }

    _setFontFamilyColor(color) {
        let sketch = this._sketch;
        sketch.setCustomFontColor(color);
    }

    _setStrokeColor(color) {
        let sketch = this._sketch;
        sketch.setCustomFontStrokeColor(color);
    }

    _toggleFontStrokeRender(event) {
        let value = event.target.value;
        this.setState({fontStrokeRender: !this.state.fontStrokeRender});
        this._sketch.toggleFontStroke(value);
    }

    _toggleModeCropImage(event) {

        let value      = event.target.value,
            canvas     = this._sketch._fc,
            object     = {},
            lastActive = this.state.lastActive,
            el         = this.state.el;

        this.setState({modeCrop: value === "off"});

        canvas.remove(el);

        if (canvas.getActiveObject() && !this.state.modeCrop) {

            object      = canvas.getActiveObject();
            object.left = (canvas.width - (object.width * object.scaleX)) / 2;
            object.top  = (canvas.height - (object.height * object.scaleY)) /2;

            if (lastActive && lastActive !== object) {
                lastActive.clipTo = null;
            }

            el = new fabric.Rect({
                fill: 'rgba(0,0,0,0.3)',
                originX: 'left',
                originY: 'top',
                stroke: '#ccc',
                strokeDashArray: [2, 2],
                opacity: 1,
                width: 1,
                height: 1,
                borderColor: '#36fd00',
                cornerColor: 'green',
                hasRotatingPoint: false
            });

            el.left   = canvas.getActiveObject().left;
            el.top    = canvas.getActiveObject().top;
            el.width  = canvas.getActiveObject().width * canvas.getActiveObject().scaleX;
            el.height = canvas.getActiveObject().height * canvas.getActiveObject().scaleY;

            canvas.add(el);
            canvas.setActiveObject(el);

            this.setState({
                lastActive: object,
                el: el
            });

            canvas.forEachObject(function (e) {
                if(e !== el){
                    e.set({
                        selection: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockUniScaling: true,
                        lockRotation: true
                    });
                }
            });
            canvas.renderAll();
        }else if(!canvas.getActiveObject()){
            this.setState({warnings: {imageNotSelect: true}});
        }
    }

    _cropImage() {
        let canvas = this._sketch._fc,
            el     = this.state.el,
            object = this.state.lastActive,
            left   = (el.left - object.left),
            top    = (el.top - object.top);

        let newImage = object.toDataURL({left:left, top:top, width:canvas.getActiveObject().getWidth() - 1, height:canvas.getActiveObject().getHeight() - 1});
        object.set({
            selection: true,
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            lockUniScaling: false,
            lockRotation: false
        });
        this.setState({lastActive: object});
        canvas.remove(canvas.getActiveObject());
        canvas.remove(object);
        this._sketch.addImg(newImage);
        canvas.renderAll();
    }

    _changeStrokeWidth(event) {
        let value = event.target.value,
            sketch = this._sketch;

        sketch.setFontStrokeWidth(value);
    }

    _stopStrokeWidth(event) {
        let value = event.target.value,
            sketch = this._sketch;

        sketch.setFontStrokeWidth(value);
        this.setState({fontStrokeWidth: value});
    }

    _changeBorderImage(event) {
        let value = event.target.value,
            sketch = this._sketch,
            $this = this;

        sketch._fc.forEachObject(function (e) {
            if (e.type === 'image') {
                $this.setState({borderImage: value});
                e.set({
                    stroke: `rgba(${$this.state.borderImageColor.r}, ${$this.state.borderImageColor.g}, ${$this.state.borderImageColor.b}, ${$this.state.borderImageColor.a})`,
                    'strokeWidth': value
                });
            }
        });
        sketch._fc.renderAll();

    }

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

    handleClickBorderImageColorPicker = () => {
        this.setState({displayBorderImageColorPicker: !this.state.displayBorderImageColorPicker})
    };
    handleCloseBorderImageColorPicker = () => {
        this.setState({displayBorderImageColorPicker: false})
    };
    handleChangeBorderImageColorPicker = (color) => {
        let $this = this;
        this.setState({borderImageColor: color.rgb});
        this._sketch._fc.forEachObject(function (e) {
            if (e.type === 'image') {
                e.set({
                    'stroke': `rgba(${$this.state.borderImageColor.r}, ${$this.state.borderImageColor.g}, ${$this.state.borderImageColor.b}, ${$this.state.borderImageColor.a})`
                });
            }
        });
        this._sketch._fc.renderAll();
    };

    componentDidMount = () => {
        fabric.Canvas.prototype.customiseControls({
            tl: {
                action: 'rotate',
                cursor: 'pointer'
            },
            tr: {
                action: 'scale'
            },
            bl: {
                action: 'remove',
                cursor: 'pointer'
            },
            br: {
                action: 'moveUp',
                cursor: 'pointer'
            }
        });

        fabric.Object.prototype.customiseCornerIcons({
            settings: {
                borderColor: '#a9a9a9',
                cornerSize: 32,
                cornerShape: 'rect',
                cornerBackgroundColor: 'transparent',
                cornerPadding: 0
            },
            tl: {
                icon: ControlIconRotate
            },
            tr: {
                icon: ControlIconTransform
            },
            bl: {
                icon: ControlIconRemove
            },
            br: {
                icon: ControlIconMove
            },
            mt:{
                icon: ControlIconVer
            },
            mb:{
                icon: ControlIconVer
            },
            ml:{
                icon: ControlIconHor
            },
            mr:{
                icon: ControlIconHor
            }
        });

        /*eslint-disable no-console*/

        (function (console) {
            console.save = function (data, filename) {
                if (!data) {
                    console.error('Console.save: No data');
                    return;
                }
                if (!filename) filename = 'console.json';
                if (typeof data === 'object') {
                    data = JSON.stringify(data, undefined, 4)
                }
                let blob = new Blob([data], {type: 'text/json'}),
                    e = document.createEvent('MouseEvents'),
                    a = document.createElement('a');
                a.download = filename;
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e)
            }
        })(console);

        /*eslint-enable no-console*/

        this._sketch._fc.on('object:removed', this._onObjectRemoved);

    };

    render() {
        let {controlledValue} = this.state;
        if (Object.keys(this.props.settings).length === 0) {
            return (
                <Row>
                    <Col lg={7} className="sketch-area">
                        <div className="wrapper-sketch">
                            <SketchField
                                name='sketch'
                                className='canvas-area'
                                ref={(c) => this._sketch = c}
                                lineColor={this.state.lineColor}
                                lineWidth={this.state.lineWidth}
                                fillColor={this.state.fillWithColor ? this.state.fillColor : '#ffffff'}
                                backgroundColor={this.state.fillWithBackgroundColor ? this.state.backgroundColor : '#ffffff'}
                                width={this.props.canvasSize + 'px'}
                                height={this.props.canvasSize + 'px'}
                                defaultValue={this.props.settings}
                                value={controlledValue}
                                forceValue={true}
                                onChange={this._onSketchChange}
                                tool={this.state.tool}
                            />
                        </div>
                    </Col>
                    <Col lg={5} className="sketch-tools">
                        <Col lg={12}><h2>Add elements</h2></Col>
                        <TabContainer id="sketch_tools" defaultActiveKey="text">
                            <Row>
                                <Col lg={12}>
                                    <Nav bsStyle="tabs">
                                        <NavItem eventKey="text">
                                            <div className="wrapper-icon">
                                                <img src={TextSprite}/>
                                            </div>
                                        </NavItem>
                                        <NavItem eventKey="image">
                                            <div className="wrapper-icon">
                                                <img src={ImageSprite}/>
                                            </div>
                                        </NavItem>
                                        <NavItem eventKey="background">
                                            <div className="wrapper-icon">
                                                <img src={ColorSprite}/>
                                            </div>
                                        </NavItem>
                                        <NavItem eventKey="link">
                                            <div className="wrapper-icon">
                                                <img src={LinkSprite}/>
                                            </div>
                                        </NavItem>
                                    </Nav>
                                </Col>
                                <Col lg={12}>
                                    <TabContent animation>
                                        <TabPane eventKey="text">
                                            <h3>Text settings</h3>
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
                                                        }
                                                    >
                                                        <option style={{fontFamily: "'Abel', sans-serif"}}
                                                                value="Abel">Abel
                                                        </option>
                                                        <option style={{fontFamily: "'Crimes', sans-serif"}}
                                                                value="Crimes">Crimes
                                                        </option>
                                                        <option style={{fontFamily: "'Fabula', sans-serif"}}
                                                                value="Fabula">Fabula
                                                        </option>
                                                        <option style={{fontFamily: "'FreshMarker', sans-serif"}}
                                                                value="FreshMarker">Fresh-Marker
                                                        </option>
                                                        <option style={{fontFamily: "'Graduate', serif"}}
                                                                value="Graduate">Graduate
                                                        </option>
                                                        <option style={{fontFamily: "'Lemon', sans-serif"}}
                                                                value="Lemon">Lemon
                                                        </option>
                                                        <option style={{fontFamily: "'PhantomFingers', sans-serif"}}
                                                                value="PhantomFingers">Phantom-Fingers
                                                        </option>
                                                        <option style={{fontFamily: "'RobotoRegular', sans-serif"}}
                                                                value="RobotoRegular">Roboto
                                                        </option>
                                                        <option style={{fontFamily: "'TimesNewRoman', serif"}}
                                                                value="TimesNewRoman">Times-New-Roman
                                                        </option>
                                                    </select>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg={3}>
                                                    <label>Add text</label>
                                                </Col>
                                                <Col lg={9}>
                                                    <textarea
                                                        id="i-text"
                                                        name="i-text"
                                                        cols={15}
                                                        rows={3}
                                                        onChange={(event) => this._addText(event)}
                                                        maxLength={85}
                                                        value={this.state.userText} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg={3}>
                                                    <label>Set font color</label>
                                                </Col>
                                                <Col lg={9}>
                                                    <div className="color-picker">
                                                        <div className="wrapper-selected-color"
                                                             onClick={this.handleClickColorPicker}>
                                                            <div className="selected-color"
                                                                 style={{background: `rgba(${this.state.colorFont.r}, ${this.state.colorFont.g}, ${this.state.colorFont.b}, ${this.state.colorFont.a})`}}/>
                                                        </div>
                                                        {this.state.displayColorPicker ?
                                                            <div className="color-picker-pane">
                                                                <div className="color-picker-overlay"
                                                                     onClick={this.handleCloseColorPicker}/>
                                                                <SketchPicker id="font_color"
                                                                              color={this.state.colorFont}
                                                                              onChange={this.handleChangeColorPicker}/>
                                                            </div> : null}
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg={3}>
                                                    <label>Font stroke</label>
                                                </Col>
                                                <Col lg={9}>
                                                    <input
                                                        type="checkbox"
                                                        name="font-stroke"
                                                        id="font_stroke"
                                                        checked={this.state.fontStrokeRender}
                                                        value={this.state.fontStrokeRender ? 'on' : 'off'}
                                                        onChange={(event) => this._toggleFontStrokeRender(event)}
                                                    />
                                                </Col>
                                            </Row>
                                            {this.state.fontStrokeRender ?
                                                <Row>
                                                    <Col lg={3}>
                                                        <label>Set stroke color</label>
                                                    </Col>
                                                    <Col lg={9}>
                                                        <div className="color-picker">
                                                            <div className="wrapper-selected-color"
                                                                 onClick={this.handleClickStrokeColorPicker}>
                                                                <div className="selected-color"
                                                                     style={{background: `rgba(${this.state.fontColorStroke.r}, ${this.state.fontColorStroke.g}, ${this.state.fontColorStroke.b}, ${this.state.fontColorStroke.a})`}}
                                                                />
                                                            </div>
                                                            {this.state.displayStrokeColorPicker ?
                                                                <div className="color-picker-pane">
                                                                    <div className="color-picker-overlay"
                                                                         onClick={this.handleCloseStrokeColorPicker}/>
                                                                    <SketchPicker id="font_stroke_color"
                                                                                  color={this.state.fontColorStroke}
                                                                                  onChange={this.handleChangeStrokeColorPicker}/>
                                                                </div> : null}
                                                        </div>
                                                    </Col>
                                                </Row>
                                                : null}
                                            {this.state.fontStrokeRender ?
                                                <Row className="row-stroke">
                                                    <Col lg={3}>
                                                        <label>Set stroke width</label>
                                                    </Col>
                                                    <Col lg={9}>
                                                        <ReactBootstrapSlider
                                                            id="stroke_width"
                                                            value={this.state.fontStrokeWidth}
                                                            change={(event) => this._changeStrokeWidth(event)}
                                                            slideStop={(event) => this._stopStrokeWidth(event)}
                                                            step={1}
                                                            max={10}
                                                            min={1}
                                                            orientation="horizontal"
                                                            reversed={false}
                                                        />
                                                    </Col>
                                                </Row>
                                                : null}
                                        </TabPane>
                                        <TabPane eventKey="image">
                                            <h3>Choose a file to upload</h3>
                                            <DropZone
                                                ref="dropzone"
                                                accept='image/*'
                                                multiple={false}
                                                style={{
                                                    width: '415px',
                                                    height: '200px',
                                                    border: '2px dashed rgb(102, 102, 102)',
                                                    borderStyle: 'dashed',
                                                    borderRadius: '5px',
                                                    textAlign: 'center',
                                                    paddingTop: '20px',
                                                    marginBottom: '40px'
                                                }}
                                                activeStyle={{
                                                    borderStyle: 'solid',
                                                    backgroundColor: '#eee'
                                                }}
                                                rejectStyle={{
                                                    borderStyle: 'solid',
                                                    backgroundColor: '#ffdddd'
                                                }}
                                                onDrop={(event) => this._onObjectImageDrop(event)}>
                                                <img className="cloud-icon" src={CloudIcon}
                                                     style={{display: 'block', margin: "0 auto 15px"}}/>
                                                Try dropping an image here,<br/>
                                                or click<br/>
                                                to select image as background.
                                            </DropZone>
                                            {this.state.imageAdded ?
                                                <Row>
                                                    <Col lg={3}>
                                                        <label>Add border</label>
                                                    </Col>
                                                    <Col lg={9}>
                                                        <ReactBootstrapSlider
                                                            id="border_image"
                                                            value={this.state.borderImage}
                                                            change={(event) => this._changeBorderImage(event)}
                                                            slideStop={(event) => this._changeBorderImage(event)}
                                                            step={1}
                                                            max={30}
                                                            min={0}
                                                            orientation="horizontal"
                                                            reversed={false}
                                                        />
                                                    </Col>
                                                </Row> : null
                                            }
                                            {this.state.imageAdded ?
                                                <Row>
                                                    <Col lg={3}>
                                                        <label>Set border color</label>
                                                    </Col>
                                                    <Col lg={9}>
                                                        <div className="color-picker">
                                                            <div className="wrapper-selected-color"
                                                                 onClick={this.handleClickBorderImageColorPicker}>
                                                                <div className="selected-color"
                                                                     style={{background: `rgba(${this.state.borderImageColor.r}, ${this.state.borderImageColor.g}, ${this.state.borderImageColor.b}, ${this.state.borderImageColor.a})`}}
                                                                />
                                                            </div>
                                                            {this.state.displayBorderImageColorPicker ?
                                                                <div className="color-picker-pane">
                                                                    <div className="color-picker-overlay"
                                                                         onClick={this.handleCloseBorderImageColorPicker}/>
                                                                    <SketchPicker id="image_border_color"
                                                                                  color={this.state.borderImageColor}
                                                                                  onChange={this.handleChangeBorderImageColorPicker}/>
                                                                </div> : null}
                                                        </div>
                                                    </Col>
                                                </Row> : null
                                            }
                                            {this.state.imageAdded ?
                                                <Row>
                                                    <Col lg={3}>
                                                        <label>Crop image</label>
                                                    </Col>
                                                    <Col lg={9}>
                                                        <input
                                                            type="checkbox"
                                                            name="crop-mode"
                                                            id="crop_mode"
                                                            checked={this.state.modeCrop}
                                                            value={this.state.modeCrop ? 'on' : 'off'}
                                                            onChange={(event) => this._toggleModeCropImage(event)}
                                                        />
                                                        <button className="btn btn-primary btn-xs"
                                                                onClick={(event) => this._cropImage(event)}>
                                                            Crop!
                                                        </button>
                                                    </Col>
                                                </Row> : null
                                            }
                                        </TabPane>
                                        <TabPane eventKey="background">

                                        </TabPane>
                                        <TabPane eventKey="link">

                                        </TabPane>
                                    </TabContent>
                                </Col>
                            </Row>
                        </TabContainer>
                    </Col>
                </Row>
            );
        } else {
            return null;
        }
    }
}

Editor.propTypes = {
    index: PropTypes.number.isRequired,
    settings: PropTypes.object.isRequired,
    canvasSize: PropTypes.number.isRequired
};
export default Editor;