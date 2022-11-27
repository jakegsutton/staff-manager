
import { Button, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/user.context";
import Typography from "@mui/material/Typography";
import { TopBanner } from "../components/TopBanner.component";
import { ADMIN_EMAIL, ADMIN_PASS } from "../realm/constants";

const StaffSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { emailPasswordSignup, emailPasswordLogin } = useContext(UserContext);
  const [form, setForm] = useState({
    userName: "",
    companyID: "",
    email: "",
    password: ""
  });

  const onFormInputChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const redirectNow = () => {
    const redirectTo = location.search.replace("?redirectTo=", "");
    navigate(redirectTo ? redirectTo : "/staff-home");
  }

  const onSubmit = async () => {
    try {
      const admin_user = await emailPasswordLogin(ADMIN_EMAIL, ADMIN_PASS);
      const client = admin_user.mongoClient("mongodb-atlas");
      const collection = client.db("user_data").collection("user_custom_data");
      if(form.userName === "" || form.companyID === "")
        alert("Please make sure to fill out all of the fields.");
      else if(await collection.count({companyID: +form.companyID}) === 0)
        alert("Please enter in a valid company ID provided by your manager.");
      else {  
        const user = await emailPasswordSignup(form.email, form.password);
        if (user) {
          collection.insertOne({ userID: user.id, userName: form.userName, companyID: +form.companyID, isManager: false});
          redirectNow();
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
      <div>
        <TopBanner/>
        <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
          <h1>
              <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                  Staff Signup
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
              label="Company ID"
              type="numeric"
              variant="outlined"
              name="companyID"
              value={form.companyID}
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
    </div>
  )
}

export default StaffSignup;
