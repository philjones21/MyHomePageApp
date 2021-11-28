import React, { useEffect } from "react";
const stars = require("../../images/stars.svg") as string;
const saturn = require("../../images/saturn_opt.svg") as string;
const neptune = require("../../images/neptune_opt.svg") as string;

const Paralax = () => {

    const paralaxAnimate = () => {
        const saturnElement: HTMLElement = document.querySelector("#saturn_image");
        const neptuneElement: HTMLElement = document.querySelector("#neptune_image");


        if (saturnElement != null && neptuneElement != null) {
            let scrollValue = window.scrollY;
            neptuneElement.style.left = (scrollValue * 1 * -1) + 'px';
            saturnElement.style.left = (scrollValue * 1) + 'px';
            neptuneElement.style.top = (scrollValue * .1) + 'px';
            saturnElement.style.top = (scrollValue * .1) + 'px';

        }

    }

    useEffect(() => {
        window.addEventListener("scroll", paralaxAnimate);

        return () => {
            window.removeEventListener("scroll", paralaxAnimate);
        }
    });

    return (
        <section id="paralax2_container">
            <img id="stars_image" src={stars} alt="" />
            <img id="saturn_image" src={saturn} alt="" />
            <img id="neptune_image" src={neptune} alt="" />
        </section>
    );


}
export default Paralax;