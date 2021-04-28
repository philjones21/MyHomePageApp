import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

/**
* This is a MaterialUI component that is used specifically by the BlogEntry component rows.
* Only the original author has ability to change the Blog post.
*/

export default function BlogMenu({state, blogId, originalAuthor}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div id="blogMenu2">
      <IconButton  aria-controls="blog-row-menu" aria-haspopup="true" onClick={handleClick} color="primary" component="span">
          <MenuIcon />
        </IconButton>
      <Menu
        id="blog-row-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={()=>{handleClose;state.deleteBlog({blogId},{originalAuthor});}}>Delete Post</MenuItem>
      </Menu>
    </div>
  );
}