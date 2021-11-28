import React, {useEffect} from "react";
const stars = require("../../images/stars.svg") as string;
const moon = require("../../images/moon.svg") as string;
const sun = require("../../images/sun_opt.svg") as string;

const Paralax = () => {

    const paralaxAnimate = () => {
        const moonElement: HTMLElement = document.querySelector("#moon_image");
        const sunElement: HTMLElement = document.querySelector("#sun_image");


        if (moonElement != null && sunElement != null ) {
            let scrollValue = window.scrollY;
            moonElement.style.left = (scrollValue * 1) + 'px';
            sunElement.style.left = (scrollValue * .6 * -1) + 'px';
            moonElement.style.top = (scrollValue * .4 * -1) + 'px';
            sunElement.style.top = (scrollValue * .25) + 'px';

        }

    }

    useEffect(() => {
        window.addEventListener("scroll", paralaxAnimate);

        return () => {
            window.removeEventListener("scroll", paralaxAnimate);
        }
    });

    return (
        <section id="paralax_container">
            <img id="stars_image" src={stars} alt="" />
            <img id="moon_image" src={moon} alt="" />
	        <img id="sun_image" src={sun} alt="" />
            <a id="arrow_link" href="#main"><div id="arrow"/></a>
        </section>
    );


}
export default Paralax;