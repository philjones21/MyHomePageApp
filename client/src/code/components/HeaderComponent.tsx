import React from "react";
import { Constants } from "../Constants";

const Header = ({ state }) => {

    const aboutText: string = "Welcome to PJ's Homepage. I'm intending this site to just be a place to " +
    "try out various Web Development things and to post various songs from time to time. " +
    "This Single Page Application was built with React, Typescript, and Node.js. " +
    "It's containerized with Docker and deployed to the Azure cloud. -PJ";

    const contactText: string = "Email: ";

    const menuToggle = () => {
        const menu = document.querySelector(".navigation_menu");
        if (menu != null && menu != undefined) {
            menu.classList.toggle("show");
        }
    }

    return (
        <header>
            <section id="logo">
                <a id="logo_link" href="/">
                    <h1 id="logo1">PJ's</h1>
                    <h2 id="logo2">Homepage</h2>
                </a>
            </section>

            <i className="fa fa-bars x2" onClick={() => menuToggle()}></i>
            <section className="navigation_menu">
                <ul>
                    <li><a 
                            id="about_menu_item" 
                            className="menu_item" 
                            href="#" 
                            onClick={() => { state.informationalAlertTitleAndMessage("About", aboutText)}}
                        >About</a></li>
                    <li><a 
                            id="content_menu_item" 
                            className="menu_item" 
                            href="#" 
                            onClick={() => { state.informationalAlertTitleAndMessage(Constants.CONTACT, contactText)}}    
                        >Contact</a></li>
                    <li><a id="portfolio_menu_item" className="menu_item" >Portfolio</a></li>
                    <li>{state.loggedIn !== true && <a 
                            id="login_menu_item" 
                            className="menu_item" 
                            href="#" onClick={() => { state.resetLoginMessage; state.viewLoginPopup(true);}}
                        >Login</a>}
                        {state.loggedIn === true && <a 
                            id="login_menu_item" 
                            className="menu_item" 
                            href="#" onClick={() => { state.logout();}}
                        >Logout</a>}
                        
                    </li>
                </ul>
                <i className="fa fa-times x2" onClick={() => menuToggle()}></i>
            </section>
        </header>
    );


}
export default Header;