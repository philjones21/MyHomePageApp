import React from 'react';
import { Constants } from "../Constants";
const arrow = require("../../images/menu_arrow_icon.svg") as string;

export default function ToolBarMenu({ state }) {

  const menuClickListener = () => {
    document.addEventListener<"click">("click", (e) => {
      const target = e.target as HTMLButtonElement;
      const isDropdownButton: boolean= target.matches("[data-dropdown-button]");
      if (!isDropdownButton && target.closest("[data-dropdown]") != null) return;
      if(!isDropdownButton) state.setMenuIsOpenFalse();
    })
  }

  /*
  const buttonListener = () => {
 
        document.addEventListener<"click">("click", (e: MouseEvent) => {
        const target = e.target as HTMLButtonElement;
        const isDropdownButton: boolean= target.matches("[data-dropdown-button]");
        if (!isDropdownButton && target.closest("[data-dropdown]") != null) return;

        let currentDropDown: HTMLDivElement;
        if (isDropdownButton) {
            currentDropDown = target.closest("[data-dropdown]");
            currentDropDown.classList.toggle("active");
        }

        document.querySelectorAll("[data-dropdown].active").forEach((dropdown) => {
            if (dropdown === currentDropDown) return;
            dropdown.classList.remove("active");
        })

    });
    
  }
  buttonListener();
  */

  return (
    <div className={`drop_down ${state.menuIsOpen ? 'active' : 'non-active'}`}  data-dropdown>
      <div className={`menu ${state.menuIsOpen ? 'menu_active' : 'menu_inactive'}`} data-dropdown-button onClick={() => {menuClickListener(); state.setMenuIsOpen();}}>
        <img id="toolbar_menu_svg" src={arrow} alt="toolbar_menu_svg" />
      </div>
      <div className="drop_down_menu drop_down_menu_items">
        <div className="dropdown_links">
          <a className="menu_item" href="#" onClick={() => {state.informationalAlertMessage(`Application Version: ${Constants.APPLICATION_VERSION}`) }}>About</a>
          {state.loggedIn === true && <a className="menu_item" href="#" onClick={() => { state.logout(); }}>Logout</a>}
          </div>
      </div>
    </div>
  );
}