import { Button, TextField } from '@mui/material'
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/user.context';
import { TopBanner } from "../components/TopBanner.component";
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';


export default function CreateTask() {
  const { logOutUser, user, memberID } = useContext(UserContext);
  const [memberName, setMemberName] = useState("");
  const [form, setForm] = useState({
    taskName: "",
    taskDescription: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const client = user.mongoClient("mongodb-atlas");
    const getMember = async () => {
      const collection = client.db("user_data").collection("user_custom_data");
      const member = await collection.findOne({"_id" : memberID});
      setMemberName(member.userName);
    }
    getMember();
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

  const onFormInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const onSubmit = async () => {
    try {
        if(form.taskName === "" || form.taskDescription === "")
            alert("Please make sure to fill out all of the fields.");
        else {
            const client = user.mongoClient("mongodb-atlas");
            const collection = client.db("user_data").collection("tasks");
            await collection.insertOne({"name": form.taskName, "description": form.taskDescription, "isComplete": false, "userDataID": memberID.toString()});
            navigate("/member");
        }
    } catch(error) {
      alert(error);
    }
  };

  const back = () => {
    navigate("/member");
  }

  return (
    <>
        <TopBanner name = {memberName} id = {user.customData.companyID.$numberInt}/>
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
                    Create Task
                </Typography>
            </h1>
            <TextField
                label="Task Name"
                type="text"
                variant="outlined"
                name="taskName"
                value={form.taskName}
                onChange={onFormInputChange}
                style={{ marginBottom: "1rem" }}
            />
            <TextField
                label="Description"
                type="text"
                variant="outlined"
                name="taskDescription"
                value={form.taskDescription}
                onChange={onFormInputChange}
                style={{ marginBottom: "1rem" }}
            />
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