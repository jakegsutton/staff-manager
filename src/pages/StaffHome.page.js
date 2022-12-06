import { Button } from '@mui/material'
import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import { ObjectId } from "bson";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, pickersDayClasses } from '@mui/x-date-pickers/PickersDay';

const today = new Date();
const todaysDateString = String(today.getFullYear()) + "-" + 
  String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0") + "T00:00"
const defaultLocationText = "No location entry for this date.";
const defaultNotesText = "No notes entry for this date.";

export default function StaffHome() {
  const { logOutUser, user } = useContext(UserContext);
  const [teamName, setTeamName] = useState("");
  const [selected, setSelected] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [locationText, setLocationText] = useState(defaultLocationText);
  const [notesText, setNotesText] = useState(defaultNotesText);
  const [entries, setEntries] = useState([]);
  const [day, setDay] = useState(() =>
    dayjs(todaysDateString)
  );

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

  const getEntries = useCallback(() => {
    const run = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("calendar_entries");
      const calendarEntries = await collection.find({"userDataID": user.customData._id.toString()});
      setEntries(calendarEntries.map((entry) => dayjs(entry.date).toString()));
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
    getEntries();
  }, [user, getTasks, getEntries]);

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

  const handleDayChange = async (newDay) => {
    const date = new Date("<" + String(newDay.$y) + "-" + 
        String(newDay.$M + 1).padStart(2, "0") + "-" + String(newDay.$D).padStart(2, "0") + ">");
    try {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("calendar_entries");
      const entry = await collection.findOne({"userDataID": user.customData._id.toString(), "date": date});
      if(entry) {
        setLocationText(entry.location);
        setNotesText(entry.notes);
      }
      else {
        setLocationText(defaultLocationText);
        setNotesText(defaultNotesText);
      }
    } catch (error) {
      alert(error);
    }
    setDay(newDay);
    getEntries();
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "complete", type: 'boolean', headerName: "Complete", width: 100},
    { field: "task", headerName: "Task", width: 500},
    { field: "description", headerName: "Description", width: 5000}
  ];

  const renderPickerDay = (date, selectedDates, pickersDayProps) => {
    return (
      <PickersDay
        {...pickersDayProps}
        sx={entries.includes(date.toString()) 
            && !(selectedDates.map((date) => date.toString()).includes(date.toString())) ? { 
          [`&&.${pickersDayClasses.root}`]: {
            backgroundColor: "pink"
          } 
        } : {}}
      />
    );
  }

  return (
    <>
        <TopBanner name = {user.customData.userName} id = {+user.customData.companyID.$numberInt} team = {teamName} />
        <h1>
          <Box display="flex">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticDatePicker
                onChange={handleDayChange}
                value={day}
                renderDay={renderPickerDay}
                renderInput={(params) => <TextField {...params} />}
                componentsProps={{
                  actionBar: {
                    actions: ['today'],
                  },
                }}
              />
            </LocalizationProvider>
            <Stack direction="column" style={{ width:"100%" }} spacing={1}>
              <Typography variant="h4" component="div">
                Location
              </Typography>
              <Box
                component="div"
                sx={{
                  whiteSpace: 'normal',
                  my: 2,
                  p: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  height: "100%",
                  overflow: "auto"
                }}
              >
                <Typography varient="body1" component="div">
                  {locationText}
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                Notes
              </Typography>
              <Box
                component="div"
                sx={{
                  whiteSpace: 'normal',
                  my: 2,
                  p: 1,
                  overflow: "auto",
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  height: "100%"
                }}
              >
                <Typography varient="body1" component="div">
                  {notesText}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </h1>
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
                },
                }}
              >
                <DataGrid
                    sx={{
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "skyblue"
                      }
                    }}
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