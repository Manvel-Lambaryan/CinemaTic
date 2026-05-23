import { Navigate, Outlet } from "react-router-dom";
import { Register } from "../pages/auth/register/Register";
import { Login } from "../pages/auth/login/Login";
import { CinemaLayout } from "../pages/CinemaLayout";
import { Home } from "../pages/menu/Home";
import { AddMovie } from "../pages/admin/add-movie";
import { Admin } from "../pages/admin/Admin";
import { Movie } from "../pages/menu/movie/Movie";
import MovieList from "../pages/admin/MovieList";
import { NotFound } from "../pages/404/NotFound";
import { Users } from "../pages/admin/AllUsersList";
import { Discover } from "../pages/menu/movie/Discover";
import { AddCinema } from "../pages/admin/AddCinema";
import { Booking } from "../pages/menu/movie/Booking";
import { TicketManagement } from "../pages/admin/TicketManagement";
import MovieCalendar from "../pages/admin/MovieCalendar";
import { UserProfile } from "../pages/menu/UserProfile";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const token = localStorage.getItem("accessToken");
  return !token ? <Outlet /> : <Navigate to="/" replace />;
};

const AdminRoute = () => {
  const isAdmin = useAuthStore.getState().isAdmin;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export const routes = [
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            element: <Admin />,
            children: [
              { index: true, element: <Navigate to="add-movie" replace /> },
              { path: "add-cinema", element: <AddCinema /> },
              { path: "add-movie", element: <AddMovie /> },
              { path: "list", element: <MovieList /> },
              { path: "get-users", element: <Users /> },
              { path: "tickets", element: <TicketManagement /> },
            ],
          },
        ],
      },
      {
        path: "/",
        element: <CinemaLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "movie/:id", element: <Movie /> },
          { path: "movies", element: <Discover /> },
          { path: "calendar", element: <MovieCalendar /> },
          { path: "profile", element: <UserProfile /> },
          { path: "profile/payments", element: <Navigate to="/profile" replace /> },
          { path: "cinema/:cinemaId/:id", element: <Booking /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
