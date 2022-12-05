import { Button } from '@mui/material'
import { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { darken } from '@mui/material/styles';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, pickersDayClasses } from '@mui/x-date-pickers/PickersDay';
import TextareaAutosize from '@mui/material/TextareaAutosize';


const today = new Date();
const todaysDateString = String(today.getFullYear()) + "-" + 
  String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0") + "T00:00"
const defaultLocationText = "Enter in a location.";
const defaultNotesText = "Provide notes and/or a description of an event/job.";

export default function Member() {
  const { logOutUser, user, memberID } = useContext(UserContext);
  const [memberName, setMemberName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [locationText, setLocationText] = useState(defaultLocationText);
  const [notesText, setNotesText] = useState(defaultNotesText);
  const [entries, setEntries] = useState([]);
  const [day, setDay] = useState(() =>
    dayjs(todaysDateString)
  );
  const navigate = useNavigate();

  const getEntries = useCallback(() => {
    const run = async () => {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("calendar_entries");
      const calendarEntries = await collection.find({"userDataID": memberID.toString()});
      setEntries(calendarEntries.map((entry) => dayjs(entry.date).toString()));
    }
    run();
  }, [user, memberID]);

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
    getEntries();
  }, [memberID, user, getEntries]);

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

  const saveEntry = async () => {
    const date = new Date("<" + String(day.$y) + "-" + 
      String(day.$M + 1).padStart(2, "0") + "-" + String(day.$D).padStart(2, "0") + ">");
    try {
      if(locationText === defaultLocationText || notesText === defaultNotesText)
        alert("Please edit the entry before saving.");
      else {
        const client = user.mongoClient("mongodb-atlas");
        const collection = client.db("user_data").collection("calendar_entries");
        const entry = await collection.findOne({"userDataID": memberID.toString(), "date": date});
        if(entry) await collection.updateOne({"userDataID": memberID.toString(), "date": date}, { $set : {"location": locationText, "notes": notesText}});
        else await collection.insertOne({"userDataID": memberID.toString(), "date": date, "location": locationText, "notes": notesText});
        getEntries();
        alert("Saved!");
      }
    } catch(error) {
      alert(error);
    }
  }

  const deleteEntry = async () => {
    const date = new Date("<" + String(day.$y) + "-" + 
    String(day.$M + 1).padStart(2, "0") + "-" + String(day.$D).padStart(2, "0") + ">");
    try {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("calendar_entries");
      const entry = await collection.findOne({"userDataID": memberID.toString(), "date": date});
      console.log(entry);
      if(!entry) 
        alert("There is not a saved entry to delete.");
      else {
        await collection.deleteOne({"userDataID": memberID.toString(), "date": date});
        setLocationText(defaultLocationText);
        setNotesText(defaultNotesText);
        getEntries();
        alert("Deleted!");
      }     
    } catch(error) {
      alert(error);
    }
  }

  const handleDayChange = async (newDay) => {
    const date = new Date("<" + String(newDay.$y) + "-" + 
        String(newDay.$M + 1).padStart(2, "0") + "-" + String(newDay.$D).padStart(2, "0") + ">");
    try {
      const client = user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("calendar_entries");
      const entry = await collection.findOne({"userDataID": memberID.toString(), "date": date});
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
        <TopBanner name = {memberName} id = {user.customData.companyID.$numberInt}/>
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
              <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                Location
              </Typography>
              <TextareaAutosize 
                aria-label="empty textarea"
                placeholder={defaultLocationText}
                value={locationText}
                onChange={ev => setLocationText(ev.target.value)}
                style={{width: "100%", height: 200 }}
              />
              <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                Notes
              </Typography>
              <TextareaAutosize 
                aria-label="empty textarea"
                placeholder={defaultNotesText}
                value={notesText}
                onChange={ev => setNotesText(ev.target.value)}
                style={{width: "100%", height: 200 }}
              />
              <Stack direction="row" style={{ width:"100%" }} spacing={1}>
                <Button variant="contained" onClick={saveEntry}>Save Entry</Button>
                <Button variant="contained" color="error" onClick={deleteEntry}>Delete Entry</Button>
              </Stack>
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
                <Button variant="contained" onClick={back}>Back</Button>
                <Button variant="contained" onClick={createTask}>Create New Task</Button>
                <Button variant="contained" color="error" onClick={removeTasks}>Remove Selected Tasks</Button>
                <Button variant="contained" onClick={logOut}>Logout</Button>
            </Stack>
        </h1>
    </>
  )
}