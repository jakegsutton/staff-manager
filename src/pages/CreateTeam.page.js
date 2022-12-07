import { Button, TextField } from '@mui/material'
import { useContext, useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
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

export default function CreateTeam() {
  const { logOutUser, user } = useContext(UserContext);
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [form, setForm] = useState({
    teamName: "",
    teamDescription: "",
    teamMembers: []
  });

  useEffect(() => {
    const getMembers = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("user_custom_data");
      const availableStaff = await collection.find({"companyID": +user.customData.companyID.$numberInt, "teamID": ""});
      setAvailable(availableStaff.map((staff) => {
        return (({userName}) => (userName))(staff);
      }));
    }
    getMembers();
  }, [user]);

  const logOut = async () => {
    try {
      const loggedOut = await logOutUser();
      if (loggedOut) {
        navigate("/login");
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

  const onSubmit = async () => {
    try {
      if(form.teamName === "" || form.teamDescription === "" || form.teamMembers.length === 0)
        alert("Please make sure to fill out all of the fields.");
      else {
        const client = user.mongoClient("mongodb-atlas");
        const users = client.db("user_data").collection("user_custom_data");
        const teams = client.db("user_data").collection("teams");
        await teams.insertOne({ name: form.teamName, description: form.teamDescription, companyID: +user.customData.companyID.$numberInt});
        const team = await teams.findOne({"name": form.teamName, "description": form.teamDescription, "companyID": +user.customData.companyID.$numberInt});
        await users.updateMany({"userName": { $in: form.teamMembers}}, { $set: { "teamID": team._id.toString() }});
        navigate("/manager-home");
      }
    } catch(error) {
      alert(error);
    }
  }

  return (
    <>
      <TopBanner name = {user.customData.companyName} id = {user.customData.companyID.$numberInt}/>
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
        <FormControl
          style={{ marginBottom: "1rem" }}
        >
          <InputLabel id="demo-multiple-checkbox-label">Select Members</InputLabel>
          <Select
            name="teamMembers"
            multiple
            value={form.teamMembers}
            onChange={onFormInputChange}
            input={<OutlinedInput label="Select Members" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {available.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={form.teamMembers.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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