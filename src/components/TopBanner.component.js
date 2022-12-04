import React, { Component } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export class TopBanner extends Component {

  render() {
    const displayCompanyInfo = this.props.name && this.props.id;
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Staff Manager
                    </Typography>
                    <Typography variant="h6" component="div">
                      {this.props.name} {displayCompanyInfo ? '|' : ''} {this.props.id}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
  }
}