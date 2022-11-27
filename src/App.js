
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/user.context";
import StaffHome from "./pages/StaffHome.page";
import ManagerHome from "./pages/ManagerHome.page";
import Login from "./pages/Login.page";
import PrivateRoute from "./pages/PrivateRoute.page";
import ManagerSignup  from "./pages/ManagerSignup.page";
import StaffSignup  from "./pages/StaffSignup.page";
import Choose from "./pages/ChooseAccountType.page";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/manager-signup" element={<ManagerSignup />} />
          <Route exact path="/staff-signup" element={<StaffSignup />} />
          <Route exact path="/choose-account-type" element={<Choose />} />
          <Route element={<PrivateRoute />}>
            <Route exact path="/" element={<ManagerHome />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route exact path="/manager-home" element={<ManagerHome />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route exact path="/staff-home" element={<StaffHome />} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;