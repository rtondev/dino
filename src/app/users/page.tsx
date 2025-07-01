"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/components/lib/store";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  age: number;
  institution: string;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.user_type !== "admin") {
      router.replace("/dashboard");
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Usuário excluído!");
      setUsers(users.filter(u => u.id !== id));
    } catch {
      toast.error("Erro ao excluir usuário");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleChangeType(id: number, newType: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/users/${id}/type`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_type: newType })
      });
      if (!res.ok) throw new Error();
      toast.success("Tipo de usuário atualizado!");
      setUsers(users.map(u => u.id === id ? { ...u, user_type: newType } : u));
    } catch {
      toast.error("Erro ao atualizar tipo");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="w-full border text-sm bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Email</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2 text-center">{u.id}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    value={u.user_type}
                    disabled={updatingId === u.id}
                    onChange={e => handleChangeType(u.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(u.id)}
                    loading={updatingId === u.id}
                    disabled={updatingId === u.id}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 