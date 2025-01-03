import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoMenu, IoLogOutOutline } from "react-icons/io5";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { logout } from "../../store/actions/authActions";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
      // State to manage whether the menu is open or closed
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const handleNavigate = () => {
        navigate('/Profile');
      };
      // Toggle menu open/close
      const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };
    const handleLogout = () => {
        dispatch(logout()); // Dispatch the logout action
        navigate("/login"); // Redirect to the login page
      };
  return (
    <div className="flex justify-between items-center px-4 py-2">
    <div className="relative">
      {/* Menu Icon Button */}
      <button onClick={toggleMenu} className="h-6 w-6 text-gray-400">
        <IoMenu size={22} />
      </button>

      {/* Dropdown Menu - Shows when isMenuOpen is true */}
      {isMenuOpen && (
        <div className=" fixed left-0  mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg">
          <ul className="space-y-2 p-2">
            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout} // This function will handle the logout action
                className="flex items-center w-full text-left p-2 hover:bg-gray-700 rounded-md"
              >
                <IoLogOutOutline size={20} className="mr-2" /> {/* Logout icon */}
                <span className="text-sm">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
    <div className="flex gap-3">
      <AiOutlineQuestionCircle size={24} className=" text-gray-400" />
      <CgProfile onClick={handleNavigate} size={24} className=" text-gray-400" />
    </div>
  </div>
  )
}

export default Header
