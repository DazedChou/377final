import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Toolbar, Typography } from '@mui/material';

const TopNav = ({ tabIndex, setTabIndex }) => {

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <AppBar color="default" position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          377 Final
        </Typography>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Waste Composition" />
          <Tab label="Map" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;