import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import { Constants } from "../Constants"

/**
* This is a MaterialUI component that is used specifically by the top ToolBar component.
*/
export default function ToolBarMenu({ state }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <div>
      <IconButton aria-controls="toolbar-menu" aria-haspopup="true" onClick={handleClick} color="primary" component="span">
        <MenuIcon />
      </IconButton>
      <Menu
        id="toolbar-menu"
        anchorEl={anchorEl}

        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose; state.informationalAlertMessage(`Application Version: ${Constants.APPLICATION_VERSION}`); }}>About</MenuItem>
        {state.loggedIn === true && <MenuItem onClick={() => { handleClose; state.logout(); }}>Logout</MenuItem>}

      </Menu>
    </div>
  );
}