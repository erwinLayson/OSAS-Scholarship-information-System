import { useState } from "react"

import { NavLink } from "react-router-dom";
import { FiX, FiMenu } from "react-icons/fi"

export function Navbar() {
  const [navigate, setNavigate] = useState(false);
  return (
    <>
      <header className="flex justify-between items-center p-5 shadow-lg text-white">
        <NavLink to='/home' className="text-3xl font-bold cursor-pointer">OSAS Scholarship Application</NavLink>

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
      <aside className={`${navigate ? "block" : "hidden"} shadow-lg bg-white p-5 fixed right-5 top-[6rem] rounded-lg`}>
        <ul className="flex flex-col gap-5 text-lg font-semibold">
            <li className="w-full hover:shadow-lg p-3 rounded-lg">
              <NavLink to={"/login"}>Admin Login</NavLink>
            </li>
            <li className="hover:shadow-lg active:shadow-lg p-3 rounded-lg">
              <NavLink to={"/student/login"}>Student Login</NavLink>
            </li>
          </ul>
      </aside>
    </>
  )
}