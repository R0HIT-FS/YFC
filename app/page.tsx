import UsersClient from "../components/UserClient";

async function getUsers() {
  const res = await fetch("http://localhost:3000/api/users", {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const data = await getUsers();
  const users = data.users || [];
  return <UsersClient users={users} />;
}