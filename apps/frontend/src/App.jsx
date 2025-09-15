import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./Components/Body";
import Login from "./Components/Login";
import Profile from "./Components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./Components/Feed";
import Connections from "./Components/Connections";
import Requests from "./Components/Requests";
import Sent from "./Components/Sent";
import Landing from "./Components/Landing";

function App() {
	return (
		<>
			<Provider store={appStore}>
				<BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
					<Routes>
						<Route path="/" element={<Body />}>
							<Route index element={<Landing />} />
							<Route path="/feed" element={<Feed />} />
							<Route path="/login" element={<Login />} />
							<Route path="/profile" element={<Profile />} />
							<Route path="/connections" element={<Connections />} />
							<Route path="/requests" element={<Requests />} />
							<Route path="/sent" element={<Sent />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</Provider>
		</>
	);
}

export default App;
