import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {SketchPicker} from 'react-color';
import {Row, Col} from 'reactstrap';
import {SketchField, Tools} from 'react-sketch';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import DropZone from 'react-dropzone';

import CloudIcon from '../images/cloud.png';

export class EditorImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            warnings: {
                imageNotSelect: false
            },
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
            el: {},
            radiusImage: 0
        };
    }

    componentDidMount = () => {
        this.props.editor._sketch._fc.on('object:removed', this._onObjectRemoved);
    };

    _onObjectRemoved = (e) => {
        let obj = e.target;

        if (obj.type === 'image') {
            this.setState({
                imageAdded: false,
                modeCrop: false
            });
        }
        if(obj.type === 'mask' && !_.isEmpty(this.state.lastActive)) {
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

    _onObjectImageDrop = (accepted/*, rejected*/) => {

        if (accepted && accepted.length > 0) {

            let sketch = this.props.editor._sketch,
                reader = new FileReader(),
                $this  = this;

            reader.onload = () => {

                const data = new FormData();

                data.append('file', accepted[0]);
                data.append('filename', accepted[0].name);
                data.append('index_tile', $this.props.editor.props.index.toString());

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

    _toggleModeCropImage(event) {

        let value      = event.target.value,
            canvas     = this.props.editor._sketch._fc,
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
                hasRotatingPoint: false,
                type: "mask"
            });

            el.left   = canvas.getActiveObject().left;
            el.top    = canvas.getActiveObject().top;
            el.width  = canvas.getActiveObject().width * canvas.getActiveObject().scaleX;
            el.height = canvas.getActiveObject().height * canvas.getActiveObject().scaleY;

            canvas.add(el);
            canvas.setActiveObject(el);

            this.setState({
                lastActive: object,
                el: el,
                warnings: {imageNotSelect: false}
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
            this.setState({modeCrop: false, warnings: {imageNotSelect: true}});
        }
    }

    _cropImage() {
        let canvas = this.props.editor._sketch._fc,
            el     = this.state.el,
            object = this.state.lastActive,
            left   = (el.left - object.left),
            top    = (el.top - object.top);

        if(
            !canvas.getActiveObject() ||
            typeof canvas.getActiveObject().type === 'undefined' ||
            (typeof canvas.getActiveObject().type !== 'undefined' && canvas.getActiveObject().type !== 'mask')
        ) {
            this.setState({warnings: {imageNotSelect: true}});
            return null;
        }

        let newImage = object.toDataURL({
            left   : left,
            top    : top,
            width  : canvas.getActiveObject().getWidth() - 1,
            height : canvas.getActiveObject().getHeight() - 1
        });

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
        this.props.editor._sketch.addImg(newImage);
        canvas.renderAll();
        this.setState({imageAdded: true})
    }

    _changeBorderImage(event) {

        let value  = event.target.value,
            sketch = this.props.editor._sketch,
            $this  = this;

        sketch._fc.forEachObject(function (e) {
            if (e.type === 'image') {
                $this.setState({borderImage: value});
                e.set({
                    stroke: `rgba(${$this.state.borderImageColor.r}, ${$this.state.borderImageColor.g}, ${$this.state.borderImageColor.b}, ${$this.state.borderImageColor.a})`,
                    strokeWidth: value,
                });
            }
        });
        sketch._fc.renderAll();
    }

    _changeImageRadius(event){
        let value  = event.target.value,
            sketch = this.props.editor._sketch,
            $this  = this;

        sketch._fc.forEachObject(function (e) {
            if (e.type === 'image') {
                $this.setState({radiusImage: value});
                e.set({
                    clipTo: function (ctx) {
                        let rect = new fabric.Rect({
                            left:0,
                            top:0,
                            rx:value / this.scaleX,
                            ry:value / this.scaleY,
                            width:this.width,
                            height:this.height,
                            fill:'#000000'
                        });
                        rect._render(ctx, false);
                    }
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

    handleChangeBorderImageColorPicker = (color) => {
        let $this = this;
        this.setState({borderImageColor: color.rgb});
        this.props.editor._sketch._fc.forEachObject(function (e) {
            if (e.type === 'image') {
                e.set({
                    'stroke': `rgba(${$this.state.borderImageColor.r}, ${$this.state.borderImageColor.g}, ${$this.state.borderImageColor.b}, ${$this.state.borderImageColor.a})`
                });
            }
        });
        this.props.editor._sketch._fc.renderAll();
    };

    handleClickBorderImageColorPicker = () => {
        this.setState({displayBorderImageColorPicker: !this.state.displayBorderImageColorPicker})
    };
    handleCloseBorderImageColorPicker = () => {
        this.setState({displayBorderImageColorPicker: false})
    };

    render() {
        if (Object.keys(this.props.settings).length === 0) {
            return(<div>
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
                    <img className="cloud-icon" src={CloudIcon} style={{display: 'block', margin: "0 auto 15px"}} />
                    Try dropping an image here,<br/>or click<br/>to select image as background.
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
                                    disabled={this.state.warnings.imageNotSelect || !this.state.modeCrop}
                                    onClick={(event) => this._cropImage(event)}>
                                Crop!
                            </button>{this.state.warnings.imageNotSelect ?
                            <span className="has-error">Please, select the object of the image on canvas!</span> : null}
                        </Col>
                    </Row> : null
                }
                {this.state.imageAdded ?
                    <Row>
                        <Col lg={3}>
                            <label>Clip image rounded</label>
                        </Col>
                        <Col lg={9}>
                            <ReactBootstrapSlider
                                id="clip_image"
                                value={this.state.radiusImage}
                                change={(event) => this._changeImageRadius(event)}
                                slideStop={(event) => this._changeImageRadius(event)}
                                step={1}
                                max={100}
                                min={0}
                                orientation="horizontal"
                                reversed={false}
                            />
                        </Col>
                    </Row> : null
                }
            </div>);
        }else{
            return null;
        }
    }
}
EditorImage.propTypes = {
    settings: PropTypes.object.isRequired,
    editor  : PropTypes.object.isRequired
};
export default EditorImage;