import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import HelpIcon from '@mui/icons-material/Help';
import DescriptionIcon from '@mui/icons-material/Description';
import PolicyIcon from '@mui/icons-material/Policy';
import GroupIcon from '@mui/icons-material/Group';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const SettingsModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token or user data
    localStorage.removeItem('authToken');
    // Navigate to login page
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          width: '70%',
          height: '70%',
          borderRadius: '1rem',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#0d47a1',
          color: 'white',
          fontSize: '1.5rem',
        }}
      >
        Settings
      </DialogTitle>
      <DialogContent>
        <List>
          {/* Account Section */}
          <ListItem>
            <ListItemText primary={<Typography fontWeight="bold">Account</Typography>} />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Personal Information" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            <ListItemText primary="Change Password" />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* System Section */}
          <ListItem>
            <ListItemText primary={<Typography fontWeight="bold">System</Typography>} />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <Brightness4Icon />
            </ListItemIcon>
            <ListItemText primary="Dark Mode" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <GTranslateIcon />
            </ListItemIcon>
            <ListItemText primary="Language and Region" />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Help & About Section */}
          <ListItem>
            <ListItemText primary={<Typography fontWeight="bold">Help & About</Typography>} />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="User Guide" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Terms of Service" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <PolicyIcon />
            </ListItemIcon>
            <ListItemText primary="Privacy Policy" />
          </ListItem>
          <ListItem button sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Community Standards" />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Logout */}
          <ListItem
            button
            onClick={handleLogout}
            sx={{ '&:hover': { bgcolor: '#fff3e0' } }}
          >
            <ListItemIcon>
              <ExitToAppIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography fontWeight="bold" color="error">
                  Logout
                </Typography>
              }
            />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
