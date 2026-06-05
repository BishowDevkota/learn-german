import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  let users: { _id: string; name: string; email: string; role: string; xp: number; level: number }[] = [];
  try {
    await connectDB();
    const docs = await User.find().sort({ createdAt: -1 }).limit(200).lean();
    users = docs.map((u) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      xp: u.xp,
      level: u.level,
    }));
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} registered user(s).</p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
