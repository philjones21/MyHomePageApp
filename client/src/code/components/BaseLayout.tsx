import React, { Component } from "react";
import { createState } from "../State";
import { Constants } from "../Constants";
import PhotoAlbums from "./PhotoAlbumComponent";
import Photos from "./PhotoComponent";
import Login from "./LoginComponent";
import Register from "./RegisterComponent";
import ToolBarMenu from "./ToolBarMenuComponent";
import InformationalMessageDialog from "./InformationalMessageDialog";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TabComponent from './TabComponent';
import Blog from "./BlogComponent";

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
                <section className="appContainer" >

                    <Dialog open={this.state.pleaseWaitVisible} disableBackdropClick={true} disableEscapeKeyDown={true}
                        transitionDuration={0}>
                        <DialogTitle style={{ textAlign: "center" }}>Please Wait</DialogTitle>
                        <DialogContent><DialogContentText>...Contacting Server...</DialogContentText></DialogContent>
                    </Dialog>

                    <section id="toolbar">
                        <div id="toolbar_row1"></div>
                        <a id="tool_bar_logo_link" onClick={() => { this.state.viewBlog();this.state.setTabIndex(0);}}><div id="toolbar_logo_title"></div></a>
                        <div id="toolbar_login">
                            {this.state.loggedIn !== true && <a onClick={() => { this.state.resetLoginMessage; this.state.viewLoginPopup(true) }}><AccountCircleIcon/></a>}
                        </div>
                        <div id="toolbar_menu"><ToolBarMenu state={this.state} /></div>
                    </section>

                    <section id="content">
                        <div id="tab_container"><TabComponent state={this.state}/></div>
                        {this.state.currentView === Constants.BLOG_VIEW && <Blog state={this.state} />}
                        {this.state.currentView === Constants.ALBUMS_VIEW && <PhotoAlbums state={this.state} />}
                        {this.state.currentView === Constants.PHOTOS_VIEW && <Photos state={this.state} />}

                        <Login state={this.state} />
                        <Register state={this.state} />
                        <InformationalMessageDialog state={this.state} />
                    </section>
                    <section id="footer">
                        <section id="footer_image"></section>
                    </section>
                </section>
        )
    }
}

export default BaseLayout;

