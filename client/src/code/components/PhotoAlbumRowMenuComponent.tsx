import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

/**
* This is a MaterialUI component that is used specifically by the PhotoAlbumRow component rows.
* Only the original author has ability to delete or edit the AlbumRow.
*/
export default function PhotoAlbumRowMenu({state, albumId, originalAuthor}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton  aria-controls="album-row-menu" aria-haspopup="true" onClick={handleClick} color="primary" component="span">
          <MenuIcon />
        </IconButton>
      <Menu
        id="album-row-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={()=>{handleClose;state.deletePhotoAlbum({albumId},{originalAuthor});}}>Delete Album</MenuItem>
      </Menu>
    </div>
  );
}