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
  const [teams, setTeams] = useState({});

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

  const createTeam = () => {
    navigate("/create-team");
  }

  const rowClickEvent = (params) => {
    setTeamID(params.row._id);
    navigate('/team')
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
            rows={teams}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={rowClickEvent}
          />
        </div>
        <h1>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={createTeam}>Create New Team</Button>
            <Button variant="contained" onClick={logOut}>Logout</Button>
          </Stack>
        </h1>
    </>
  )
}