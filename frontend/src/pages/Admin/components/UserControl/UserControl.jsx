import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  CircleAlert,
  Trash2,
} from "lucide-react";
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
} from "../../../../services/adminService";
import { useAuth } from "../../../../context/AuthContext";
import styles from "../../Admin.module.css";

const PLANS = ["free", "student"];
const ROLES = ["user", "admin"];

export default function UserControl() {
  const { user: me } = useAuth();
  const myId = me?._id || me?.id;

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  async function loadUsers(page) {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminUsers(page, 10);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
  }, []);

  async function handleChange(id, field, value) {
    setSavingId(id);
    setError("");
    try {
      const updated = await updateAdminUser(id, { [field]: value });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...updated } : u)),
      );
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id, name) {
    // confirmed would
    const confirmed = window.confirm(
      `Delete ${name}? This removes their tasks, lessons, and chats too. It can't be undone. `,
    );
    if (!confirmed) return;

    setSavingId(id);
    setError("");
    try {
      await deleteAdminUser(id);
      // Reload the surrent page so pagination stays correct
      await loadUsers(pagination.page);
    } catch (error) {
      setError(error.message || "Failed to delete User");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.error}>
          <CircleAlert size={16} strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.center}>
            <LoaderCircle size={22} strokeWidth={1.5} className={styles.spin} />
          </div>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u._id === myId;
                  const saving = savingId === u._id;

                  return (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td className={styles.muted}>{u.email}</td>
                      <td>
                        <select
                          className={styles.select}
                          value={u.plan}
                          disabled={saving}
                          onChange={(e) =>
                            handleChange(u._id, "plan", e.target.value)
                          }
                        >
                          {PLANS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.select}
                          value={u.role}
                          disabled={saving || isMe}
                          title={
                            isMe ? "You can't change your own role" : undefined
                          }
                          onChange={(e) =>
                            handleChange(u._id, "role", e.target.value)
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={styles.muted}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                        className={styles.deleteBtn}
                        disabled= {saving || isMe}
                        onClick = {()=> handleDelete(u._id, u.name)}
                        title ={isMe ? "You can't delete your own account" : "Delete user"}
                        aria-label = "Delete user">
                          <Trash2 size={16} strokeWidth={1.5}></Trash2>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.pager}>
        <span className={styles.muted}>
          {pagination.total} users · page {pagination.page} of{" "}
          {pagination.totalPages}
        </span>
        <div className={styles.pagerButtons}>
          <button
            className={styles.pagerBtn}
            disabled={pagination.page <= 1 || loading}
            onClick={() => loadUsers(pagination.page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            className={styles.pagerBtn}
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => loadUsers(pagination.page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
