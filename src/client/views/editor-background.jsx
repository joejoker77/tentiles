import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row, Col, ButtonGroup, ButtonToolbar, Button} from 'reactstrap';
import {SketchPicker} from 'react-color';
import {SketchField, Tools} from 'react-sketch';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import DropZone from 'react-dropzone';
import _ from 'lodash';
import {Icon} from 'react-fa';

import CloudIcon from '../images/cloud.png';

export class EditorBackground extends Component {
    constructor(props) {
        super(props);
        this.state = {
            warnings: {
                imageNotSelect: false
            },
            tool: 'color',
            displayBgColorPicker: false,
            bgColor: {r: '0', g: '0', b: '0', a: '0'},
            bgGradient: [],
            defaultGradientColor: {r: '0', g: '0', b: '0', a: '1'},
            displayBgGradients: [false],
        };
        _.bindAll(this, [
            '_setBgColor',
            '_setBgGradientColor',
            'handleBgGradientPicker',
            'handleCloseBgGradientPicker'
        ]);
    }

    componentDidMount = () => {
        this.props.editor._sketch._fc.on('object:removed', this._onObjectRemoved);
    };

    _onObjectRemoved = (e) => {};

    _toggleTool(event){
        this.setState({tool:event.target.value});
        if(event.target.value){

        }
    }

    _onBackgroundImageDrop = (accepted/*, rejected*/) => {
        if (accepted && accepted.length > 0) {
            let sketch = this.props.editor._sketch,
                reader = new FileReader(),
                {stretched, stretchedX, stretchedY, originX, originY} = this.state,
                $this = this;
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

    _setBgColor(color) {
        if(color.rgb.a === 0){color.rgb.a = 1;}
        this.setState({bgColor: color.rgb});

        this.props.editor._sketch._fc.backgroundColor = color.hex;
        this.props.editor._sketch._fc.renderAll();
    };

    handleCloseBackgroundPicker = () => {
        this.setState({displayBgColorPicker: false})
    };
    handleBackgroundPicker = () => {
        this.setState({displayBgColorPicker: !this.state.displayBgColorPicker})
    };

    _setBgGradientColor(index, color) {
        let state  = [...this.state.bgGradient],
            canvas = this.props.editor._sketch._fc;

        state[index] = color.rgb;
        this.setState({bgGradient:state});

        let rect = this._getRectGradient(state);
        canvas.setBackgroundImage(rect.toDataURL(), function () {
            canvas.renderAll();
        });
    }

    addClick(){
        this.setState(prevState => ({bgGradient: [...prevState.bgGradient, '']}));
        this.setState(prevState => ({displayBgGradients: [...prevState.displayBgGradients, false]}));
    }

    removeClick(i){
        let values = [...this.state.bgGradient],
            canvas = this.props.editor._sketch._fc;

        values.splice(i,1);
        this.setState({bgGradient:values});

        if(values.length === 0){
            let canvas = this.props.editor._sketch._fc;
            canvas.backgroundImage = null;
            canvas.renderAll();
        }else{
            let rect = this._getRectGradient(values);
            canvas.setBackgroundImage(rect.toDataURL(), function () {
                canvas.renderAll();
            });
        }
    }

    _getRectGradient(values){
        let colorStops = {},
            canvas     = this.props.editor._sketch._fc;

        for(let i in values) {
            let stopPoints = i === '0' ? 0 : (i / (values.length - 1)).toFixed(2);
            if((Number(i) + 1) === values.length && i !== '0') {
                stopPoints = 1;
            }
            colorStops[stopPoints] = `rgba(${values[i].r}, ${values[i].g}, ${values[i].b}, ${values[i].a})`;
        }
        let rect = new fabric.Rect({
            left: 0,
            top: 0,
            width: canvas.width,
            height: canvas.height,
            selectable: false,
            type: 'gradient'
        });
        rect.setGradient('fill', {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: canvas.height,
            colorStops: colorStops
        });
        return rect;
    }

    createUI() {
        let $this = this;
        return this.state.bgGradient.map((el, i) =>
            <Row key={i}>
                <Col lg={3}>
                    <label>Gradient #{i+1}</label>
                </Col>
                <Col lg={9}>
                    <div className="color-picker">
                        <div className="wrapper-selected-color" data-index={i}
                             onClick={this.handleBgGradientPicker}>
                            <div className="selected-color" data-index={i}
                                 style={{background: `rgba(${el.r || this.state.defaultGradientColor.r}, ${el.g || this.state.defaultGradientColor.g}, ${el.b || this.state.defaultGradientColor.b}, ${el.a || this.state.defaultGradientColor.a})`}}
                            />
                        </div>
                        {Array.prototype.map.call(this.state.displayBgGradients, function (dEl, index) {
                            if(index === i && dEl){
                                return <div className="color-picker-pane" key={index}>
                                    <div className="color-picker-overlay" data-index={i} onClick={$this.handleCloseBgGradientPicker} />
                                    <SketchPicker id={"bg_gradient_" + i} color={el} onChange={$this._setBgGradientColor.bind(this, i)} />
                                </div>
                            }
                        })}
                        <Button type='button' value='-' onClick={this.removeClick.bind(this, i)} >
                            <Icon name="minus-circle" />
                        </Button>
                    </div>
                </Col>
            </Row>
        )
    }

    handleBgGradientPicker(event){
        let indexElement = event.target.dataset.index,
            state        = this.state.displayBgGradients;
        state[indexElement] = true;
        this.setState({displayBgGradients: state});
    }

    handleCloseBgGradientPicker(event){
        let indexElement = event.target.dataset.index,
            state        = this.state.displayBgGradients;
        state[indexElement] = false;
        this.setState({displayBgGradients: state});
    }

    render() {
        if (Object.keys(this.props.settings).length === 0) {
            return(<div>
                <Row>
                    <Col lg={12}>
                        <ButtonToolbar>
                            <ButtonGroup defaultValue='color' onClick={(event) => this._toggleTool(event)} >
                                <Button active={this.state.tool === 'color'} value='color'>Color</Button>
                                <Button active={this.state.tool === 'gradient'} value='gradient'>Gradient</Button>
                                <Button active={this.state.tool === 'image'} value='image'>Image</Button>
                            </ButtonGroup>
                            {this.state.tool === 'gradient' ?
                                <ButtonGroup style={{marginLeft:'10px'}}>
                                    <Button className='btn btn-success' onClick={this.addClick.bind(this)}>Add Color</Button>
                                </ButtonGroup> : null
                            }
                        </ButtonToolbar>
                    </Col>
                </Row>
                {this.state.tool === 'color' ?
                    <Row>
                        <Col lg={3}>
                            <label>Set color</label>
                        </Col>
                        <Col lg={9}>
                            <div className="color-picker">
                                <div className="wrapper-selected-color"
                                     onClick={this.handleBackgroundPicker}>
                                    <div className="selected-color"
                                         style={{background: `rgba(${this.state.bgColor.r}, ${this.state.bgColor.g}, ${this.state.bgColor.b}, ${this.state.bgColor.a})`}}
                                    />
                                </div>
                                {this.state.displayBgColorPicker ?
                                    <div className="color-picker-pane">
                                        <div className="color-picker-overlay" onClick={this.handleCloseBackgroundPicker} />
                                        <SketchPicker id="background_color" color={this.state.bgColor}
                                                      onChange={this._setBgColor}
                                        />
                                    </div> : null
                                }
                            </div>
                        </Col>
                    </Row> : null
                }
                {this.state.tool === 'gradient' ?
                    <div>
                        {this.createUI()}
                    </div>: null
                }
                {this.state.tool === 'image' ?
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
                        onDrop={(event) => this._onBackgroundImageDrop(event)} >
                        <img className="cloud-icon" src={CloudIcon} style={{display: 'block', margin: "0 auto 15px"}} />
                        Try dropping an image here,<br/>or click<br/>to select image as background.
                    </DropZone> : null
                }
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
            </div>);
        }else{
            return null;
        }
    }
}
EditorBackground.propTypes = {
    settings: PropTypes.object.isRequired,
    editor  : PropTypes.object.isRequired
};
export default EditorBackground;