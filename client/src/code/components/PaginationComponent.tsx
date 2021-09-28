import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';


const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& > * + *': {
        marginTop: theme.spacing(2),
      },

    },
  }),
);

/**
* This is a MaterialUI component that can be re-used for components that need Pagination
* functionality like the PhotoAlbum and Blog components. If a future component needs Pagination
* then the start and end indexes will need to be updated. See state.setDisplayForPagination().
*/
export default function PaginationControl({ state, totalPages }) {
  const classes = useStyles();
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    state.setPaginationPage(value);
    state.setDisplayForPagination(value);
  };

  return (
    <div className={classes.root}>
      <Pagination variant="outlined" shape="rounded" count={totalPages} page={state.paginationPage} onChange={handleChange} />
    </div>
  );
}