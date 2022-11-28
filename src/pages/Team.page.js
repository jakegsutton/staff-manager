import { Button } from '@mui/material'
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';

export default function CreateTeam() {
  const { logOutUser, teamID, user } = useContext(UserContext);
  const [teamName, setTeamName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getTeam = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("teams");
      const team = await collection.find({"_id" : teamID});
      setTeamName(team[0].name);
    }
    getTeam();
  }, [teamID, user]);

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

  const back = () => {
    navigate("/manager-home");
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "userName", headerName: "User Name", width: 200},
  ];

  const names = [
    { id: 1, userName: "Test User 1"}
  ];
  
  //Right now all values are hardcoded
  return (
    <>
        <TopBanner name = {teamName} id = {user.customData.companyID.$numberInt} />
        <h1>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Tasks Complete: {0}%
          </Typography>
        </h1>
        <h1>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Members:
          </Typography>
        </h1>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={names}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            // onRowClick={rowClickEvent}
          />
        </div>
        <h1>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={back}>Back</Button>
                <Button variant="contained" onClick={logOut}>Logout</Button>
            </Stack>
        </h1>
    </>
  )
}