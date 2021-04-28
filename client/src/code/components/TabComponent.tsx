import React from 'react';
import { makeStyles, withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

interface StyledTabsProps {
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const StyledTabs = withStyles({
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > span': {
      maxWidth: 40,
      width: '100%',
      backgroundColor: '#6343A0',
    },
  },
})((props: StyledTabsProps) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

interface StyledTabProps {
  label: string;
}

const StyledTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: '#fff',
      fontWeight: theme.typography.fontWeightRegular,
      fontSize: theme.typography.pxToRem(15),
      marginRight: theme.spacing(1),
      '&:focus': {
        opacity: 1,
      },
    },
  }),
)((props: StyledTabProps) => <Tab disableRipple {...props} />);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  padding: {
    padding: theme.spacing(0),
  },
  tabs: {
    backgroundColor: "none",
  },
}));

/**
* MaterialUI Tab component.
*/
export default function CustomizedTabs({state}) {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    state.setTabIndex(newValue);

    switch(newValue){
      case 0:
        state.viewBlog();
        break;
      case 1:
        state.viewPhotoAlbums();
        break;
      default:
        state.viewBlog();
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.tabs}>
        <StyledTabs value={state.tabIndex} onChange={handleChange} aria-label="styled tabs example">
          <StyledTab label="Blog" />
          <StyledTab label="Photo Albums" />
        </StyledTabs>
        <Typography className={classes.padding} />
      </div>
    </div>
  );
}
