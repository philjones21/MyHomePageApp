import React, { Component, useState } from "react";
import { Constants } from "../Constants";
import "core-js/stable";
import "regenerator-runtime/runtime";
const logo = require("../../images/logo_icon.svg") as string;


const IntroAnimation = ({ state }) => {

    function rotateAnimation() {

        const logoAnimationListener1 = () => {
            return new Promise<boolean>((inResolve, inReject) => {
                const logoIntro = document.getElementById("logo_intro");
                logoIntro.addEventListener("animationend", () => {
                    inResolve(true);
                }, false);
                logoIntro.className = "logo_animation1";
            });
        }

        logoAnimationListener1().then(() => {
            return new Promise<boolean>((inResolve, inReject) => {
                const logoIntro = document.getElementById("logo_intro");
                logoIntro.addEventListener("animationend", () => {
                    inResolve(true);
                }, false);
                logoIntro.className = "logo_animation2";
            });
        }).then(() => {
            return new Promise<boolean>((inResolve, inReject) => {
                const logo_icon1 = document.getElementById("logo_icon1");
                logo_icon1.style.visibility ="hidden";
                const logoIntro = document.getElementById("logo_intro");
                logoIntro.addEventListener("animationend", () => {
                    state.setCurrentView(Constants.BLOG_VIEW);
                    inResolve(true);
                }, false);
                logoIntro.className = "swipe_animation";
            });
        });
    }

    return (
        <section>
            <div className="intro_animation_container" >
                <div className="logo_intro" id="logo_intro" onLoad={() => rotateAnimation()}>
                    <img id="logo_icon1" src={logo} alt="logo_intro" />
                </div>
            </div>
        </section>
    )


}
export default IntroAnimation;