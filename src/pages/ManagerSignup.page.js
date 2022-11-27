
import { Button, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/user.context";
import Typography from "@mui/material/Typography";
import { TopBanner } from "../components/TopBanner.component";

const ManagerSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { emailPasswordSignup } = useContext(UserContext);
  const [form, setForm] = useState({
    companyName: "",
    userName: "",
    email: "",
    password: ""
  });

  const onFormInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const redirectNow = () => {
    const redirectTo = location.search.replace("?redirectTo=", "");
    navigate(redirectTo ? redirectTo : "/manager-home");
  }

  const onSubmit = async () => {
    try {
      if(form.userName === "" || form.companyName === "")
        alert("Please make sure to fill out all of the fields.")
      else {
        const user = await emailPasswordSignup(form.email, form.password);
        if (user) {
          const client = user.mongoClient("mongodb-atlas");
          const collection = client.db("user_data").collection("user_custom_data");
          let uniqueID, result;
          do {
            uniqueID = Math.floor(1000 + Math.random() * 8999);
            result = await collection.findOne({companyID: uniqueID});
          } while(result);
          collection.insertOne({ userID: user.id, userName: form.userName, companyName: form.companyName, companyID: uniqueID, isManager: true});
          redirectNow();
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  return( <div>
              <TopBanner/>
              <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
                <h1>
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                        Manager Signup
                    </Typography>
                </h1>
                  <TextField
                    label="User Name"
                    type="text"
                    variant="outlined"
                    name="userName"
                    value={form.userName}
                    onInput={onFormInputChange}
                    style={{ marginBottom: "1rem" }}
                  />
                  <TextField
                    label="Company Name"
                    type="text"
                    variant="outlined"
                    name="companyName"
                    value={form.companyName}
                    onInput={onFormInputChange}
                    style={{ marginBottom: "1rem" }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    name="email"
                    value={form.email}
                    onInput={onFormInputChange}
                    style={{ marginBottom: "1rem" }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    name="password"
                    value={form.password}
                    onInput={onFormInputChange}
                    style={{ marginBottom: "1rem" }}
                  />
                  <Button variant="contained" color="primary" onClick={onSubmit}>
                    Signup
                  </Button>
                <p>Have an account already? <Link to="/login">Login</Link></p>
              </form>
           </div> )
}

export default ManagerSignup;
