import React, { Component } from "react";
import { createState } from "../State";
import { Constants } from "../Constants";
import PhotoAlbums from "./PhotoAlbumComponent";
import Photos from "./PhotoComponent";
import Login from "./LoginComponent";
import Register from "./RegisterComponent";
import InformationalMessageDialog from "./InformationalMessageDialog";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TabComponent from './TabComponent';
import Blog from "./BlogComponent";
import Header from "./HeaderComponent";
import Paralax from "./ParalaxComponent";
import Paralax2 from "./Paralax2Component";
import "core-js";
const stars = require("../../images/stars.svg") as string;
const saturn = require("../../images/saturn_opt.svg") as string;
const neptune = require("../../images/neptune_opt.svg") as string;


/**
* This is the top level component that initiates the calls to all other child
* components. BaseLayout is called from main.tsx.
*/
class BaseLayout extends Component {
    /**
    * State gets created 1 time and is passed down to all other child components that need to reference state
    * fields or state mutator functions.
    */
    state = createState(this);

    render() {

        return (
            <section className="main_container">
                <section className="open">
                    <section className="swipe_animation"></section>
                </section>

                <Header state={this.state} />
                <Paralax />
                <section id="appContainer">
                    <Paralax2 />
                    <section className="main" id="main">
                        <section className="content" id="content">
                            <div id="tab_container"><TabComponent state={this.state} /></div>
                            {this.state.currentView === Constants.BLOG_VIEW && <Blog state={this.state} />}
                            {this.state.currentView === Constants.ALBUMS_VIEW && <PhotoAlbums state={this.state} />}
                            {this.state.currentView === Constants.PHOTOS_VIEW && <Photos state={this.state} />}

                            <Login state={this.state} />
                            <Register state={this.state} />
                            <InformationalMessageDialog state={this.state} />
                        </section>


                        <Dialog open={this.state.pleaseWaitVisible} disableBackdropClick={true} disableEscapeKeyDown={true}
                            transitionDuration={0}>
                            <DialogTitle style={{ textAlign: "center" }}>Please Wait</DialogTitle>
                            <DialogContent><DialogContentText>...Contacting Server...</DialogContentText></DialogContent>
                        </Dialog>
                    </section>
                </section>
            </section>
        )
    }
}

export default BaseLayout;

