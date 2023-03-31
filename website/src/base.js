import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';

// Icons
import HomeIcon from '@mui/icons-material/Home';

import { capitalize } from '@mui/material';
import Sidebar from './sidebar';

const breadcrumbNameMap = {};

const Base = (props) => {
  const location = useLocation();
  const pathNames = location.pathname.split('/').filter((x) => x);
  const [menuOpen, setMenuOpen] = useState(true);

  const handleMenuCollapseButton = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* https://stackoverflow.com/a/62255054/4982408 */}
      <Box
        sx={{ flexShrink: 0 }}
        style={{
          backgroundColor: '#424242',
          color: 'white',
          fill: 'currentcolor',
        }}
      >
        <Collapse in={menuOpen} orientation="horizontal">
          <Sidebar permissions={props.permissions} />
        </Collapse>
      </Box>
      <Box
        sx={{ flexShrink: 1, flexGrow: 1 }}
        style={{ marginLeft: 15, marginRight: 15 }}
      >
        <Button
          style={{ marginTop: '-15px', marginRight: 25 }}
          variant={menuOpen ? 'outlined' : 'contained'}
          color="secondary"
          size="small"
          onClick={handleMenuCollapseButton}
        >
          {menuOpen ? 'Hide' : 'Show'}&nbsp;Menu
        </Button>
        <h1 style={{ display: 'inline' }}>Orac</h1>
        <Divider />
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="›"
          style={{ marginTop: 10 }}
        >
          <NavLink
            to="/"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon
              sx={{ mr: 0.5 }}
              fontSize="inherit"
              style={{ marginBottom: -2 }}
            />
            Home
          </NavLink>
          {pathNames.map((value, index) => {
            const last = index === pathNames.length - 1;
            const to = `/${pathNames.slice(0, index + 1).join('/')}`;
            let linkText = capitalize(value);
            if (breadcrumbNameMap[to] && breadcrumbNameMap[to].title) {
              linkText = breadcrumbNameMap[to].title;
            }

            return last ? (
              <Typography color="text.primary" key={to}>
                {linkText}
              </Typography>
            ) : (
              <NavLink underline="hover" color="inherit" to={to} key={to}>
                {linkText}
              </NavLink>
            );
          })}
        </Breadcrumbs>
        <Outlet />
        <Divider />
        <div style={{ padding: 5, fontSize: '0.7em', marginTop: 15 }}>
          Copyright 2023
        </div>
      </Box>
    </Box>
  );
};

export default Base;
