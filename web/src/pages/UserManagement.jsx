import BottomNav from "../components/BottomNav";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers, updateUser, deleteUser } from "../services/api";
import { getCurrentUser, isOwner } from "../services/auth";
import { useTranslation } from "react-i18next";

function UserManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const owner = isOwner();

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setMessage(`${t("failedToLoadUsers")}: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (isOwner) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isOwner, t]);

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f2] px-4 pb-24">
        <div className="bg-white rounded-[28px] shadow-sm p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-900 mb-3">
            {t("accessDenied")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("onlyOwnerCanManageUsers")}
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            {t("back")}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUser(userId, { role: newRole });

      setUsers((prev) =>
        prev.map((user) =>
          user.ID === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToUpdateUserRole")}: ${error.message}`);
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm(t("areYouSureDeleteUser"));
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.ID !== userId));
    } catch (error) {
      console.error(error);
      setMessage(`${t("failedToDeleteUser")}: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] p-4 pb-24">
      <PageHeader
        title={t("manageUsers")}
        subtitle={t("manageAppUsers")}
        backTo="/profile"
      />

      {loading && <p className="text-green-700">{t("loadingUsers")}</p>}
      {message && <p className="text-red-600 mb-4">{message}</p>}

      {!loading && users.length === 0 && (
        <p className="text-gray-600">{t("noUsersFound")}</p>
      )}

      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div
              key={user.ID}
              className="bg-white rounded-[24px] shadow-sm p-5 border border-green-50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("city")}: {user.city || t("notAvailable")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("country")}: {user.country?.name || t("notAvailable")}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:min-w-[180px]">
                  <select
  value={user.role || "user"}
  onChange={(e) => handleRoleChange(user.ID, e.target.value)}
  className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
  disabled={user.ID === currentUser.ID}
>
  <option value="user">{t("userRole")}</option>
  <option value="admin">{t("adminRole")}</option>
  <option value="owner">{t("ownerRole")}</option>
</select>

                  <button
                    onClick={() => handleDeleteUser(user.ID)}
                    disabled={user.ID === currentUser.ID}
                    className="bg-red-50 text-red-600 py-3 rounded-full font-semibold border border-red-100 disabled:opacity-50"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default UserManagement;