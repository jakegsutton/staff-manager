import { useLocation, useNavigate } from "react-router-dom";
import { TopBanner } from "../components/TopBanner.component";
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from "@mui/material/IconButton";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Typography from "@mui/material/Typography";

const Choose = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToStaffSignup = () => {
    const redirectTo = location.search.replace("?redirectTo=", "");
    navigate(redirectTo ? redirectTo : "/staff-signup");
  }

  const redirectToManagerSignup = () => {
    const redirectTo = location.search.replace("?redirectTo=", "");
    navigate(redirectTo ? redirectTo : "/manager-signup");
  }

  return (  
            <div>
                <TopBanner/>
                <h1>            
                    <Typography variant="h4" align="center">
                        Select a User Type
                    </Typography>
                </h1>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ minHeight: '50vh'}}
                >
                    <Grid item xs={3}>
                        <Stack direction="row" spacing={10}>
                            <IconButton variant="contained" onClick={redirectToStaffSignup}>
                                <AccountBoxIcon sx={{ width: 300, height: 300, color: "#1976d2"}} />
                                    <Typography variant="h4" align="center" color="black">
                                        Staff
                                    </Typography>
                            </IconButton>
                            <IconButton variant="contained" onClick={redirectToManagerSignup}>
                                <AccountBoxIcon sx={{ width: 300, height: 300, color: "#1976d2"}} />
                                    <Typography variant="h4" align="center" color="black">
                                        Manager
                                    </Typography>
                            </IconButton>
                        </Stack>
                    </Grid>   
                </Grid>
            </div>
    )
}

export default Choose;