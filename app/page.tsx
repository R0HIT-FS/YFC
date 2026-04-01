import UsersClient from "../components/UserClient";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
async function getUsers() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const data = await getUsers();
  const users = data.users || [];
    useAutoRefresh();
  
  return <UsersClient users={users} />;
}