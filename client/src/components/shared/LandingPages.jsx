import university from "../../assets/university.jpg"

import { Navbar, Footer } from "./components";

export function LandingPages() {

  return (
    <>
      <div className="min-h-screen max-w-screen bg-gradient-to-br from-green-800 via-green-700 to-green-800 flex flex-col justify-between gap-10">
        <Navbar/>

        <main className="w-full">
          <section className="p-3 flex md:flex-row flex-col gap-10">
            <img src={university} alt="SKSU images" className="max-h-[60vh] lg:max-h-full md:max-w-[60%] rounded-lg"/>
            <article className="bg-white rounded-lg flex flex-col p-5 items-center gap-10">
              <div className="shadow-lg p-2 rounded-lg flex flex-col gap-5">
                <h1 className="text-lg font-bold w-full text-center md:text-start">Abstact</h1>
                <p>
                  OSAS is a two-part web application that allows students to submit scholarship applications and administrators to review, manage, and notify applicants. It comprises a React + Vite frontend and an Express + MySQL backend with JWT-based authentication and email notifications.
                </p>
              </div>

              <div className="flex flex-col p-2 rounded-lg shadow-lg gap-5">
                <h1 className="text-lg font-bold w-full text-center md:text-start">System Goals</h1>
                <ul className="list-disc list-inside flex flex-col gap-2 ml-5">
                  <li>
                    Provide a centralized, secure workflow for scholarship applications.
                  </li>
                  <li>
                    Enable administrators to review, approve/reject, and manage student records and scholarship offerings.
                  </li>
                  <li>
                    Send automated email notifications for application events.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-5 shadow-lg rounded-lg p-3 w-full">
                <h1 className="font-bold text-center md:text-start w-full">High-level Architecture</h1>
                <ul className="flex flex-col gap-2 ml-5 list-disc list-inside">
                  <li>
                    Client: React (Vite) single-page application (client/).
                  </li>
                  <li>
                    Server: Node.js + Express REST API (server/).
                  </li>
                  <li>
                    Database: MySQL (osas_database) accessed via mysql2.
                  </li>
                  <li>
                    Email: Nodemailer using configured Gmail credentials.
                  </li>
                  <li>
                    Authentication: JWT stored in cookies for admin and student sessions.
                  </li>
                </ul>
              </div>

            </article>
          </section>
        </main>

        <Footer/>
      </div>
    </>
  )
}