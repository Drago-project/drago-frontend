import { NavLink } from "react-router-dom"
import LanguageToggle from "./LanguageToggle"
function NavBar() {
    return (
        <nav>
            <ul>
                 <li><LanguageToggle /></li>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="#">About</NavLink></li>
                <li><NavLink to="#">Contact</NavLink></li>
                <li><NavLink to="/login">Log In</NavLink></li>
                <li><NavLink to="/signup">Sign Up</NavLink></li>
            </ul>
        </nav>
    )
}

export default NavBar
