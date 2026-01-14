import { useState } from "react"

import { NavLink } from "react-router-dom";
import { FiX, FiMenu } from "react-icons/fi"

export function Navbar() {
  const [navigate, setNavigate] = useState(false);
  return (
    <>
      <header className="flex justify-between items-center p-5 shadow-lg text-white">
        <NavLink to='/home' className="md:text-3xl text-md font-bold cursor-pointer">OSAS Scholarship Application</NavLink>

        <nav className="block">
          <ul className="hidden md:flex gap-10 text-lg font-semibold">
            <li className="hover:shadow-green-300 active:shadow-green-300 shadow-lg p-3 rounded-lg">
              <NavLink to={"/login"}>Admin Login</NavLink>
            </li>
            <li className="hover:shadow-green-300 active:shadow-green-300 shadow-lg p-3 rounded-lg">
              <NavLink to={"/student/login"}>Student Login</NavLink>
            </li>
          </ul>

          <div className="block md:hidden hover:shadow-green-200 shadow-lg p-2 rounded-lg active:shadow-green-200" onClick={
            () => setNavigate((prev) => !prev)
          }>
              {navigate ? <FiX className="text-xl"/> : <FiMenu className="text-xl"/> }
          </div>
        </nav>
      </header>

      <aside className={`${navigate ? "block" : "hidden"} shadow-lg bg-white py-10 px-5 absolute right-5 top-[6rem] rounded-lg`}>
        <ul className="flex flex-col gap-5 text-lg font-semibold">
            <li className="flex justify-center items-center">
            <NavLink to={"/login"} className={({ isActive }) => (
               `p-3 shadow-lg w-full rounded-lg hover:bg-green-500 hover:text-white active:bg-green-500 ${isActive ? "bg-green-500 text-white" : ""}`
              )}>Admin Login</NavLink>
            </li>
            <li>
            <NavLink to={"/student/login"} className={({ isActive }) => (
               `p-3 rounded-lg shadow-lg hover:bg-green-500 hover:text-white active:bg-green-500 ${isActive ? "bg-green-500 text-white" : ""}`
              )}>Student Login</NavLink>
            </li>
          </ul>
      </aside>
    </>
  )
}