import { Button } from '@mui/material'
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { darken } from '@mui/material/styles';

export default function Member() {
  const { logOutUser, user, memberID } = useContext(UserContext);
  const [memberName, setMemberName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const client = user.mongoClient("mongodb-atlas");
    const getMember = async () => {
      const collection = client.db("user_data").collection("user_custom_data");
      const member = await collection.findOne({"_id" : memberID});
      setMemberName(member.userName);
    }
    const getTasks = async () => {
        const collection = client.db("user_data").collection("tasks");
        const tasks = await collection.find({"userDataID": memberID.toString()});
        setTasks(tasks.map((task, index) => {
            return (({_id, name, description, isComplete}) => ({id: index+1, _id, task: name, description, complete: isComplete}))(task);
        }));
    }
    getMember();
    getTasks();
  }, [memberID, user]);

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

  const removeTasks = async () => {
    try {
      if(tasks.length === 0 || selected.length === 0)
        alert("There are no tasks selected.");
      else {
        const ids = tasks.filter(task => selected.includes(task.id)).map(task => task._id);
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("tasks");
        await collection.deleteMany({ _id : { $in : ids }});
        setTasks(tasks.filter(task => !selected.includes(task.id)))
      }
    } catch (error) {
      alert(error);
    }
  }

  const selectionChangeEvent = (params) => {
    setSelected(params);
  }

  const back = () => {
    navigate("/team");
  }

  const createTask = () => {
    navigate("/create-task");
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "complete", type: 'boolean', headerName: "Complete", width: 100},
    { field: "task", headerName: "Task", width: 500},
    { field: "description", headerName: "Description", width: 5000}
  ];

  return (
    <>
        <TopBanner name = {memberName} id = {user.customData.companyID.$numberInt}/>
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
                    // onRowClick={rowClickEvent}
                />
            </Box>
        </div>
        <h1>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={back}>Back</Button>
                <Button variant="contained" onClick={createTask}>Create New Task</Button>
                <Button variant="contained" color="error" onClick={removeTasks}>Remove Selected Tasks</Button>
                <Button variant="contained" onClick={logOut}>Logout</Button>
            </Stack>
        </h1>
    </>
  )
}