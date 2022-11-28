import { Button, TextField } from '@mui/material'
import { useContext, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

export default function CreateTeam() {
  const { logOutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    teamName: "",
    teamDescription: ""
  });

  const logOut = async () => {
    try {
      const loggedOut = await logOutUser();
      if (loggedOut) {
        window.location.reload(true);
      }
    } catch (error) {
      alert(error)
    }
  }

  const onFormInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const back = () => {
    navigate("/manager-home");
  }

  const onSubmit = async (event) => {
  };

  return (
    <>
        <TopBanner/>
        <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
            <h1>            
                <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    Create Team
                </Typography>
            </h1>
            <TextField
              label="Team Name"
              type="text"
              variant="outlined"
              name="teamName"
              value={form.teamName}
              onChange={onFormInputChange}
              style={{ marginBottom: "1rem" }}
            />
            <TextField
              label="Description"
              type="text"
              variant="outlined"
              name="teamDescription"
              value={form.teamDescription}
              onChange={onFormInputChange}
              style={{ marginBottom: "1rem" }}
            />
            <Button variant="contained" color="primary" onClick={onSubmit}>
                Save
            </Button>
        </form>
        <h1>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={back}>Back</Button>
                <Button variant="contained" onClick={logOut}>Logout</Button>
            </Stack>
        </h1>
    </>
  )
}