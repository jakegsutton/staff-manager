import { Button } from '@mui/material'
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';

export default function ManagerHome() {
  const { logOutUser, user, setTeamID } = useContext(UserContext);
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const getTeams = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("teams");
      const teams = await collection.find({"companyID" : +user.customData.companyID.$numberInt});
      setTeams(teams.map((team, index) => {    
        return (({_id, name, description}) => ({id: index+1, _id, name, description}))(team);
      }));
    }
    getTeams();
  }, [user]);

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

  const deleteTeams = async () => {
    try {
      if(teams.length === 0 || selected.length === 0)
        alert("There are no teams selected.");
      else {
        const ids = teams.filter(team => selected.includes(team.id)).map(team => team._id);
        const client = user.mongoClient("mongodb-atlas");
        const users_collection = client.db("user_data").collection("user_custom_data");
        const teams_collection = client.db("user_data").collection("teams");
        await teams_collection.deleteMany({ _id : { $in : ids} });
        await users_collection.updateMany({"teamID": { $in: ids.map(id => id.toString())}}, { $set: { "teamID": "" }})
        setTeams(teams.filter(team => !selected.includes(team.id)))
      }
    } catch (error) {
      alert(error);
    }
  }

  const createTeam = () => {
    navigate("/create-team");
  }

  const selectionChangeEvent = (params) => {
    setSelected(params);
  }

  const rowClickEvent = (params) => {
    setTeamID(params.row._id);
    navigate("/team");
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Team Name", width: 200},
    { field: "description", headerName: "Description", width: 5000}
  ];

  return (
    <>
        <TopBanner name = {user.customData.companyName} id = {user.customData.companyID.$numberInt}/>
        <h1>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Teams:
          </Typography>
        </h1>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "skyblue"
              }
            }}
            rows={teams}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={rowClickEvent}
            onSelectionModelChange={selectionChangeEvent}
            checkboxSelection
          />
        </div>
        <h1>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={createTeam}>Create New Team</Button>
            <Button variant="contained" color="error" onClick={deleteTeams}>Delete Selected Teams</Button>
            <Button variant="contained" onClick={logOut}>Logout</Button>
          </Stack>
        </h1>
    </>
  )
}