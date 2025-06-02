import "./styles/App.css";
import LandingPage from "./pages/homePage/LandingPage";
import ToolBoxRouter from "./router/ToolBoxRouter";

function App() {
  return (
    <>
      <ToolBoxRouter>
        <LandingPage></LandingPage>
      </ToolBoxRouter>
    </>
  );
}

export default App;
