import { NavLink } from "react-router-dom"
import LanguageToggle from "./LanguageToggle"
function NavInside() {
    return (
        <nav>
            <img src="web-logo.png" />
            <ul>
                <li><NavLink to="/home">Home</NavLink></li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><LanguageToggle /></li>
            </ul>
        </nav>
    )
}

export default NavInside
