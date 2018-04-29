import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row, Col, TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import {SketchField, Tools} from 'react-sketch';
import EditorText from './editor-text';
import EditorImage from './editor-image';
import EditorBackground from './editor-background';
import EditorEmoji from './editor-emoji';

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

import classnames from 'classnames';

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
            activeTab: 'text'
        };
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

    componentDidMount = () => {

        let canvas = this._sketch._fc;

        fabric.Canvas.prototype.customiseControls({
            tl: {action: 'rotate',cursor: 'pointer'},
            tr: {action: 'scale'},
            bl: {action: function (event, obj) {
                canvas.remove(obj);
                },cursor: 'pointer'},
            br: {action: 'moveUp',cursor: 'pointer'}
        });

        fabric.Object.prototype.customiseCornerIcons({
            settings: {
                borderColor: '#a9a9a9',
                cornerSize: 32,
                cornerShape: 'rect',
                cornerBackgroundColor: 'transparent',
                cornerPadding: 0
            },
            tl: {icon: ControlIconRotate},
            tr: {icon: ControlIconTransform},
            bl: {icon: ControlIconRemove},
            br: {icon: ControlIconMove},
            mt: {icon: ControlIconVer},
            mb: {icon: ControlIconVer},
            ml: {icon: ControlIconHor},
            mr: {icon: ControlIconHor}
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
    };

    toggleTabs(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

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
                                fillColor='#ffffff'
                                backgroundColor='#ffffff'
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
                        <Col lg={12}>
                            <Nav tabs id="sketch_tools">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === 'text' })}
                                             onClick={() => { this.toggleTabs('text'); }} >
                                        <div className="wrapper-icon">
                                            <img src={TextSprite}/>
                                        </div>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === 'image' })}
                                             onClick={() => { this.toggleTabs('image'); }} >
                                        <div className="wrapper-icon">
                                            <img src={ImageSprite}/>
                                        </div>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === 'background' })}
                                             onClick={() => { this.toggleTabs('background'); }} >
                                        <div className="wrapper-icon">
                                            <img src={ColorSprite}/>
                                        </div>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === 'link' })}
                                             onClick={() => { this.toggleTabs('link'); }} >
                                        <div className="wrapper-icon">
                                            <img src={LinkSprite}/>
                                        </div>
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Col>
                        <Col lg={12}>
                            <TabContent activeTab={this.state.activeTab} >
                                <TabPane tabId="text">
                                    <h3>Text settings</h3>
                                    <EditorText settings={this.props.settings} editor={this} />
                                </TabPane>
                                <TabPane tabId="image">
                                    <h3>Choose a file to upload</h3>
                                    <EditorImage settings={this.props.settings} editor={this} />
                                </TabPane>
                                <TabPane tabId="background">
                                    <h3>Background</h3>
                                    <EditorBackground settings={this.props.settings} editor={this} />
                                </TabPane>
                                <TabPane tabId="link">
                                    <h3>Link</h3>
                                    <EditorEmoji settings={this.props.settings} editor={this} />
                                </TabPane>
                            </TabContent>
                        </Col>
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