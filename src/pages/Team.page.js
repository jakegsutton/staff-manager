import { Button } from '@mui/material'
import { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';


export default function Team() {
  const { logOutUser, teamID, user, setMemberID } = useContext(UserContext);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [percentTaskComplete, setPercentTaskComplete] = useState((0.0).toFixed(2));
  const navigate = useNavigate();

  const calculatePercentTaskComplete = useCallback(() => {
    const run = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const userData = client.db("user_data").collection("user_custom_data");
      const tasks = client.db("user_data").collection("tasks");
      const members = await userData.find({"teamID": teamID.toString()});
      const teamTasks = await tasks.find({"userDataID": { $in: members.map(member => member._id.toString()) }})
      const completedTasks = await teamTasks.filter(task => task.isComplete);
      setPercentTaskComplete(teamTasks.length > 0 ? (completedTasks.length * 1.0 / teamTasks.length * 100).toFixed(2) : (0.0).toFixed(2));
    }
    run();
  }, [user, teamID]);

  useEffect(() => {
    const client = user.mongoClient("mongodb-atlas");
    const getTeam = async () => {
      const collection = client.db("user_data").collection("teams");
      const team = await collection.findOne({"_id" : teamID});
      setTeamName(team.name);
    }
    const getMembers = async () => {
      const collection = client.db("user_data").collection("user_custom_data");
      const members = await collection.find({"teamID": teamID.toString()});
      setMembers(members.map((member, index) => {
        return (({_id, userName})  => ({id: index+1, _id, userName}))(member);
      }));
    }
    getTeam();
    getMembers();
    calculatePercentTaskComplete();
  }, [teamID, user, calculatePercentTaskComplete]);

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

  const removeMembers = async () => {
    try {
      if(members.length === 0 || selected.length === 0)
        alert("There are no members selected.");
      else {
        const ids = members.filter(member => selected.includes(member.id)).map(member => member._id);
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("user_custom_data");
        await collection.updateMany({"_id": { $in: ids}}, { $set: { "teamID": "" }})
        setMembers(members.filter(member => !selected.includes(member.id)))
        calculatePercentTaskComplete();
      }
    } catch (error) {
      alert(error);
    }
  }

  const addMembers = () => {
    navigate("/add-members");
  }

  const selectionChangeEvent = (params) => {
    setSelected(params);
  }

  const rowClickEvent = (params) => {
    setMemberID(params.row._id)
    navigate("/member");
  }

  const back = () => {
    navigate("/manager-home");
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "userName", headerName: "User Name", width: 200},
  ];

  return (
    <>
        <TopBanner name = {teamName} id = {user.customData.companyID.$numberInt} />
        <h1>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Tasks Completed: {percentTaskComplete}%
          </Typography>
        </h1>
        <h1>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Members:
          </Typography>
        </h1>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "skyblue"
              }
            }}
            rows={members}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            onSelectionModelChange={selectionChangeEvent}
            onRowClick={rowClickEvent}
          />
        </div>
        <h1>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={back}>Back</Button>
                <Button variant="contained" onClick={addMembers}>Add Members</Button>
                <Button variant="contained" color="error" onClick={removeMembers}>Remove Selected Members</Button>
                <Button variant="contained" onClick={logOut}>Logout</Button>
            </Stack>
        </h1>
    </>
  )
}