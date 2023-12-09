import React from 'react';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

// Icons
// https://mui.com/material-ui/material-icons/
import HomeIcon from '@mui/icons-material/Home';

import SiteIcon from './images/orac.svg';

const Sidebar = () => {
  const NavLinkStyle = {
    textDecoration: 'none',
    color: 'white',
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  };

  const IconTheme = {
    color: 'white',
  };

  const DividerTheme = { backgroundColor: 'rgba(255, 255, 255, 0.12)' };

  return (
    <Box
      id="sidebar"
      sx={{
        width: '100%',
        maxWidth: 360,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <img src={SiteIcon} alt="logo" style={{ width: 100, margin: 'auto' }} />
      </Stack>
      <Divider style={DividerTheme} />
      <nav aria-label="main mailbox folders">
        <List>
          <NavLink to="/" style={NavLinkStyle}>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon style={IconTheme} />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
          </NavLink>
        </List>
      </nav>
    </Box>
  );
};

export default Sidebar;
