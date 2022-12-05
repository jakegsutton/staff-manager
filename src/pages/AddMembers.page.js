import { Button } from '@mui/material'
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import { useNavigate } from "react-router-dom";
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function AddMembers() {
  const { logOutUser, teamID, user } = useContext(UserContext);
  const [available, setAvailable] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [form, setForm] = useState({
    newMembers: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const client = user.mongoClient("mongodb-atlas");
    const getMembers = async () => {
      const collection = client.db("user_data").collection("user_custom_data");
      const availableStaff = await collection.find({"companyID": +user.customData.companyID.$numberInt, "teamID": ""});
      setAvailable(availableStaff.map((staff) => {
        return (({userName}) => (userName))(staff);
      }));
    }
    const getTeam = async () => {
      const collection = client.db("user_data").collection("teams");
      const team = await collection.findOne({"_id" : teamID});
      setTeamName(team.name);
    }
    getTeam();
    getMembers();
  }, [teamID, user]);

  // This function is called when the user clicks the "Logout" button.
  const logOut = async () => {
    try {
      // Calling the logOutUser function from the user context.
      const loggedOut = await logOutUser();
      // Now we will refresh the page, and the user will be logged out and
      // redirected to the login page because of the <PrivateRoute /> component.
      if (loggedOut) {
        window.location.reload(true);
      }
    } catch (error) {
      alert(error)
    }
  }

  const back = () => {
    navigate("/team");
  }

  const onFormInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const onSubmit = async () => {
    console.log(form);
    try {
      if(form.newMembers.length === 0)
        alert("Please select new members before saving.");
      else {
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("user_custom_data");
        await collection.updateMany({"userName": { $in: form.newMembers}}, { $set: { "teamID": teamID.toString() }});
        navigate("/team");
      }
    } catch(error) {
      alert(error);
    }
  }

  return (
    <>
        <TopBanner name = {teamName} id = {user.customData.companyID.$numberInt}/>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "300px",
            margin: "auto"
          }}
        >
          <h1>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Add Members
            </Typography>
          </h1>
          <FormControl
            style={{ marginBottom: "1rem" }}
          >
          <InputLabel id="demo-multiple-checkbox-label">Select Members</InputLabel>
          <Select
            name="newMembers"
            multiple
            value={form.newMembers}
            onChange={onFormInputChange}
            input={<OutlinedInput label="Select Members" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {available.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={form.newMembers.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={onSubmit}>
            Save
          </Button>
        </form>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={back}>Back</Button>
          <Button variant="contained" onClick={logOut}>Logout</Button>
        </Stack>
    </>
  )
}