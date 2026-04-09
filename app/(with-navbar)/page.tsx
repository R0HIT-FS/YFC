import SyncStatus from "@/components/SyncStatus";
import UsersClient from "../../components/UserClient";
async function getUsers() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`, {
    cache: "no-store",
  });
  return res.json();
}

export const metadata = {
  title: "Saviour Of Sinners",
};

export default async function Home() {
  const data = await getUsers();
  const users = data.users || [];
  return (<>
    <SyncStatus/>
    <UsersClient users={users} />
  </>
  );
}