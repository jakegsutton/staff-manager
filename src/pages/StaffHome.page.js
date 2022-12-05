import { Button } from '@mui/material'
import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import { ObjectId } from "bson";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { darken } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

export default function StaffHome() {
  const { logOutUser, user } = useContext(UserContext);
  const [teamName, setTeamName] = useState("");
  const [selected, setSelected] = useState([]);
  const [tasks, setTasks] = useState([]);

  const getTasks = useCallback(() => {
    const run = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("tasks");
      const tasks = await collection.find({"userDataID": user.customData._id.toString()});
      setTasks(tasks.map((task, index) => {
          return (({_id, name, description, isComplete}) => ({id: index+1, _id, task: name, description, complete: isComplete}))(task);
      }));
    }
    run();
  }, [user]);

  useEffect(() => {
    const client = user.mongoClient("mongodb-atlas");
    const getTeam = async () => {
      const collection = client.db("user_data").collection("teams");
      const team = await collection.findOne({"_id" : ObjectId(user.customData.teamID)});
      setTeamName(team.name);
    }
    getTeam();
    getTasks();
  }, [user, getTasks]);

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

  const selectionChangeEvent = (params) => {
    setSelected(params);
  }

  const markComplete = async () => {
    try {
      if(tasks.length === 0 || selected.length === 0)
        alert("There are no tasks selected.");
      else {
        const ids = tasks.filter(task => selected.includes(task.id)).map(task => task._id);
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("tasks");
        await collection.updateMany({ _id : { $in : ids }}, { $set: {"isComplete": true}});
        getTasks();
      }
    } catch (error) {
      alert(error);
    }
  }

  const markIncomplete = async () => {
    try {
      if(tasks.length === 0 || selected.length === 0)
        alert("There are no tasks selected.");
      else {
        const ids = tasks.filter(task => selected.includes(task.id)).map(task => task._id);
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("tasks");
        await collection.updateMany({ _id : { $in : ids }}, { $set: {"isComplete": false}});
        getTasks();
      }
    } catch (error) {
      alert(error);
    }
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "complete", type: 'boolean', headerName: "Complete", width: 100},
    { field: "task", headerName: "Task", width: 500},
    { field: "description", headerName: "Description", width: 5000}
  ];

  return (
    <>
        <TopBanner name = {user.customData.userName} id = {+user.customData.companyID.$numberInt} team = {teamName} />
        <h1>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Tasks
            </Typography>
        </h1>
        <div style={{ height: 400, width: '100%' }}>
            <Box
                sx={{
                height: 400,
                width: '100%',
                '& .Completed': {
                    bgcolor: (theme) => theme.palette.success.light,
                    '&:hover': {
                        bgcolor: (theme) => darken(theme.palette.success.light, .1)
                    },
                },
                }}
            >
                <DataGrid
                    rows={tasks}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    getRowClassName={(params) => params.row.complete ? 'Completed' : ''}
                    onSelectionModelChange={selectionChangeEvent}
                />
            </Box>
        </div>
        <h1>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={logOut}>Logout</Button>
            <Button variant="contained" onClick={markComplete}>Mark Selected Tasks as Complete</Button>
            <Button variant="contained" onClick={markIncomplete}>Mark Selected Tasks as Incomplete</Button>
          </Stack>
        </h1>
    </>
  )
}